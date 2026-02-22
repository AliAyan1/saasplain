"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [demoOpen, setDemoOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAppArea = APP_ROUTES.some((p) => pathname.startsWith(p));

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    try {
      document.cookie = "mock-auth=; path=/; max-age=0";
      window.localStorage.removeItem("mock-auth");
    } catch {
      // ignore
    }
    router.push("/login");
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const navLinks = !isAppArea ? (
    <>
      <Link
        href="/multi-agent"
        onClick={closeMobileMenu}
        className="text-sm font-medium text-slate-400 hover:text-slate-100"
      >
        Multi-Agent
      </Link>
      <Link
        href="/pricing"
        onClick={closeMobileMenu}
        className="text-sm font-medium text-slate-400 hover:text-slate-100"
      >
        Pricing
      </Link>
    </>
  ) : null;

  const rightSection = isAppArea ? (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-md border border-slate-600 bg-transparent px-3 py-1.5 text-sm font-medium text-slate-300 hover:border-slate-500 hover:bg-slate-800 hover:text-slate-100"
    >
      Logout
    </button>
  ) : (
    <>
      <Button variant="primary" onClick={() => { setDemoOpen(true); closeMobileMenu(); }}>
        Demo
      </Button>
      <Link
        href="/login"
        onClick={closeMobileMenu}
        className="text-sm font-medium text-slate-400 hover:text-slate-100"
      >
        Log in
      </Link>
      <Link href="/signup" onClick={closeMobileMenu}>
        <Button variant="primary">Get Started</Button>
      </Link>
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-black/95 backdrop-blur">
        <nav className="relative mx-auto flex max-w-7xl items-center justify-between gap-2 py-2 pl-2 pr-2 sm:gap-3 sm:py-1.5 sm:pl-2 sm:pr-6 lg:pl-3 lg:pr-8">
          {/* Logo + title - always visible, truncate on very small screens */}
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="flex min-w-0 shrink items-center gap-1.5 text-slate-100 no-underline sm:gap-2"
          >
            <Logo size="lg" />
            <span className="truncate text-sm font-semibold leading-tight sm:text-base sm:whitespace-nowrap lg:text-lg">
              Ecommerce Support in One Click
            </span>
          </Link>

          {/* Desktop: center links */}
          {!isAppArea && (
            <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:flex items-center gap-6">
              {navLinks}
            </div>
          )}

          {/* Desktop: right section */}
          <div className="hidden shrink-0 items-center gap-3 sm:flex sm:gap-4">
            {rightSection}
          </div>

          {/* Mobile: hamburger */}
          <div className="flex shrink-0 items-center gap-2 sm:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <CloseIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 top-[53px] z-40 bg-black/90 backdrop-blur sm:hidden"
            aria-hidden={!mobileMenuOpen}
          >
            <div className="flex flex-col gap-1 border-t border-slate-800 bg-black px-4 py-4">
              {navLinks && (
                <div className="flex flex-col gap-1 border-b border-slate-800 pb-4">
                  <Link
                    href="/multi-agent"
                    onClick={closeMobileMenu}
                    className="rounded-lg px-3 py-2.5 text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                  >
                    Multi-Agent
                  </Link>
                  <Link
                    href="/pricing"
                    onClick={closeMobileMenu}
                    className="rounded-lg px-3 py-2.5 text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                  >
                    Pricing
                  </Link>
                </div>
              )}
              <div className="flex flex-col gap-1 pt-2">
                {isAppArea ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-lg border border-slate-600 bg-transparent px-3 py-2.5 text-left text-sm font-medium text-slate-300 hover:border-slate-500 hover:bg-slate-800 hover:text-slate-100"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => { setDemoOpen(true); closeMobileMenu(); }}
                      className="rounded-lg bg-primary-500 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-primary-600"
                    >
                      Demo
                    </button>
                    <Link
                      href="/login"
                      onClick={closeMobileMenu}
                      className="rounded-lg px-3 py-2.5 text-center text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      onClick={closeMobileMenu}
                      className="rounded-lg bg-primary-500 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-primary-600"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
      <ScheduleDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  );
}
