
"use client";

import type { Scenario } from "@/types/game";

interface ScenarioPopupProps {
  scenario: Scenario;
  onContinue: () => void;
}

export default function ScenarioPopup({
  scenario,
  onContinue,
}: ScenarioPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">

      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-sky-400/40 bg-[#151D38] shadow-2xl">

        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-blue-700 p-6">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">
              BUSINESS SCENARIO
            </span>

            <span className="text-2xl">💡</span>
          </div>

          <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">
            {scenario.title}
          </h2>

          <p className="mt-2 text-sm text-sky-100">
            Think like an entrepreneur. How would you handle this situation?
          </p>
        </div>

        {/* Scenario content */}
        <div className="space-y-5 p-6">

          <section>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-sky-300">
              The Situation
            </h3>

            <p className="leading-relaxed text-slate-200">
              {scenario.description}
            </p>
          </section>

          <section className="rounded-xl border border-sky-400/30 bg-sky-400/10 p-5">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-sky-300">
              Your Challenge
            </h3>

            <p className="text-lg font-semibold leading-relaxed text-white">
              {scenario.question}
            </p>
          </section>

          <section className="rounded-xl border border-slate-600 bg-[#0D142B] p-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">📚</span>
              <h3 className="font-bold text-white">
                Past Business Experience
              </h3>
            </div>

            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Review an example response from a business facing a similar challenge.
            </p>

            <p className="mt-3 text-xs text-amber-300">
              Article / NFC / QR integration will be added in a later development stage.
            </p>
          </section>

          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
            <p className="text-sm font-bold text-amber-300">
              What happens next?
            </p>

            <p className="mt-1 text-sm text-slate-300">
              Prepare a written solution and present your ideas verbally. Other players will evaluate your proposal.
            </p>
          </div>

          <button
            onClick={onContinue}
            className="w-full rounded-xl bg-amber-400 py-4 font-black text-slate-950 transition hover:bg-amber-300"
          >
            Continue to Presentation →
          </button>

        </div>
      </div>
    </div>
  );
}
