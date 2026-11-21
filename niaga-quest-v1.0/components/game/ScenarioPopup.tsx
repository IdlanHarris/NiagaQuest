"use client";

import type { Scenario } from "@/types/game";

interface ScenarioPopupProps {
  scenario: Scenario;
  onContinue: () => void;
  onHide: () => void;
}

export default function ScenarioPopup({
  scenario,
  onContinue,
  onHide,
}: ScenarioPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="scenario-title"
        className="w-full max-w-3xl max-h-[96vh] overflow-y-auto rounded-2xl border border-slate-600/80 bg-[#101B2D] shadow-2xl"
      >
        {/* Header */}
        <header className="border-b border-slate-600/70 bg-[#172438] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex rounded-full border border-sky-300/30 bg-sky-400/10 px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-sky-300">
                BUSINESS SCENARIO
              </span>
              <h2
                id="scenario-title"
                className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl"
              >
                {scenario.title}
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Think like an entrepreneur. How would you handle this situation?
              </p>
            </div>

            {/* Close only — the scenario can be reopened from its floating tab. */}
            <button
              type="button"
              onClick={onHide}
              aria-label="Close scenario window"
              title="Close"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-600 bg-[#202D40] text-xl text-slate-200 transition hover:border-rose-400/60 hover:bg-rose-500/20 hover:text-rose-200"
            >
              ×
            </button>
          </div>
        </header>

        <div className="space-y-4 p-5 sm:space-y-5 sm:p-6">
          {/* Situation */}
          <section>
            <h3 className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-sky-300">
              The Situation
            </h3>
            <p className="leading-relaxed text-slate-200">
              {scenario.description}
            </p>
          </section>

          {/* Challenge */}
          <section className="rounded-xl border border-[#607F91] bg-[#263F52] p-4 sm:p-5">
            <h3 className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-sky-200">
              Your Challenge
            </h3>
            <p className="text-base font-semibold leading-relaxed text-white sm:text-lg">
              {scenario.question}
            </p>
          </section>

          {/* Past Business Experience: 60:40 layout */}
          <section className="rounded-xl border border-slate-600/80 bg-[#172438] p-4 sm:min-h-[245px] sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">▤</span>
              <h3 className="text-sm font-black uppercase tracking-[0.12em] text-white">
                Past Business Experience
              </h3>
            </div>

            <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-[3fr_2fr] sm:gap-5">
              <div className="flex min-w-0 flex-col justify-center">
                <p className="text-sm font-bold text-slate-100">
                  Christy Ng discovers counterfeit bags in China
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  Explore a real-world case involving product imitation and brand protection. Consider how a business can respond when counterfeit products affect its reputation and customers.
                </p>
                <p className="mt-3 text-xs font-semibold text-amber-300">
                  Scan the QR code to read the article.
                </p>
                <a
                  href="https://hype.my/video-malaysian-designer-christy-ng-discovers-counterfeits-of-her-bags-in-china/"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-xs font-bold text-sky-300 underline decoration-sky-300/50 underline-offset-4 hover:text-sky-200"
                >
                  Open article directly
                </a>
              </div>

              <div className="flex min-h-[190px] flex-col items-center justify-center gap-2 rounded-lg border border-slate-300/70 bg-white p-3 sm:min-h-[205px]">
                <img
                  src="/images/niagaquest_christy_ng_case_study_qr.png"
                  alt="QR code linking to the Christy Ng counterfeit bags article on Hype.my"
                  className="h-auto w-full max-w-[180px] object-contain"
                />
                <span className="text-center text-[10px] font-black tracking-wider text-slate-700">
                  SCAN TO READ
                </span>
              </div>
            </div>
          </section>

          {/* Next step */}
          <section className="rounded-xl border border-[#8A713C]/70 bg-[#443D2D]/50 p-4">
            <h3 className="text-sm font-black text-amber-300">
              What happens next?
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-300">
              Prepare a written solution and present your ideas verbally. Other players will evaluate your proposal.
            </p>
          </section>

          <button
            type="button"
            onClick={onContinue}
            className="w-full rounded-xl bg-amber-400 px-5 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-amber-950/20 transition hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 focus:ring-offset-[#101B2D]"
          >
            Continue to Presentation →
          </button>
        </div>
      </section>
    </div>
  );
}
