
"use client";

import { useState } from "react";
import type { Scenario } from "@/types/game";

interface PresentationPanelProps {
  scenario: Scenario;
  playerName: string;
  onSubmit: (answer: string) => void;
}

export default function PresentationPanel({
  scenario,
  playerName,
  onSubmit,
}: PresentationPanelProps) {
  const [answer, setAnswer] = useState("");
  const [hasPresented, setHasPresented] = useState(false);

  function confirmPresentation() {
    if (!answer.trim()) return;

    setHasPresented(true);
    onSubmit(answer.trim());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-amber-400/40 bg-[#151D38] shadow-2xl">

        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">
            PLAYER PRESENTATION
          </span>

          <h2 className="mt-4 text-2xl font-black text-white">
            Present Your Solution
          </h2>

          <p className="mt-2 text-sm text-amber-100">
            {playerName}, explain your business strategy to the other players.
          </p>
        </div>

        <div className="space-y-5 p-6">

          <section>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Business Challenge
            </p>

            <h3 className="mt-2 text-lg font-bold text-white">
              {scenario.title}
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {scenario.question}
            </p>
          </section>

          <section>
            <div className="flex justify-between items-center gap-2 mb-2">
              <label
                htmlFor="presentation-answer"
                className="text-sm font-bold text-white"
              >
                Your Written Solution
              </label>

              <span className="text-xs text-slate-400">
                {answer.trim().length} characters
              </span>
            </div>

            <textarea
              id="presentation-answer"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              disabled={hasPresented}
              placeholder="Explain your proposed business solution, the steps you would take, and why your strategy would work..."
              rows={6}
              className="w-full resize-y rounded-xl border border-slate-600 bg-[#0D142B] p-4 text-sm leading-relaxed text-white outline-none transition focus:border-amber-400 disabled:opacity-60"
            />
          </section>

          <section className="rounded-xl border border-indigo-400/30 bg-indigo-400/10 p-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎤</span>
              <h3 className="font-bold text-white">
                Verbal Presentation
              </h3>
            </div>

            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Present your written solution verbally to the other participants. Explain your reasoning and be prepared to answer their questions.
            </p>

            <p className="mt-2 text-xs text-indigo-200">
              This prototype uses in-person presentation. No microphone is required.
            </p>
          </section>

          {!hasPresented ? (
            <button
              onClick={confirmPresentation}
              disabled={!answer.trim()}
              className="w-full rounded-xl bg-amber-400 py-4 font-black text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              I've Finished Presenting →
            </button>
          ) : (
            <div className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-4 text-center">
              <p className="font-bold text-emerald-300">
                ✓ Presentation Submitted
              </p>

              <p className="mt-1 text-sm text-slate-300">
                Your written solution has been recorded. The next stage is player evaluation.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
