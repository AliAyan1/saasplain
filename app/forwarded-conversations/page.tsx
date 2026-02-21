"use client";

import AppShell from "@/components/AppShell";
import Card from "@/components/Card";

export default function ForwardedConversationsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-100">Forwarded conversations</h1>
        <p className="mt-1 text-slate-400">Conversations forwarded to email or support.</p>
        <Card className="mt-6">
          <p className="text-slate-400">Forwarded conversation list will appear here.</p>
        </Card>
      </div>
    </AppShell>
  );
}
