"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CampaignBuilder from "@/components/campaign-builder";
import FacebookCampaignBuilder from "@/components/facebook-campaign-builder";

export default function EditCampaignPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [channel, setChannel] = useState<"instagram" | "facebook" | null>(null);

  // Determine which builder to mount before rendering either one — each
  // builder re-fetches to prefill its own fields once mounted.
  useEffect(() => {
    fetch("/api/automations", { cache: "no-store" })
      .then((r) => r.json())
      .then((payload) => {
        if (!payload.success) return setNotFound(true);
        const found = (
          payload.data as { id: string; facebookPageId: string | null }[]
        ).find((c) => c.id === params.id);
        if (!found) return setNotFound(true);
        setChannel(found.facebookPageId ? "facebook" : "instagram");
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <div className="panel h-64 rounded" />;
  }

  if (notFound || !channel) {
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

  return channel === "facebook" ? (
    <FacebookCampaignBuilder mode="edit" campaignId={params.id} />
  ) : (
    <CampaignBuilder mode="edit" campaignId={params.id} />
  );
}
