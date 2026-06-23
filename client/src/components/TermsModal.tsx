import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ShieldCheck, Loader2, ChevronDown } from "lucide-react";

const TERMS_VERSION = "1.0";

interface TermsModalProps {
  open: boolean;
  onAccepted: () => void;
}

export default function TermsModal({ open, onAccepted }: TermsModalProps) {
  const [checkedTerms, setCheckedTerms] = useState(false);
  const [checkedPrivacy, setCheckedPrivacy] = useState(false);
  const [checkedAge, setCheckedAge] = useState(false);

  const acceptTerms = trpc.auth.acceptTerms.useMutation({
    onSuccess: () => {
      toast.success("Welcome to SyllabAI. Let's get started.");
      onAccepted();
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  const canAccept = checkedTerms && checkedPrivacy && checkedAge;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{ background: "oklch(0.09 0.03 258)" }}
    >
      {/* Top bar */}
      <div
        className="flex-shrink-0 flex items-center gap-3 px-6 py-4 border-b"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(37,139,255,0.15)" }}
        >
          <ShieldCheck className="w-4 h-4" style={{ color: "#258bff" }} />
        </div>
        <div>
          <h1 className="font-display font-bold text-white text-base leading-tight">
            Terms of Service &amp; Privacy Policy
          </h1>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            Please read and agree before using SyllabAI — Version {TERMS_VERSION}
          </p>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div
          className="max-w-2xl mx-auto px-6 py-8 space-y-8 text-sm leading-relaxed"
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            Effective Date: June 2025 &nbsp;·&nbsp; Version {TERMS_VERSION}
          </p>

          {[
            {
              title: "1. Acceptance of Terms",
              body: "By creating an account and accessing SyllabAI ('the Service'), you agree to be bound by these Terms of Service. If you do not agree, you may not use the Service. These Terms form a legally binding agreement between you and SyllabAI.",
            },
            {
              title: "2. Description of Service",
              body: "SyllabAI is an AI-powered academic productivity platform providing study tools including document upload and analysis, AI-generated flashcards, mind maps, study guides, quiz generation, spaced repetition, a Pomodoro timer, assignment planning, voice transcription, and simulation environments. The Service is provided for educational and personal productivity use.",
            },
            {
              title: "3. Eligibility",
              body: "You must be at least 13 years of age to use the Service. If you are under 18, you represent that you have obtained parental or guardian consent. By using the Service, you represent and warrant that you meet these eligibility requirements.",
            },
            {
              title: "4. Acceptable Use Policy",
              body: "You agree not to use the Service to: (a) violate any applicable law or regulation; (b) infringe the intellectual property rights of others; (c) upload content that is harmful, abusive, defamatory, or obscene; (d) attempt to gain unauthorised access to any part of the Service; (e) use automated means to scrape, crawl, or extract data from the Service; or (f) engage in academic dishonesty or plagiarism in violation of your institution's policies.",
            },
            {
              title: "5. Intellectual Property",
              body: "All content, features, and functionality of the Service — including but not limited to software, text, graphics, logos, and icons — are the exclusive property of SyllabAI and are protected by applicable intellectual property laws. Content you upload remains yours; by uploading it you grant SyllabAI a limited, non-exclusive licence to process it solely for the purpose of providing the Service to you.",
            },
            {
              title: "6. AI Content Disclaimer",
              body: "SyllabAI uses artificial intelligence to generate study materials including flashcards, summaries, mind maps, quizzes, and notes. AI-generated content may contain inaccuracies, errors, or omissions. You are solely responsible for verifying the accuracy of AI-generated content before relying on it for academic, professional, or any other purpose. SyllabAI makes no warranty regarding the accuracy, completeness, or fitness for purpose of any AI-generated output.",
            },
            {
              title: "7. Privacy Policy",
              body: "We collect information you provide directly (name, email, uploaded documents) and information generated through your use of the Service (study sessions, quiz scores, timer data). We use this data to provide and improve the Service. We do not sell your personal data to third parties. Uploaded documents are stored securely and processed only to deliver the features you request. You may request deletion of your data at any time by deactivating your account or contacting us. We use third-party services including Manus OAuth for authentication and cloud storage providers for file hosting, each subject to their own privacy policies.",
            },
            {
              title: "8. Data Retention",
              body: "We retain your account data and uploaded documents for as long as your account is active. If you deactivate your account, your personal data and uploaded files will be scheduled for deletion within 30 days. Anonymised, aggregated usage statistics may be retained indefinitely.",
            },
            {
              title: "9. Disclaimers & Limitation of Liability",
              body: 'The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. SyllabAI does not warrant that the Service will be uninterrupted, error-free, or free of harmful components. To the fullest extent permitted by law, SyllabAI shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.',
            },
            {
              title: "10. Changes to These Terms",
              body: "We may update these Terms from time to time. We will notify you of material changes by displaying a notice within the Service or by email. Your continued use of the Service after changes take effect constitutes your acceptance of the revised Terms.",
            },
            {
              title: "11. Contact",
              body: "If you have questions about these Terms or our Privacy Policy, please contact us through the SyllabAI support channel. We aim to respond to all enquiries within 5 business days.",
            },
          ].map((section) => (
            <section key={section.title}>
              <h3
                className="font-semibold mb-2"
                style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.875rem" }}
              >
                {section.title}
              </h3>
              <p>{section.body}</p>
            </section>
          ))}

          {/* Spacer so content doesn't sit right above the footer */}
          <div className="h-4" />
        </div>
      </div>

      {/* Sticky footer with checkboxes + button */}
      <div
        className="flex-shrink-0 border-t"
        style={{
          borderColor: "rgba(255,255,255,0.08)",
          background: "oklch(0.12 0.03 258)",
        }}
      >
        <div className="max-w-2xl mx-auto px-6 py-5 space-y-4">
          {/* Scroll hint */}
          <div
            className="flex items-center gap-1.5 text-xs mb-1"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            <ChevronDown className="w-3 h-3" />
            Scroll up to read all sections before agreeing
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            {[
              {
                id: "terms",
                checked: checkedTerms,
                onChange: setCheckedTerms,
                label: (
                  <>
                    I have read and agree to the{" "}
                    <strong style={{ color: "rgba(255,255,255,0.9)" }}>Terms of Service</strong>,
                    including the Acceptable Use Policy and AI content disclaimer.
                  </>
                ),
              },
              {
                id: "privacy",
                checked: checkedPrivacy,
                onChange: setCheckedPrivacy,
                label: (
                  <>
                    I have read and agree to the{" "}
                    <strong style={{ color: "rgba(255,255,255,0.9)" }}>Privacy Policy</strong> and
                    consent to the collection and processing of my data as described.
                  </>
                ),
              },
              {
                id: "age",
                checked: checkedAge,
                onChange: setCheckedAge,
                label: (
                  <>
                    I confirm that I am at least{" "}
                    <strong style={{ color: "rgba(255,255,255,0.9)" }}>13 years of age</strong>, or
                    that I have obtained parental or guardian consent.
                  </>
                ),
              },
            ].map((item) => (
              <label
                key={item.id}
                htmlFor={`tc-${item.id}`}
                className="flex items-start gap-3 cursor-pointer"
              >
                <Checkbox
                  id={`tc-${item.id}`}
                  checked={item.checked}
                  onCheckedChange={(v) => item.onChange(!!v)}
                  className="mt-0.5 flex-shrink-0"
                  style={
                    item.checked
                      ? { background: "#258bff", borderColor: "#258bff" }
                      : { borderColor: "rgba(255,255,255,0.2)" }
                  }
                />
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>

          {/* Agree button */}
          <Button
            className="w-full gap-2 h-11 text-sm font-semibold mt-1"
            disabled={!canAccept || acceptTerms.isPending}
            onClick={() => acceptTerms.mutate({ version: TERMS_VERSION })}
            style={
              canAccept
                ? { background: "#258bff", color: "#fff" }
                : { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.25)" }
            }
          >
            {acceptTerms.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving your agreement...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                I Agree — Continue to SyllabAI
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
