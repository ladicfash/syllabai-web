import { ChevronRight } from "lucide-react";
import { Link } from "wouter";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/">
            <a className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Home
            </a>
          </Link>
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: July 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-invert max-w-none space-y-8">
          {/* Section 1: Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using syllabAI ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Service. We reserve the right to modify these Terms at any time. Your continued use of the Service following the posting of revised Terms means that you accept and agree to the changes.
            </p>
          </section>

          {/* Section 2: Use License */}
          <section>
            <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We grant you a limited, non-exclusive, non-transferable, and revocable license to use the Service for personal, non-commercial purposes. You agree not to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Reproduce, duplicate, copy, or resell any portion of the Service</li>
              <li>Attempt to gain unauthorized access to the Service or its systems</li>
              <li>Transmit viruses, malware, or any code of destructive nature</li>
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Interfere with or disrupt the integrity or performance of the Service</li>
            </ul>
          </section>

          {/* Section 3: Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold mb-4">3. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>TO THE FULLEST EXTENT PERMITTED BY LAW, syllabAI AND ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>Loss of profits, revenue, or data</li>
              <li>Loss of goodwill or reputation</li>
              <li>Business interruption or stoppage</li>
              <li>Cost of substitute goods or services</li>
              <li>Any other damages arising from your use of or inability to use the Service</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-4">
              This limitation applies even if syllabAI has been advised of the possibility of such damages. In no event shall syllabAI's total liability exceed the amount you paid to syllabAI in the twelve months preceding the claim, or $100, whichever is greater.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong>You acknowledge that the Service is provided on an "AS IS" and "AS AVAILABLE" basis. syllabAI makes no warranties, express or implied, regarding the Service, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.</strong>
            </p>
          </section>

          {/* Section 4: User Content and Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold mb-4">4. User Content and Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You retain all rights to any content you upload, create, or submit through the Service ("User Content"). By uploading User Content, you grant syllabAI a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your User Content solely for the purpose of providing and improving the Service.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              All materials, including but not limited to text, graphics, logos, images, and software, are the property of syllabAI or its content suppliers and are protected by international copyright laws. You may not reproduce, distribute, or transmit any materials without prior written permission.
            </p>
          </section>

          {/* Section 5: User Accounts and Conduct */}
          <section>
            <h2 className="text-2xl font-bold mb-4">5. User Accounts and Conduct</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate, current, and complete information during registration and to update such information as necessary.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You agree not to engage in any conduct that is unlawful, threatening, abusive, defamatory, obscene, or otherwise objectionable. syllabAI reserves the right to suspend or terminate your account at any time, with or without cause, and without notice or liability.
            </p>
          </section>

          {/* Section 6: Third-Party Services and Links */}
          <section>
            <h2 className="text-2xl font-bold mb-4">6. Third-Party Services and Links</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The Service may contain links to third-party websites and services that are not operated by syllabAI. We are not responsible for the content, accuracy, or practices of these third-party services. Your use of third-party services is governed by their respective terms and privacy policies.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              syllabAI does not endorse any third-party services and shall not be liable for any damages or losses resulting from your use of such services.
            </p>
          </section>

          {/* Section 7: Indemnification and Dispute Resolution */}
          <section>
            <h2 className="text-2xl font-bold mb-4">7. Indemnification and Dispute Resolution</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree to indemnify, defend, and hold harmless syllabAI and its affiliates, officers, directors, employees, and agents from any and all claims, damages, losses, liabilities, and expenses (including reasonable attorneys' fees) arising from your use of the Service, your violation of these Terms, or your infringement of any third-party rights.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Any dispute arising out of or relating to these Terms or the Service shall be governed by and construed in accordance with the laws of the jurisdiction in which syllabAI is incorporated, without regard to its conflict of law principles.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You agree to submit to the exclusive jurisdiction of the courts located in that jurisdiction and waive any objection to venue or inconvenient forum.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t border-border pt-8 mt-12">
            <h3 className="text-lg font-semibold mb-4">Questions?</h3>
            <p className="text-muted-foreground">
              If you have any questions about these Terms of Service, please contact us at{" "}
              <a href="mailto:legal@syllibai.one" className="text-primary hover:underline">
                legal@syllibai.one
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
