import type { Metadata } from "next";
import LegalShell from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Privacy Policy - AutoReply",
  description:
    "How AutoReply handles Instagram and Facebook Page account data, webhook payloads, billing data, and customer campaign information.",
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      description="AutoReply helps businesses send Meta-compliant private replies and Messenger DMs when people comment on connected Instagram posts, reels, or Facebook Page posts, or message the Page directly."
      updatedAt="August 23, 2026"
    >
      <section>
        <h2 className="text-xl font-bold text-white">Data We Collect</h2>
        <p className="mt-3">
          We collect account email addresses for authentication, workspace and
          billing metadata, connected Instagram account and Facebook Page
          identifiers, encrypted Instagram and Facebook Page access tokens,
          campaign settings, webhook payloads, comments and Messenger messages
          needed to process campaigns, delivery logs, and operational
          diagnostics.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">How We Use Data</h2>
        <p className="mt-3">
          We use this data to authenticate users, connect Instagram and
          Facebook Page integrations, match comment and message keywords, send
          private replies and Messenger DMs through the official Meta APIs,
          prevent duplicate sends, troubleshoot failures, and protect the
          service.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Instagram And Meta Data</h2>
        <p className="mt-3">
          AutoReply does not ask for Instagram or Facebook passwords, scrape
          either platform, or use browser automation. Instagram and Facebook
          Page tokens are encrypted at rest and are used only to perform
          actions authorized by the connected business account or Page.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Subprocessors</h2>
        <p className="mt-3">
          The production service may use hosting, database, Redis queue, email,
          and observability providers such as Vercel, Railway, PostgreSQL,
          Redis, and Resend. These providers process data only as needed to run
          the service.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Retention And Deletion</h2>
        <p className="mt-3">
          Customers can disconnect Instagram or a Facebook Page from settings,
          which removes the stored connection and stops campaigns for it. For
          account or data deletion, follow the Data Deletion page linked from
          the footer.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Contact</h2>
        <p className="mt-3">
          For privacy questions, contact the repository owner through GitHub or
          the support email configured for the hosted AutoReply service.
        </p>
      </section>
    </LegalShell>
  );
}
