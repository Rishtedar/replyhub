"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CampaignBuilder from "@/components/campaign-builder";
import FacebookCampaignBuilder from "@/components/facebook-campaign-builder";

type Channel = "instagram" | "facebook";

export default function NewCampaignPage() {
  return (
    <Suspense fallback={<div className="panel h-64 rounded" />}>
      <NewCampaignPageInner />
    </Suspense>
  );
}

function NewCampaignPageInner() {
  const searchParams = useSearchParams();
  const requestedChannel = searchParams.get("channel");

  const [loading, setLoading] = useState(true);
  const [hasInstagram, setHasInstagram] = useState(false);
  const [hasFacebook, setHasFacebook] = useState(false);
  const [channel, setChannel] = useState<Channel | null>(
    requestedChannel === "facebook" || requestedChannel === "instagram"
      ? requestedChannel
      : null
  );

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((payload) => {
        if (!payload.success) return;
        const ig = (payload.data.instagramAccounts ?? []).length > 0;
        const fb = (payload.data.facebookPages ?? []).length > 0;
        setHasInstagram(ig);
        setHasFacebook(fb);
        // Only one channel connected: skip the picker.
        if (!channel) {
          if (ig && !fb) setChannel("instagram");
          else if (fb && !ig) setChannel("facebook");
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <div className="panel h-64 rounded" />;
  }

  if (!hasInstagram && !hasFacebook) {
    return (
      <div className="panel rounded p-8 text-center">
        <p className="text-sm text-muted">
          Connect an Instagram account or a Facebook Page in Settings before creating a
          campaign.
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

  if (!channel) {
    return (
      <div className="mx-auto max-w-md space-y-3">
        <p className="text-sm text-muted">Which channel is this campaign for?</p>
        <div className="grid grid-cols-2 gap-3">
          {hasInstagram && (
            <button
              type="button"
              onClick={() => setChannel("instagram")}
              className="rounded-lg border border-border p-4 text-left text-sm font-medium text-foreground transition-colors hover:border-accent/40"
            >
              Instagram
              <p className="mt-1 text-xs font-normal text-muted">
                Comments, DMs, opening DM, follow-gate, tracked links.
              </p>
            </button>
          )}
          {hasFacebook && (
            <button
              type="button"
              onClick={() => setChannel("facebook")}
              className="rounded-lg border border-border p-4 text-left text-sm font-medium text-foreground transition-colors hover:border-accent/40"
            >
              Facebook
              <p className="mt-1 text-xs font-normal text-muted">
                Page comments and Messenger DMs, plain-text replies.
              </p>
            </button>
          )}
        </div>
      </div>
    );
  }

  return channel === "facebook" ? (
    <FacebookCampaignBuilder mode="new" />
  ) : (
    <CampaignBuilder mode="new" />
  );
}
