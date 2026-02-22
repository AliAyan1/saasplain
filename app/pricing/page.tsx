"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Logo from "@/components/Logo";

const CheckIcon = () => (
  <svg className="h-5 w-5 shrink-0 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export default function PricingPage() {
  const [workEmail, setWorkEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [monthlyTickets, setMonthlyTickets] = useState("");

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      tagline: "Perfect for trying us out",
      features: [
        "100 conversations per month",
        "1 chatbot",
        "Website scraping",
        "Basic support",
      ],
      cta: "Start Free Trial",
      variant: "outline" as const,
      recommended: false,
    },
    {
      name: "Pro",
      price: "$99",
      period: "/month",
      tagline: "For growing businesses",
      features: [
        "Increased conversion",
        "Email support",
        "Standard integration (add other integrations)",
        "500 conversations per month",
        "Unlimited chatbots",
        "Priority support",
      ],
      cta: "Get Started",
      variant: "primary" as const,
      recommended: true,
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black">
        <section className="border-b border-slate-800 bg-black px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl lg:text-5xl">
                Simple, transparent pricing
              </h1>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-400">
                Choose the plan that fits your business. Start free, upgrade when you need more. No hidden fees.
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:gap-10 lg:max-w-4xl lg:mx-auto">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`relative flex flex-col overflow-hidden ${
                    plan.recommended
                      ? "ring-2 ring-primary-500 shadow-soft-lg bg-slate-800/80 border-primary-500/50"
                      : "border-slate-700 bg-slate-800/60"
                  }`}
                >
                  {plan.recommended && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600" />
                  )}
                  {plan.recommended && (
                    <div className="absolute top-4 right-4">
                      <span className="rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold text-white">
                        Most popular
                      </span>
                    </div>
                  )}
                  <div className="pt-6 pb-2">
                    <h2 className="text-xl font-bold text-slate-100">
                      {plan.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-4xl font-bold tracking-tight text-slate-100">
                        {plan.price}
                      </span>
                      <span className="text-slate-500">{plan.period}</span>
                    </div>
                  </div>
                  <ul className="flex-1 space-y-3 py-6 border-t border-slate-700">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-3 text-slate-300"
                      >
                        <CheckIcon />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4">
                    <Link href="/signup" className="block">
                      <Button
                        variant={plan.variant}
                        fullWidth
                        className={plan.recommended ? "shadow-soft" : ""}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            <p className="mt-10 text-center text-sm text-slate-500">
              Need a custom solution?{" "}
              <Link href="/contact" className="text-primary-400 hover:underline">
                Contact us
              </Link>
            </p>
          </div>
        </section>

        {/* Stay Updated - matches main theme, logo like reference */}
        <section className="border-t border-slate-800 bg-black px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 lg:items-start">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="shrink-0">
                  <Logo size="lg" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100 sm:text-2xl">
                    Stay Updated
                  </h2>
                  <p className="mt-3 text-slate-400">
                    Get the latest news about our AI-powered customer support platform and product updates.
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-6">
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="space-y-4"
                >
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-300">
                      Work Email
                    </span>
                    <input
                      type="email"
                      value={workEmail}
                      onChange={(e) => setWorkEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-300">
                      Website
                    </span>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="yourstore.com"
                      className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-300">
                      Monthly Support Tickets
                    </span>
                    <input
                      type="text"
                      value={monthlyTickets}
                      onChange={(e) => setMonthlyTickets(e.target.value)}
                      placeholder="500"
                      className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    />
                  </label>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-soft hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                  >
                    Submit
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
