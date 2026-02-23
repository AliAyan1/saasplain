"use client";

import AppShell from "@/components/AppShell";
import Card from "@/components/Card";
import Button from "@/components/Button";
import StepIndicator from "@/components/StepIndicator";
import { useRouter } from "next/navigation";
import { useState } from "react";

const WIDGET_SNIPPET = `<script src="https://yourapp.com/widget.js"></script>`;

export default function IntegrationPage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(WIDGET_SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <StepIndicator currentStep={4} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-400">Step 4: Install Widget</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-100">Integration</h1>
          <p className="mt-2 text-slate-400">
            Copy the snippet to embed the widget, test your chatbot (AI greets first), or try it on a sample website.
          </p>
        </div>

        <Card className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-100">Install snippet</h2>
          <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-xs font-mono text-slate-100">
            {WIDGET_SNIPPET}
          </div>
          <Button variant="secondary" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy Script"}
          </Button>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">Test your chatbot</h2>
          <p className="text-sm text-slate-400">
            Open the chat panel. The AI will greet you first; then you can ask questions about your store.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => router.push("/test-chatbot")}>
              Test Chatbot
            </Button>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              View live dashboard
            </Button>
          </div>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">Sample website</h2>
          <p className="text-sm text-slate-400">
            Try your chatbot on a mock storefront with the widget already embedded.
          </p>
          <Button variant="outline" onClick={() => router.push("/demo-website")}>
            Open sample website
          </Button>
        </Card>
      </div>
    </AppShell>
  );
}

