"use client";

import AppShell from "@/components/AppShell";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { useBot, ForwardMode } from "@/components/BotContext";

const MODE_LABELS: Record<ForwardMode, string> = {
  email: "Email (full conversation)",
  ticket: "Ticket in inbox (Phase 2)",
};

export default function ForwardedConversationsPage() {
  const { forwarded, clearForwarded } = useBot();
  const hasItems = forwarded.length > 0;

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-100">Forwarded conversations</h1>
        <p className="mt-1 text-slate-400">
          Live log of conversations forwarded to email or marked as tickets. Updates in real time
          as your team forwards items—no database required in this demo.
        </p>
        <Card className="mt-6">
          {hasItems ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-400">
                  Showing{" "}
                  <span className="font-semibold text-slate-100">
                    {forwarded.length}
                  </span>{" "}
                  forwarded conversation{forwarded.length === 1 ? "" : "s"} this session.
                </p>
                <Button
                  variant="ghost"
                  className="px-3 py-1 text-xs"
                  onClick={clearForwarded}
                >
                  Clear list
                </Button>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-700/80">
                <table className="min-w-full divide-y divide-slate-700/80 text-sm">
                  <thead className="bg-slate-900/80">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Customer
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Preview
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Forwarded as
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        When
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/80 bg-slate-900/40">
                    {forwarded
                      .slice()
                      .reverse()
                      .map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-slate-100">
                            {item.customer}
                          </td>
                          <td className="px-4 py-3 text-slate-400">
                            <span className="line-clamp-2">{item.preview}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                item.forwardedAs === "email"
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : "bg-sky-500/15 text-sky-300"
                              }`}
                            >
                              {MODE_LABELS[item.forwardedAs]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">
                            {new Date(item.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-500">
                In Phase 2, email delivery and ticketing will be powered by your real support
                stack (e.g. Help Scout, Gmail, or Zendesk). This view is already wired for that
                upgrade.
              </p>
            </div>
          ) : (
            <p className="text-slate-400">
              Forwarded conversation list will appear here once you forward items from the
              Conversations screen.
            </p>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
