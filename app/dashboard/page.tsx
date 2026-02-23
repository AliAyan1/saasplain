"use client";

import Link from "next/link";
import { useState } from "react";
import AppShell from "@/components/AppShell";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { useBot } from "@/components/BotContext";

const WIDGET_SNIPPET = `<script src="https://yourapp.com/widget.js"></script>`;

const TOTAL_CONVERSATIONS = 100;

// Mock metrics (replace with API later)
const MOCK = {
  resolutionRate: 92.4,
  resolutionRateChange: "+4.1%",
  ticketsCreated: 48,
  queriesClosed: 124,
};

function formatTimeAgo(ms: number): string {
  const sec = Math.floor((Date.now() - ms) / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

export default function DashboardPage() {
  const { conversationRemaining, scrapedData, personality, forwarded, recentActivity } = useBot();
  const used = TOTAL_CONVERSATIONS - conversationRemaining;
  const [copied, setCopied] = useState(false);
  const isNewUser = scrapedData && personality;

  const handleCopySnippet = async () => {
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
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {isNewUser && (
          <section className="mb-8">
            <Card className="border-primary-500/30 bg-primary-500/5">
              <h2 className="text-sm font-semibold text-slate-200">
                Integration - Install your chatbot
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Copy this snippet and add it to your website to embed the chatbot.
              </p>
              <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-xs font-mono text-slate-100">
                {WIDGET_SNIPPET}
              </div>
              <Button
                variant="secondary"
                className="mt-3"
                onClick={handleCopySnippet}
              >
                {copied ? "Copied!" : "Copy snippet"}
              </Button>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/integration">
                  <Button
                    variant="ghost"
                    className="text-primary-400 hover:text-primary-300"
                  >
                    Full integration guide
                  </Button>
                </Link>
                <Link href="/test-chatbot">
                  <Button
                    variant="ghost"
                    className="text-primary-400 hover:text-primary-300"
                  >
                    Test chatbot
                  </Button>
                </Link>
              </div>
            </Card>
          </section>
        )}

        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100">Main Dashboard</h1>
          <p className="mt-1 text-slate-400">
            Overview of conversations, resolution, tickets, and recent activity.
          </p>
        </header>

        {/* Primary metrics */}
        <section className="mb-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Primary metrics
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Conversations done
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-100">{used}</p>
              <p className="mt-1 text-sm text-slate-400">
                {conversationRemaining} remaining of {TOTAL_CONVERSATIONS}
              </p>
            </Card>
            <Card>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Resolution rate
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-400">{MOCK.resolutionRate}%</p>
              <p className="mt-1 text-sm text-slate-400">{MOCK.resolutionRateChange} vs last period</p>
            </Card>
            <Card>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Tickets created
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-100">{MOCK.ticketsCreated}</p>
              <p className="mt-1 text-sm text-slate-400">Escalated to human support</p>
            </Card>
            <Card>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Queries closed
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-100">{MOCK.queriesClosed}</p>
              <p className="mt-1 text-sm text-slate-400">Resolved or closed</p>
            </Card>
          </div>
        </section>

        {/* Conversations & Forwarded */}
        <section className="mb-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="text-sm font-semibold text-slate-200">Conversations</h2>
            <p className="mt-2 text-slate-400">
              Total used: <span className="font-semibold text-slate-100">{used}</span> / {TOTAL_CONVERSATIONS}.
              <span className="ml-1 text-slate-400">{conversationRemaining} left in plan.</span>
            </p>
            <Link href="/conversations" className="mt-4 inline-block">
              <Button variant="ghost" className="text-primary-400 hover:text-primary-300">
                View conversations
              </Button>
            </Link>
          </Card>
          <Card>
            <h2 className="text-sm font-semibold text-slate-200">Forwarded conversations</h2>
            <p className="mt-2 text-slate-400">
              <span className="font-semibold text-slate-100">
                {forwarded.length}
              </span>{" "}
              conversations forwarded to email or marked as tickets this session.
            </p>
            <Link href="/forwarded-conversations" className="mt-4 inline-block">
              <Button variant="ghost" className="text-primary-400 hover:text-primary-300">
                View forwarded
              </Button>
            </Link>
          </Card>
        </section>

        {/* Recent activity - real time */}
        <section id="recent" className="scroll-mt-4">
          <Card>
            <h2 className="text-sm font-semibold text-slate-200">Recent activity</h2>
            <ul className="mt-4 space-y-3">
              {recentActivity.length === 0 ? (
                <li className="rounded-lg border border-slate-700/80 bg-slate-800/40 p-4 text-center text-sm text-slate-500">
                  No activity yet. Chat with your bot or forward conversations to see live updates.
                </li>
              ) : (
                recentActivity.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-slate-700/80 bg-slate-800/40 p-3 text-sm"
                  >
                    <div>
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                          item.type === "resolved"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : item.type === "forwarded"
                              ? "bg-sky-500/15 text-sky-400"
                              : item.type === "warning"
                                ? "bg-amber-500/15 text-amber-400"
                                : item.type === "system"
                                  ? "bg-slate-500/15 text-slate-400"
                                  : "bg-slate-500/15 text-slate-400"
                        }`}
                      >
                        {item.type.toUpperCase()}
                      </span>
                      <p className="mt-1 font-medium text-slate-200">{item.title}</p>
                      <p className="text-slate-400">{item.detail}</p>
                    </div>
                    <span className="shrink-0 text-xs text-slate-500">
                      {formatTimeAgo(item.createdAt)}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
