"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Button from "./Button";
import Logo from "./Logo";
import ScheduleDemoModal from "./ScheduleDemoModal";

const APP_ROUTES = [
  "/dashboard",
  "/create-bot",
  "/bot-personality",
  "/bot-preview",
  "/test-chatbot",
  "/integration",
  "/demo-website",
  "/analytics",
  "/training-data",
  "/handoff-rules",
  "/conversations",
  "/forwarded-conversations",
  "/settings",
  "/admin",
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [demoOpen, setDemoOpen] = useState(false);

  const isAppArea = APP_ROUTES.some((p) => pathname.startsWith(p));

  const handleLogout = () => {
    try {
      document.cookie = "mock-auth=; path=/; max-age=0";
      window.localStorage.removeItem("mock-auth");
    } catch {
      // ignore
    }
    router.push("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-black/95 backdrop-blur">
        <nav className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 py-1.5 pl-1 pr-4 sm:pl-2 sm:pr-6 lg:pl-3 lg:pr-8">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 text-slate-100 no-underline -ml-1"
          >
            <Logo size="lg" />
            <span className="text-base font-semibold leading-tight sm:text-lg whitespace-nowrap">
              Ecommerce Support in One Click
            </span>
          </Link>

          {!isAppArea && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-6">
              <Link
                href="/multi-agent"
                className="text-sm font-medium text-slate-400 hover:text-slate-100"
              >
                Multi-Agent
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-slate-400 hover:text-slate-100"
              >
                Pricing
              </Link>
            </div>
          )}

          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            {isAppArea ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-slate-600 bg-transparent px-3 py-1.5 text-sm font-medium text-slate-300 hover:border-slate-500 hover:bg-slate-800 hover:text-slate-100"
              >
                Logout
              </button>
            ) : (
              <>
                <Button variant="primary" onClick={() => setDemoOpen(true)}>
                  Demo
                </Button>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-400 hover:text-slate-100"
                >
                  Log in
                </Link>
                <Link href="/signup">
                  <Button variant="primary">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <ScheduleDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  );
}
