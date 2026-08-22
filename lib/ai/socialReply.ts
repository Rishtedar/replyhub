/**
 * lib/ai/socialReply.ts
 *
 * LLM fallback for inbound DMs (Instagram + Facebook Messenger) that match no
 * Automation keyword. Ported from Rishtedar's lib/agent/socialReply.ts —
 * same idea (recognize casual comments, answer simple questions from a fixed
 * context, redirect anything else to a real conversational channel), but the
 * business context here is per-Workspace configuration
 * (Workspace.llmBusinessContext / llmRedirectLink) instead of hardcoded
 * location data, since this repo serves more than one business.
 *
 * Provider resolution mirrors Rishtedar's lib/agent/runTurn.ts (Groq first,
 * OpenAI fallback) so the same API keys can be reused across both projects —
 * intentionally NOT importing from Rishtedar's repo, this is a separate
 * deploy with its own dependency tree.
 */

import OpenAI from "openai";

type Provider = "groq" | "openai";

function resolveProvider(): Provider {
  const explicit = process.env.AGENT_PROVIDER?.toLowerCase();
  if (explicit === "openai") return "openai";
  if (explicit === "groq") return "groq";
  if (process.env.GROQ_API_KEY) return "groq";
  if (process.env.OPENAI_API_KEY) return "openai";
  return "groq";
}

function buildClient(provider: Provider): { client: OpenAI; model: string } {
  if (provider === "groq") {
    return {
      client: new OpenAI({
        apiKey: process.env.GROQ_API_KEY ?? "",
        baseURL: "https://api.groq.com/openai/v1",
      }),
      model: process.env.GROQ_MODEL ?? "meta-llama/llama-4-scout-17b-16e-instruct",
    };
  }
  return {
    client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "" }),
    model: "gpt-4o-mini",
  };
}

const MAX_RETRIES = 3;

function isTransient(err: unknown): boolean {
  if (err instanceof OpenAI.APIError) {
    const status = err.status ?? 0;
    if (status === 429 || status === 408 || (status >= 500 && status < 600)) return true;
    if (status === 400) {
      const m = `${err.code ?? ""} ${err.message ?? ""}`.toLowerCase();
      return /rate|tpm|too large|too many|capacity|tokens per|try again/.test(m);
    }
  }
  return false;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function createWithRetry(
  client: OpenAI,
  body: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await client.chat.completions.create(body);
    } catch (err) {
      lastErr = err;
      if (attempt === MAX_RETRIES || !isTransient(err)) throw err;
      await sleep(400 * 2 ** attempt + Math.random() * 250);
    }
  }
  throw lastErr;
}

function buildSystemPrompt(businessContext: string, redirectLink: string): string {
  return `You answer direct messages for a business's Instagram/Facebook account.

Strict rules:
1. If the message is a casual comment, a reaction, a thank-you, or anything without a real question (e.g. "nice!", "love this", just emojis), reply with ONE short, warm, natural sentence. Do not volunteer information nobody asked for.
2. If it's a simple question answerable from the business context below, answer it directly in 1-2 sentences.
3. For anything else — booking, ordering, cancelling, pricing, complaints, or any question the context below doesn't cover — reply briefly and warmly, pointing them to: ${redirectLink}
4. Never invent information not in the context below. Never promise a booking, order, or discount from here — those only happen through the redirect channel.
5. Max 2 sentences, no markdown, don't overdo emojis (at most 1).

Business context:
${businessContext}`;
}

const MAX_TOKENS = 150;

export interface SocialReplyConfig {
  businessContext: string;
  redirectLink: string;
}

/**
 * Returns null when the workspace hasn't configured llmBusinessContext /
 * llmRedirectLink — callers should treat that as "fallback disabled",
 * matching Automation.llmFallbackEnabled being a no-op without it (see the
 * schema comment on Workspace.llmBusinessContext).
 */
export async function generateSocialReply(
  text: string,
  config: SocialReplyConfig
): Promise<string> {
  const provider = resolveProvider();
  const { client, model } = buildClient(provider);

  const fallbackReply = `Thanks for reaching out! For anything specific, message us here and we'll help: ${config.redirectLink}`;

  try {
    const response = await createWithRetry(client, {
      model,
      messages: [
        { role: "system", content: buildSystemPrompt(config.businessContext, config.redirectLink) },
        { role: "user", content: text },
      ],
      max_tokens: MAX_TOKENS,
      temperature: 0.5,
    });
    const reply = response.choices[0]?.message?.content?.trim();
    return reply || fallbackReply;
  } catch (e) {
    console.error("[socialReply] error generating reply, using fallback:", e);
    return fallbackReply;
  }
}
