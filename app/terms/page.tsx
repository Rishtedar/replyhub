import type { Metadata } from "next";
import LegalShell from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Terms of Service - AutoReply",
  description:
    "Terms for using AutoReply's Instagram and Facebook Page comment/Messenger-to-DM campaign software.",
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      description="These terms define acceptable use for AutoReply's hosted Instagram and Facebook Page comment/Messenger-to-DM campaign service."
      updatedAt="August 23, 2026"
    >
      <section>
        <h2 className="text-xl font-bold text-white">Authorized Use</h2>
        <p className="mt-3">
          You may use AutoReply only with Instagram professional accounts and
          Facebook Pages you own or are authorized to manage. You are
          responsible for the campaigns, keywords, links, and messages you
          configure.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Platform Compliance</h2>
        <p className="mt-3">
          You agree to follow Meta Platform Terms, Instagram and Facebook
          policies, applicable messaging rules, privacy laws, advertising
          rules, and anti-spam laws. AutoReply may rate-limit, pause, or
          disable campaigns that create compliance, abuse, security, or
          deliverability risk.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Availability</h2>
        <p className="mt-3">
          AutoReply depends on third-party platforms including Meta, email,
          hosting, database, and queue providers. We work to operate the
          service reliably, but uninterrupted availability is not guaranteed.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Open-Source Core</h2>
        <p className="mt-3">
          The public repository is MIT licensed. Hosted SaaS infrastructure,
          managed support, agency workflows, analytics, reports, and other paid
          service features may be provided separately from the open-source core.
        </p>
      </section>
    </LegalShell>
  );
}
