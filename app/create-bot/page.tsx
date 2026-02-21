"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import StepIndicator from "@/components/StepIndicator";
import { useBot } from "@/components/BotContext";

type ErrorCode = "RATE_LIMIT" | "ACCESS_DENIED";

type ScanStep = "idle" | "fetching" | "products" | "policies" | "done" | "error";

const PROGRESS_STEPS: { key: ScanStep; label: string }[] = [
  { key: "fetching", label: "Fetching website..." },
  { key: "products", label: "Products found" },
  { key: "policies", label: "Extracting policies & help content..." },
];

export default function CreateBotPage() {
  const router = useRouter();
  const { setScrapedData, scrapedData } = useBot();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const [scanStep, setScanStep] = useState<ScanStep>("idle");
  const [progressPercent, setProgressPercent] = useState(0);
  const [lastResult, setLastResult] = useState<{ title: string; description: string; content: string; products: { name: string }[] } | null>(null);
  const [forceShowForm, setForceShowForm] = useState(false);

  // Simulate progress while request is in flight
  useEffect(() => {
    if (!loading) return;
    setScanStep("fetching");
    setProgressPercent(10);
    const t1 = setTimeout(() => {
      setScanStep("products");
      setProgressPercent(45);
    }, 600);
    const t2 = setTimeout(() => {
      setScanStep("policies");
      setProgressPercent(75);
    }, 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [loading]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorCode(null);
    setLastResult(null);
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a valid website URL.");
      return;
    }

    setLoading(true);
    setProgressPercent(10);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      setProgressPercent(95);
      setScanStep("done");

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const message = body.error || "Failed to scrape website. Please try another URL.";
        if (body.code === "RATE_LIMIT" || body.code === "ACCESS_DENIED") {
          setErrorCode(body.code);
        }
        throw new Error(message);
      }

      const data = await res.json();
      setProgressPercent(100);
      setLastResult({
        title: data.title || "",
        description: data.description || "",
        content: data.content || "",
        products: Array.isArray(data.products) ? data.products : [],
      });
      setScrapedData({
        url: trimmed,
        title: data.title || "",
        description: data.description || "",
        content: data.content || "",
        products: Array.isArray(data.products) ? data.products : [],
      });
    } catch (err: unknown) {
      setScanStep("error");
      setError(err instanceof Error ? err.message : "Something went wrong while scraping the website.");
    } finally {
      setLoading(false);
    }
  };

  const hasResult = !!lastResult;
  const showProductList = hasResult && lastResult!.products && lastResult!.products.length > 0;
  const showForm = ((!hasResult && !loading && !scrapedData) || (forceShowForm && !loading));
  const showContinueOnly = hasResult && !loading && !showProductList;
  const showAlreadyConnected = scrapedData && !lastResult && !loading && !forceShowForm;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <StepIndicator currentStep={1} />

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-400">
            Step 1: Connect your website
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-100">Connect your store</h1>
          <p className="mt-2 text-slate-400">
            Enter your website URL so our AI can learn your products and brand. Data is saved and persists across refreshes.
          </p>
        </div>

        {showForm && (
          <Card className="mt-6 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Website URL
                </label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Input
                    ref={urlInputRef}
                    type="url"
                    placeholder="https://yourstore.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={loading}
                    variant="primary"
                    className="shrink-0"
                  >
                    {loading ? "Analyzing…" : "Analyze Website"}
                  </Button>
                </div>
              </div>
              {error && (
                <div className="rounded-lg border border-red-900/40 bg-red-950/40 px-3 py-3">
                  <p className="text-sm text-red-400">{error}</p>
                  {errorCode === "RATE_LIMIT" && (
                    <p className="mt-2 text-xs text-red-300/90">
                      Waiting 1–2 minutes then retrying often helps.
                    </p>
                  )}
                  {errorCode === "ACCESS_DENIED" && (
                    <p className="mt-2 text-xs text-red-300/90">
                      Use another store URL; this one blocks automated access.
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-red-800 text-red-300 hover:bg-red-900/40"
                      onClick={() => handleSubmit({ preventDefault: () => {} } as FormEvent)}
                    >
                      Try again
                    </Button>
                    {errorCode === "ACCESS_DENIED" && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-red-300 hover:bg-red-900/40"
                        onClick={() => {
                          setError(null);
                          setErrorCode(null);
                          urlInputRef.current?.focus();
                          urlInputRef.current?.select();
                        }}
                      >
                        Try a different URL
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </form>
          </Card>
        )}

        {loading && (
          <Card className="mt-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-500/20 text-primary-400">
                <svg className="h-5 w-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Scanning your content</h3>
                <p className="text-xs text-slate-400">Fetching products, policies, and FAQs...</p>
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-primary-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <ul className="space-y-2 text-sm text-slate-400">
              {PROGRESS_STEPS.map(({ key, label }) => (
                <li key={key} className="flex items-center gap-2">
                  {scanStep === key && !(key === "products" && scanStep === "done") ? (
                    <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-primary-400 animate-pulse" />
                  ) : (key === "fetching" && scanStep !== "idle") || (key === "products" && (scanStep === "products" || scanStep === "policies" || scanStep === "done")) || (key === "policies" && scanStep === "policies") || scanStep === "done" ? (
                    <span className="text-emerald-400">✔</span>
                  ) : null}
                  <span className={scanStep === key ? "text-slate-200" : ""}>{label}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {(showProductList || showContinueOnly) && lastResult && (
          <div className="mt-8 space-y-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Product feed & data — synced just now
            </p>
            <Card>
              <h2 className="text-sm font-semibold text-slate-200">Product feed & data</h2>
              {showProductList && lastResult.products.length > 0 ? (
                <>
                  <p className="mt-1 text-xs text-slate-500">
                    {lastResult.products.length} product{lastResult.products.length !== 1 ? "s" : ""} detected. Data is saved and updates in real time.
                  </p>
                  <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-2">
                    {lastResult.products.slice(0, 20).map((p, i) => (
                      <li
                        key={`${p.name}-${i}`}
                        className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2 text-sm"
                      >
                        <span className="text-slate-200">{p.name}</span>
                        <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
                          Active
                        </span>
                      </li>
                    ))}
                  </ul>
                  {lastResult.products.length > 20 && (
                    <p className="mt-2 text-xs text-slate-500">
                      + {lastResult.products.length - 20} more
                    </p>
                  )}
                </>
              ) : (
                <div className="mt-4 rounded-lg border border-slate-600 bg-slate-800/40 py-8 text-center">
                  <p className="text-slate-400">No products found</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Website content was saved. You can continue to step 2 to train your chatbot.
                  </p>
                </div>
              )}
            </Card>
            <div className="flex justify-end">
              <Button variant="primary" onClick={() => router.push("/bot-personality")}>
                Continue to step 2
              </Button>
            </div>
          </div>
        )}

        {showAlreadyConnected && (
          <Card className="mt-6">
            <p className="text-slate-400">Store already connected: <span className="font-medium text-slate-200">{scrapedData!.url}</span></p>
            <p className="mt-2 text-sm text-slate-500">{scrapedData!.products?.length ?? 0} products in knowledge base. Data persists when you refresh.</p>
            <div className="mt-4 flex gap-3">
              <Button variant="primary" onClick={() => router.push("/bot-personality")}>
                Continue to Training
              </Button>
              <Button variant="outline" onClick={() => { setUrl(""); setLastResult(null); setError(null); setForceShowForm(true); }}>
                Analyze another URL
              </Button>
            </div>
          </Card>
        )}

        <p className="mt-6 text-center text-xs text-slate-500">
          Works with Shopify, WooCommerce, BigCommerce, Wix, and custom stores.
        </p>
      </div>
    </AppShell>
  );
}
