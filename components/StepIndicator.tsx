"use client";

const STEPS = [
  { num: 1, label: "Connect Store", path: "/create-bot" },
  { num: 2, label: "Train AI", path: "/bot-personality" },
  { num: 3, label: "Install Widget", path: "/integration" },
] as const;

export default function StepIndicator({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  return (
    <nav className="flex items-center justify-center gap-2 sm:gap-4 py-2">
      {STEPS.map((step) => {
        const isActive = step.num === currentStep;
        const isPast = step.num < currentStep;
        return (
          <div
            key={step.num}
            className={`flex items-center gap-2 text-sm font-medium ${
              isActive ? "text-primary-400" : isPast ? "text-slate-400" : "text-slate-500"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                isActive
                  ? "border-primary-500 bg-primary-500/20 text-primary-400"
                  : isPast
                    ? "border-slate-500 bg-slate-800 text-slate-400"
                    : "border-slate-600 bg-transparent text-slate-500"
              }`}
            >
              {step.num}
            </span>
            <span className="hidden sm:inline">{step.label}</span>
            {step.num < 3 && (
              <span className="mx-1 h-px w-4 bg-slate-600 sm:w-8" aria-hidden />
            )}
          </div>
        );
      })}
    </nav>
  );
}
