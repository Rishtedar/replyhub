"use client";

/**
 * Facebook Campaign Builder
 *
 * Deliberately smaller than CampaignBuilder (Instagram): no PostPicker (no
 * Graph API endpoint returns a Page's posts the same way here), no opening
 * DM, no follow-gate, no tracked links/link buttons — see the comment on
 * processFacebookComment/processFacebookMessage in lib/queue/dm-worker.ts for
 * why the worker itself only supports this smaller set for phase 1. A
 * specific post is targeted by pasting its numeric Facebook post ID.
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type TriggerScope = "specific" | "any";
type MatchMode = "specific" | "any";

interface FacebookPageOption {
  id: string;
  name: string;
  pageId: string;
}

interface LoadedCampaign {
  id: string;
  name: string;
  postId: string | null;
  matchAnyPost: boolean;
  keywords: string[];
  matchAnyWord: boolean;
  dmTriggerEnabled: boolean;
  llmFallbackEnabled: boolean;
  dmMessage: string;
  publicReplyEnabled: boolean;
  publicReplyMessage: string | null;
  publicReplyMessages: string[];
  isActive: boolean;
  facebookPageId: string | null;
}

interface FacebookCampaignBuilderProps {
  mode: "new" | "edit";
  campaignId?: string;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {children}
    </div>
  );
}

function Radio({
  checked,
  onSelect,
  children,
}: {
  checked: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
        checked ? "border-accent bg-accent/5" : "border-border hover:border-border-hover"
      }`}
    >
      <span
        className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
          checked ? "border-accent" : "border-zinc-500"
        }`}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-accent" />}
      </span>
      <span className="flex-1 text-foreground">{children}</span>
    </button>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        on ? "bg-accent" : "bg-zinc-300"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
          on ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

export default function FacebookCampaignBuilder({
  mode,
  campaignId,
}: FacebookCampaignBuilderProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(mode === "edit");
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [pages, setPages] = useState<FacebookPageOption[]>([]);
  const [selectedPageId, setSelectedPageId] = useState("");

  const [isActive, setIsActive] = useState(true);
  const [triggerScope, setTriggerScope] = useState<TriggerScope>("any");
  const [postId, setPostId] = useState("");

  const [matchMode, setMatchMode] = useState<MatchMode>("specific");
  const [keywordText, setKeywordText] = useState("");
  const [dmTriggerEnabled, setDmTriggerEnabled] = useState(false);
  const [llmFallbackEnabled, setLlmFallbackEnabled] = useState(false);

  const [publicReplyEnabled, setPublicReplyEnabled] = useState(false);
  const [publicReplyMessages, setPublicReplyMessages] = useState<string[]>([""]);

  const [dmMessage, setDmMessage] = useState("");

  const keywords = useMemo(
    () =>
      keywordText
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
    [keywordText]
  );

  // Load connected Facebook Pages.
  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((payload) => {
        if (!payload.success) return;
        const next: FacebookPageOption[] = payload.data.facebookPages ?? [];
        setPages(next);
        setSelectedPageId((prev) => prev || next[0]?.id || "");
      })
      .catch(() => setPages([]));
  }, []);

  // Prefill when editing.
  useEffect(() => {
    if (mode !== "edit" || !campaignId) return;
    fetch("/api/automations", { cache: "no-store" })
      .then((r) => r.json())
      .then((payload) => {
        if (!payload.success) return setNotFound(true);
        const c = (payload.data as LoadedCampaign[]).find((x) => x.id === campaignId);
        if (!c) return setNotFound(true);
        setName(c.name);
        setSelectedPageId(c.facebookPageId ?? "");
        setTriggerScope(c.matchAnyPost ? "any" : "specific");
        setPostId(c.postId ?? "");
        setMatchMode(c.matchAnyWord ? "any" : "specific");
        setKeywordText(c.keywords.join(", "));
        setDmTriggerEnabled(c.dmTriggerEnabled ?? false);
        setLlmFallbackEnabled(c.llmFallbackEnabled ?? false);
        setPublicReplyEnabled(c.publicReplyEnabled);
        setPublicReplyMessages(
          c.publicReplyMessages?.length
            ? c.publicReplyMessages
            : c.publicReplyMessage
              ? [c.publicReplyMessage]
              : [""]
        );
        setDmMessage(c.dmMessage);
        setIsActive(c.isActive);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [mode, campaignId]);

  async function handleSubmit(activeValue: boolean) {
    setError(null);

    if (!selectedPageId) return setError("Connect a Facebook Page first.");
    if (triggerScope === "specific" && !postId.trim())
      return setError("Paste the Facebook post ID, or switch to any post.");
    if (matchMode === "specific" && keywords.length === 0)
      return setError("Add at least one keyword, or switch to any word.");
    if (!dmMessage.trim())
      return setError("Add the private reply message.");

    setSaving(true);

    const payload = {
      name: name.trim() || `Facebook campaign`,
      facebookPageId: selectedPageId,
      postId: triggerScope === "specific" ? postId.trim() : null,
      matchAnyPost: triggerScope === "any",
      matchAnyWord: matchMode === "any",
      keywords: matchMode === "any" ? [] : keywords,
      dmTriggerEnabled,
      llmFallbackEnabled,
      dmMessage,
      publicReplyEnabled,
      publicReplyMessages: publicReplyEnabled
        ? publicReplyMessages.map((m) => m.trim()).filter(Boolean)
        : [],
      isActive: activeValue,
    };

    try {
      const res =
        mode === "new"
          ? await fetch("/api/automations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/automations?id=${campaignId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
      const data = await res.json();
      if (data.success) {
        router.push("/campaigns");
        router.refresh();
      } else {
        const fieldErrors = data.details?.fieldErrors as
          | Record<string, string[]>
          | undefined;
        const firstField = fieldErrors && Object.keys(fieldErrors)[0];
        setError(
          firstField
            ? `${firstField}: ${fieldErrors[firstField][0]}`
            : data.error ?? "Failed to save campaign"
        );
      }
    } catch {
      setError("Failed to save campaign");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="panel h-64 rounded" />;
  }

  if (notFound) {
    return (
      <div className="panel rounded p-8 text-center">
        <p className="text-sm text-muted">Campaign not found.</p>
        <button
          onClick={() => router.push("/campaigns")}
          className="mt-4 rounded border border-border px-4 py-2 text-sm text-muted hover:text-foreground"
        >
          Back to campaigns
        </button>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="panel rounded p-8 text-center">
        <p className="text-sm text-muted">
          Connect a Facebook Page in Settings before creating a Facebook campaign.
        </p>
        <a
          href="/settings"
          className="mt-4 inline-block rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Go to Settings
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <span className="text-sm text-muted">
          {mode === "edit" ? name || "Untitled campaign" : "New Facebook campaign"}
        </span>
        <button
          type="button"
          onClick={() => handleSubmit(mode === "new" ? true : isActive)}
          disabled={saving}
          className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {saving ? "Saving…" : mode === "new" ? "Go Live" : "Save changes"}
        </button>
      </div>

      {error && (
        <div className="rounded border border-error/20 bg-error/10 p-3 text-sm text-error">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground">
          Campaign name <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Reservation questions"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-zinc-500 focus:border-accent/40 focus:outline-none"
          maxLength={100}
        />
        {pages.length > 1 && (
          <label className="flex flex-col gap-2 pt-2 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Facebook Page
            </span>
            <select
              value={selectedPageId}
              onChange={(e) => setSelectedPageId(e.target.value)}
              className="min-w-52 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent/40"
            >
              {pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <Section title="When someone comments on">
        <Radio checked={triggerScope === "any"} onSelect={() => setTriggerScope("any")}>
          any post
        </Radio>
        <Radio
          checked={triggerScope === "specific"}
          onSelect={() => setTriggerScope("specific")}
        >
          a specific post
        </Radio>
        {triggerScope === "specific" && (
          <div className="space-y-1">
            <input
              value={postId}
              onChange={(e) => setPostId(e.target.value)}
              placeholder="Facebook post ID"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-zinc-500 focus:border-accent/40 focus:outline-none"
            />
            <p className="text-xs text-muted">
              Copy it from the post URL — there&apos;s no post picker for Facebook yet.
            </p>
          </div>
        )}
      </Section>

      <Section title="And this comment has">
        <Radio
          checked={matchMode === "specific"}
          onSelect={() => setMatchMode("specific")}
        >
          a specific word or words
        </Radio>
        {matchMode === "specific" && (
          <div className="space-y-1">
            <input
              value={keywordText}
              onChange={(e) => setKeywordText(e.target.value)}
              placeholder="Enter a word or multiple"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-zinc-500 focus:border-accent/40 focus:outline-none"
            />
            <p className="text-xs text-muted">Use commas to separate words</p>
          </div>
        )}
        <Radio checked={matchMode === "any"} onSelect={() => setMatchMode("any")}>
          any word
        </Radio>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
          <span className="text-sm text-foreground">
            also reply when someone messages the Page{" "}
            {matchMode === "any" ? "anything" : "these words"}
          </span>
          <Toggle on={dmTriggerEnabled} onToggle={() => setDmTriggerEnabled(!dmTriggerEnabled)} />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
          <span className="text-sm text-foreground">reply to their comments under the post</span>
          <Toggle
            on={publicReplyEnabled}
            onToggle={() => setPublicReplyEnabled(!publicReplyEnabled)}
          />
        </div>
        {publicReplyEnabled && (
          <div className="space-y-2">
            {publicReplyMessages.map((msg, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={msg}
                  onChange={(e) =>
                    setPublicReplyMessages((prev) =>
                      prev.map((m, idx) => (idx === i ? e.target.value : m))
                    )
                  }
                  placeholder="Sent you a message! 📩"
                  maxLength={1000}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-zinc-500 focus:border-accent/40 focus:outline-none"
                />
                {publicReplyMessages.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setPublicReplyMessages((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="shrink-0 px-2 text-muted hover:text-error"
                    aria-label="Remove reply"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {publicReplyMessages.length < 10 && (
              <button
                type="button"
                onClick={() => setPublicReplyMessages((prev) => [...prev, ""])}
                className="text-xs font-medium text-accent hover:underline"
              >
                + Add another reply
              </button>
            )}
          </div>
        )}
      </Section>

      <Section title="They will get">
        <div className="rounded-lg border border-border p-3 space-y-2">
          <span className="text-sm text-foreground">a private reply</span>
          <textarea
            value={dmMessage}
            onChange={(e) => setDmMessage(e.target.value)}
            placeholder="Thanks for reaching out! Here's what you need to know..."
            rows={3}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-zinc-500 focus:border-accent/40 focus:outline-none resize-none"
            maxLength={1000}
          />
          <p className="text-xs text-muted">
            Plain text only — Facebook campaigns don&apos;t support tracked links or buttons
            yet. {"{username}"} personalizes it.
          </p>
        </div>
      </Section>

      <Section title="AI fallback">
        <div className="rounded-lg border border-border p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">
              use as the AI fallback for this Page
            </span>
            <Toggle
              on={llmFallbackEnabled}
              onToggle={() => setLlmFallbackEnabled(!llmFallbackEnabled)}
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            When a DM to this Page matches no campaign&apos;s keywords, it gets an
            AI-generated reply grounded in the business info configured under Settings →
            AI Fallback Reply, instead of being ignored.
          </p>
        </div>
      </Section>
    </div>
  );
}
