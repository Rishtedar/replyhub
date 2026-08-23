import type { Metadata } from "next";
import LegalShell from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Data Deletion - AutoReply",
  description:
    "How AutoReply customers can disconnect Instagram or a Facebook Page and request account or campaign data deletion.",
};

export default function DataDeletionPage() {
  return (
    <LegalShell
      title="Data Deletion"
      description="Use this page for Meta App Review and customer requests about removing AutoReply account, workspace, Instagram, Facebook Page, and campaign data."
      updatedAt="August 23, 2026"
    >
      <section>
        <h2 className="text-xl font-bold text-white">
          Disconnect Instagram Or A Facebook Page
        </h2>
        <p className="mt-3">
          Sign in, open Settings, and select Disconnect next to the Instagram
          account or Facebook Page. This removes the stored connection token
          and stops campaigns from sending private replies or Messenger DMs
          for that account.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Delete Workspace Data</h2>
        <p className="mt-3">
          To delete workspace, campaign, log, webhook, billing reference, and
          operational diagnostic data, contact support from the email address
          used to sign in. Include the workspace name and the connected
          Instagram username or Facebook Page name.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Verification</h2>
        <p className="mt-3">
          We may ask you to verify control of the email address or connected
          business account before deleting data. Deletion requests are processed
          as quickly as practical unless retention is required for legal,
          billing, fraud prevention, or security reasons.
        </p>
      </section>
    </LegalShell>
  );
}
