import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ShieldCheck, Loader2 } from "lucide-react";

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

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden [&>button]:hidden"
        onInteractOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
          <DialogTitle className="flex items-center gap-2.5 text-lg font-display">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            Terms of Service &amp; Privacy Policy
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Please read and agree to the following before using SyllabAI. This is required to continue.
          </p>
        </DialogHeader>

        {/* Scrollable Terms Content */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 py-5 space-y-6 text-sm leading-relaxed text-foreground">

            {/* Effective Date */}
            <p className="text-xs text-muted-foreground">
              Effective Date: June 2025 &nbsp;·&nbsp; Version {TERMS_VERSION}
            </p>

            {/* Section 1 */}
            <section>
              <h3 className="font-semibold text-base mb-2">1. Acceptance of Terms</h3>
              <p className="text-muted-foreground">
                By creating an account and accessing SyllabAI ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Service. These Terms constitute a legally binding agreement between you and SyllabAI.
              </p>
            </section>

            <Separator />

            {/* Section 2 */}
            <section>
              <h3 className="font-semibold text-base mb-2">2. Description of Service</h3>
              <p className="text-muted-foreground">
                SyllabAI is an AI-powered academic productivity platform that provides study tools including, but not limited to: document upload and analysis, AI-generated flashcards, mind maps, study guides, quiz generation, spaced repetition, a Pomodoro timer, assignment planning, voice transcription, and simulation environments. The Service is provided "as is" and is intended for educational and personal productivity use.
              </p>
            </section>

            <Separator />

            {/* Section 3 */}
            <section>
              <h3 className="font-semibold text-base mb-2">3. User Accounts &amp; Eligibility</h3>
              <p className="text-muted-foreground mb-2">
                You must be at least 13 years of age to use the Service. By using SyllabAI, you represent and warrant that you meet this age requirement. Users under 18 should have parental or guardian consent.
              </p>
              <p className="text-muted-foreground">
                You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <Separator />

            {/* Section 4 */}
            <section>
              <h3 className="font-semibold text-base mb-2">4. Acceptable Use</h3>
              <p className="text-muted-foreground mb-2">You agree not to use the Service to:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-2">
                <li>Upload content that is illegal, harmful, defamatory, or infringes on third-party intellectual property rights</li>
                <li>Attempt to reverse-engineer, decompile, or otherwise extract the source code of the Service</li>
                <li>Use the Service to generate academic work intended to be submitted as your own in violation of your institution's academic integrity policies</li>
                <li>Circumvent, disable, or interfere with security features of the Service</li>
                <li>Use automated scripts or bots to access the Service in a manner that exceeds normal usage</li>
                <li>Attempt to gain unauthorized access to other users' data or accounts</li>
              </ul>
            </section>

            <Separator />

            {/* Section 5 */}
            <section>
              <h3 className="font-semibold text-base mb-2">5. Uploaded Content &amp; Intellectual Property</h3>
              <p className="text-muted-foreground mb-2">
                You retain full ownership of any documents, notes, or content you upload to SyllabAI ("User Content"). By uploading content, you grant SyllabAI a limited, non-exclusive, royalty-free license to process, store, and analyze your content solely for the purpose of providing the Service to you.
              </p>
              <p className="text-muted-foreground">
                SyllabAI does not claim ownership of your User Content and will not share, sell, or use it to train AI models without your explicit consent. You are solely responsible for ensuring that any content you upload does not violate applicable laws or third-party rights.
              </p>
            </section>

            <Separator />

            {/* Section 6 */}
            <section>
              <h3 className="font-semibold text-base mb-2">6. AI-Generated Content</h3>
              <p className="text-muted-foreground">
                SyllabAI uses large language models (LLMs) to generate study materials including flashcards, summaries, mind maps, and quiz questions. AI-generated content may contain inaccuracies, omissions, or errors. You acknowledge that AI-generated content is provided for study assistance only and should not be relied upon as a substitute for verified academic sources, professional advice, or authoritative reference materials. SyllabAI makes no warranty as to the accuracy, completeness, or fitness for purpose of any AI-generated output.
              </p>
            </section>

            <Separator />

            {/* Section 7 — Privacy */}
            <section>
              <h3 className="font-semibold text-base mb-2">7. Privacy Policy</h3>
              <p className="text-muted-foreground mb-2">
                Your privacy is important to us. This section summarizes how we collect, use, and protect your information.
              </p>
              <div className="space-y-3 text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground text-xs uppercase tracking-wide mb-1">Information We Collect</p>
                  <p>We collect information you provide directly (account profile, uploaded documents, notes, tasks) and information generated through your use of the Service (study session data, quiz scores, timer history). We do not collect payment information.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground text-xs uppercase tracking-wide mb-1">How We Use Your Information</p>
                  <p>We use your information solely to provide and improve the Service, personalize your study experience (e.g., spaced repetition scheduling), and communicate service-related updates. We do not sell your personal data to third parties.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground text-xs uppercase tracking-wide mb-1">Data Storage &amp; Security</p>
                  <p>Your uploaded files are stored securely using cloud object storage (S3-compatible). We implement industry-standard security measures including encrypted connections (HTTPS/TLS) and hashed session tokens. No security system is impenetrable, and we cannot guarantee absolute security.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground text-xs uppercase tracking-wide mb-1">Data Retention &amp; Deletion</p>
                  <p>You may delete your uploaded documents and notes at any time through the Service. Upon account deletion request, we will remove your personal data within 30 days, except where retention is required by law.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground text-xs uppercase tracking-wide mb-1">Third-Party Services</p>
                  <p>The Service uses third-party AI APIs to process your content for study tool generation. These providers are bound by their own privacy policies and data processing agreements. We do not share your identity with AI providers — only the text content you submit for processing.</p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Section 8 */}
            <section>
              <h3 className="font-semibold text-base mb-2">8. Disclaimers &amp; Limitation of Liability</h3>
              <p className="text-muted-foreground mb-2">
                The Service is provided "as is" without warranties of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
              </p>
              <p className="text-muted-foreground">
                To the maximum extent permitted by applicable law, SyllabAI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data, loss of study materials, or academic consequences arising from the use or inability to use the Service.
              </p>
            </section>

            <Separator />

            {/* Section 9 */}
            <section>
              <h3 className="font-semibold text-base mb-2">9. Changes to Terms</h3>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms at any time. We will notify you of material changes by updating the version number and effective date above. Continued use of the Service after changes constitutes acceptance of the revised Terms.
              </p>
            </section>

            <Separator />

            {/* Section 10 */}
            <section>
              <h3 className="font-semibold text-base mb-2">10. Contact</h3>
              <p className="text-muted-foreground">
                If you have questions about these Terms or our Privacy Policy, please contact us through the SyllabAI platform. We are committed to addressing your concerns promptly.
              </p>
            </section>

            <div className="h-2" />
          </div>
        </ScrollArea>

        {/* Agreement Checkboxes + CTA */}
        <div className="px-6 py-5 border-t border-border flex-shrink-0 space-y-4 bg-muted/20">
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer group">
              <Checkbox
                id="terms-check"
                checked={checkedTerms}
                onCheckedChange={v => setCheckedTerms(!!v)}
                className="mt-0.5 flex-shrink-0"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                I have read and agree to the <strong className="text-foreground">Terms of Service</strong>, including the Acceptable Use Policy and AI content disclaimer.
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <Checkbox
                id="privacy-check"
                checked={checkedPrivacy}
                onCheckedChange={v => setCheckedPrivacy(!!v)}
                className="mt-0.5 flex-shrink-0"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                I have read and agree to the <strong className="text-foreground">Privacy Policy</strong> and consent to the collection and processing of my data as described.
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <Checkbox
                id="age-check"
                checked={checkedAge}
                onCheckedChange={v => setCheckedAge(!!v)}
                className="mt-0.5 flex-shrink-0"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                I confirm that I am at least <strong className="text-foreground">13 years of age</strong>, or that I have obtained parental or guardian consent.
              </span>
            </label>
          </div>

          <Button
            className="w-full gap-2 h-11 text-base font-semibold"
            disabled={!canAccept || acceptTerms.isPending}
            onClick={() => acceptTerms.mutate({ version: TERMS_VERSION })}
          >
            {acceptTerms.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving your agreement...</>
            ) : (
              <><ShieldCheck className="w-4 h-4" /> I Agree — Continue to SyllabAI</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
