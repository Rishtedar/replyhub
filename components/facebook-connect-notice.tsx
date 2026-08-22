"use client";

import { useSearchParams } from "next/navigation";

type Tone = "error" | "warning" | "success";

const TONE_CLASSES: Record<Tone, string> = {
  error: "border-error/20 bg-error/10 text-error",
  warning: "border-warning/20 bg-warning/10 text-warning",
  success: "border-success/20 bg-success/10 text-success",
};

const MESSAGES: Record<string, { tone: Tone; title: string; detail: string }> = {
  denied: {
    tone: "warning",
    title: "Facebook connection cancelled",
    detail:
      "You declined the permission prompt on Facebook. Start again and accept all requested permissions.",
  },
  invalid: {
    tone: "error",
    title: "Facebook connection expired",
    detail:
      "The login link was missing or older than 10 minutes. Click Connect Facebook Page to start a fresh attempt.",
  },
  forbidden: {
    tone: "error",
    title: "Not permitted",
    detail: "Only workspace owners and admins can connect a Facebook Page.",
  },
  already_connected: {
    tone: "warning",
    title: "Page already connected",
    detail:
      "That Facebook Page is connected to another workspace. Disconnect it there first, or connect a different Page.",
  },
  no_pages: {
    tone: "error",
    title: "No Facebook Pages found",
    detail:
      "Your Facebook account doesn't manage any Pages, or didn't grant access to one during login. Make sure you're an admin on the Page and grant it access when prompted.",
  },
  multiple_pages: {
    tone: "warning",
    title: "Multiple Pages found",
    detail:
      "Your account manages more than one Facebook Page — this app only supports connecting one Page at a time right now. Log into Facebook with an account that only manages the one Page you want to connect, or ask the Page admin to remove the extra pages from that login.",
  },
};

export function FacebookConnectNotice() {
  const searchParams = useSearchParams();
  const status = searchParams.get("facebook");

  if (!status) return null;

  if (status === "misconfigured") {
    const missing = (searchParams.get("missing") ?? "")
      .split(",")
      .filter(Boolean);

    return (
      <Notice tone="error" title="Facebook app not configured">
        <p>
          Set{" "}
          {missing.length > 0
            ? "these environment variables"
            : "the required environment variables"}{" "}
          and restart the server:
        </p>
        {missing.length > 0 && (
          <ul className="mt-2 space-y-1">
            {missing.map((name) => (
              <li key={name} className="font-mono text-xs">
                {name}
              </li>
            ))}
          </ul>
        )}
      </Notice>
    );
  }

  if (status === "failed") {
    const reason = searchParams.get("reason");

    return (
      <Notice tone="error" title="Facebook connection failed">
        <p>
          Facebook accepted the login but the connection could not be
          completed. This is usually a mismatched redirect URI or an app that is
          missing the required permissions.
        </p>
        {reason && (
          <p className="mt-2 font-mono text-xs break-words opacity-80">
            {reason}
          </p>
        )}
      </Notice>
    );
  }

  const known = MESSAGES[status];
  if (!known) return null;

  return (
    <Notice tone={known.tone} title={known.title}>
      <p>{known.detail}</p>
    </Notice>
  );
}

function Notice({
  tone,
  title,
  children,
}: {
  tone: Tone;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded border p-4 text-sm ${TONE_CLASSES[tone]}`}>
      <p className="font-semibold">{title}</p>
      <div className="mt-1 opacity-90">{children}</div>
    </div>
  );
}
