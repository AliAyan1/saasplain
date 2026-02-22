"use client";

import AppShell from "@/components/AppShell";
import Card from "@/components/Card";

const SAMPLE_CONVERSATIONS = [
  {
    id: "conv_001",
    customer: "Sarah M.",
    preview: "Where is my order #5524? I ordered 3 days ago.",
    date: "2m ago",
    status: "resolved" as const,
  },
  {
    id: "conv_002",
    customer: "James K.",
    preview: "Do you offer international shipping to Canada?",
    date: "15m ago",
    status: "resolved" as const,
  },
  {
    id: "conv_003",
    customer: "Emily R.",
    preview: "I need to return a defective item. What's the process?",
    date: "1h ago",
    status: "in_progress" as const,
  },
  {
    id: "conv_004",
    customer: "Mike T.",
    preview: "Can I change the delivery address for my pending order?",
    date: "2h ago",
    status: "resolved" as const,
  },
  {
    id: "conv_005",
    customer: "Lisa P.",
    preview: "Discount code not applying at checkout.",
    date: "5h ago",
    status: "handoff" as const,
  },
];

const statusStyles: Record<string, string> = {
  resolved: "bg-emerald-500/15 text-emerald-400",
  in_progress: "bg-amber-500/15 text-amber-400",
  handoff: "bg-sky-500/15 text-sky-400",
};

export default function ConversationsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-100">Conversations</h1>
        <p className="mt-1 text-slate-400">View and manage chatbot conversations.</p>
        <Card className="mt-6">
          <ul className="divide-y divide-slate-700/80">
            {SAMPLE_CONVERSATIONS.map((conv) => (
              <li
                key={conv.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-200">{conv.customer}</span>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[conv.status] ?? "bg-slate-500/15 text-slate-400"}`}
                    >
                      {conv.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-400">{conv.preview}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-500">{conv.date}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
