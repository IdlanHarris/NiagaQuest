"use client";

import { useState } from "react";
import type { Scenario, Vote, VoteChoice } from "@/types/game";

interface PresentationPanelProps {
  scenario: Scenario;
  playerName: string;
  onSubmit: (answer: string) => void;
  isVoting?: boolean;
  voteResult?: { votes: Vote[]; approved: boolean } | null;
  voterNames?: Record<string, string>;
  isNpcPresenter?: boolean;
  npcAnswer?: string;
  onHumanVote?: (choice: VoteChoice) => void;
  onContinue?: () => void;
  onBack?: () => void;
  onClose?: () => void;
}

export default function PresentationPanel({
  scenario,
  playerName,
  onSubmit,
  isVoting = false,
  voteResult = null,
  voterNames = {},
  isNpcPresenter = false,
  npcAnswer = "",
  onHumanVote,
  onContinue,
  onBack,
  onClose,
}: PresentationPanelProps) {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micMessage, setMicMessage] = useState("");

  function stopMicrophone() {
    const w = window as any;
    w.__niagaQuestRecognition?.stop();
    w.__niagaQuestRecognition = null;
    setIsListening(false);
  }

  function toggleMicrophone() {
    const w = window as any;
    const SpeechRecognition =
      w.SpeechRecognition || w.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicMessage(
        "Speech-to-text is not supported by this browser. You can type your solution instead."
      );
      return;
    }

    if (isListening) {
      stopMicrophone();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-MY";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let index = event.resultIndex; index < event.results.length; index++) {
        transcript += `${event.results[index][0].transcript} `;
      }

      const spokenText = transcript.trim();
      if (spokenText) {
        setAnswer((previous) =>
          previous.trim()
            ? `${previous.trim()} ${spokenText}`
            : spokenText
        );
      }
    };

    recognition.onerror = () => {
      setMicMessage(
        "Microphone input stopped. Check your browser's microphone permission."
      );
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    w.__niagaQuestRecognition = recognition;
    setMicMessage("Speak clearly. Your speech will be transcribed into the answer box.");
    setIsListening(true);
    recognition.start();
  }

  function submitPresentation() {
    if (!answer.trim() || submitted) return;

    if (isListening) stopMicrophone();

    setSubmitted(true);
    onSubmit(answer.trim());
  }

  const approveCount =
    voteResult?.votes.filter((vote) => vote.choice === "approve").length ?? 0;
  const rejectCount =
    voteResult?.votes.filter((vote) => vote.choice === "reject").length ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-600/80 bg-[#101B2D] shadow-2xl">
        <div className="relative border-b border-slate-600/70 bg-[#172438] p-5 pr-24 sm:p-6 sm:pr-24">
          <div className="absolute right-5 top-5 flex items-center gap-2">
            {isNpcPresenter && onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Back to scenario"
                title="Back to scenario"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-600 bg-[#202D40] text-xl text-slate-200 transition hover:border-amber-300/70 hover:bg-amber-300/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-300"
              >
                <span aria-hidden="true">←</span>
              </button>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close presentation window"
                title="Close presentation"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-600 bg-[#202D40] text-xl text-slate-200 transition hover:border-rose-400/60 hover:bg-rose-500/20 hover:text-rose-200 focus:outline-none focus:ring-2 focus:ring-amber-300"
              >
                ×
              </button>
            )}
          </div>
          <span className="rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-amber-300">
            {voteResult
              ? "VOTING RESULT"
              : isVoting
                ? "PLAYER EVALUATION"
                : isNpcPresenter
                  ? "NPC PRESENTATION"
                  : "PLAYER PRESENTATION"}
          </span>

          <h2 className="mt-4 text-2xl font-black text-white">
            {voteResult
              ? voteResult.approved
                ? "Solution Approved"
                : "Solution Rejected"
              : isVoting
                ? "Votes Are Being Submitted"
                : isNpcPresenter
                  ? `${playerName}'s Proposed Solution`
                  : "Present Your Solution"}
          </h2>

          <p className="mt-2 text-sm text-slate-300">
            {voteResult
              ? voteResult.approved
                ? `${playerName}'s solution has been approved by the majority.`
                : `${playerName}'s solution has been rejected by the majority.`
              : isVoting
                ? "The remaining players are evaluating the submitted solution."
                : isNpcPresenter
                  ? "Review the NPC's proposal and cast your vote."
                  : `${playerName}, explain your business strategy to the other players.`}
          </p>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <section>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-sky-300">
              Scenario Question
            </p>
            <h3 className="mt-2 text-lg font-bold text-white">{scenario.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {scenario.question}
            </p>
          </section>

          {!isNpcPresenter && !submitted && !isVoting && !voteResult && (
            <>
              <section>
                <div className="mb-2 flex items-center justify-between gap-2">
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
                  placeholder="Explain your proposed business solution, the steps you would take, and why your strategy would work..."
                  rows={6}
                  className="w-full resize-y rounded-xl border border-slate-600 bg-[#0D142B] p-4 text-sm leading-relaxed text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400"
                />

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleMicrophone}
                    className={`rounded-lg border px-4 py-2 text-sm font-bold transition ${
                      isListening
                        ? "border-rose-400/60 bg-rose-400/10 text-rose-200"
                        : "border-slate-500 bg-[#202D40] text-slate-100 hover:border-amber-300/60"
                    }`}
                  >
                    {isListening ? "■ Stop microphone" : "🎤 Use microphone"}
                  </button>
                  <span className="text-xs text-slate-400">
                    Speech is transcribed into the solution box.
                  </span>
                </div>

                {micMessage && (
                  <p className="mt-2 text-xs text-slate-400">{micMessage}</p>
                )}
              </section>

              <section className="rounded-xl border border-sky-400/20 bg-sky-400/5 p-4">
                <p className="text-sm font-bold text-white">Verbal Presentation</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  After preparing your answer, present your solution verbally to the other participants. You can use the microphone button to transcribe your spoken answer.
                </p>
              </section>

              <button
                type="button"
                onClick={submitPresentation}
                disabled={!answer.trim()}
                className="w-full rounded-xl bg-amber-400 py-4 font-black text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Submit Solution for Voting →
              </button>
            </>
          )}

          {(isNpcPresenter || submitted || isVoting || voteResult) && (
            <section className="rounded-xl border border-slate-600 bg-[#172438] p-4">
              <p className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                {playerName}'s proposed solution
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-white">
                {isNpcPresenter ? npcAnswer : answer}
              </p>
            </section>
          )}

          {isNpcPresenter && !isVoting && !voteResult && (
            <section className="rounded-xl border border-amber-300/30 bg-amber-300/5 p-4">
              <p className="text-sm font-bold text-white">Your vote</p>
              <p className="mt-1 text-xs text-slate-300">
                Do you think this solution should pass the scenario?
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onHumanVote?.("approve")}
                  className="rounded-xl border border-emerald-400/50 bg-emerald-400/10 px-4 py-3 text-sm font-black text-emerald-200 transition hover:bg-emerald-400/20"
                >
                  ✓ Approve
                </button>
                <button
                  type="button"
                  onClick={() => onHumanVote?.("reject")}
                  className="rounded-xl border border-rose-400/50 bg-rose-400/10 px-4 py-3 text-sm font-black text-rose-200 transition hover:bg-rose-400/20"
                >
                  ✕ Reject
                </button>
              </div>
            </section>
          )}

          {isVoting && !voteResult && (
            <div className="rounded-xl border border-sky-400/30 bg-sky-400/10 p-5 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-sky-200/20 border-t-sky-300" />
              <p className="font-bold text-sky-200">
                {isNpcPresenter ? "NPCs are casting their votes" : "Collecting votes"}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {isNpcPresenter
                  ? "Your vote has been recorded. The other NPCs are completing their evaluation."
                  : "Please wait while the other players evaluate the proposal."}
              </p>
            </div>
          )}

          {voteResult && (
            <>
              <section className="rounded-xl border border-slate-600 bg-[#172438] p-4">
                <p className="mb-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Individual Player Votes
                </p>
                <div className="space-y-2">
                  {voteResult.votes.map((vote) => (
                    <div
                      key={voterNames[vote.voterId] ?? vote.voterId}
                      className="flex items-center justify-between rounded-lg bg-[#0D142B] px-3 py-2"
                    >
                      <span className="text-sm font-semibold text-slate-200">
                        {voterNames[vote.voterId] ?? vote.voterId}
                      </span>
                      <span
                        className={`text-xs font-black uppercase ${
                          vote.choice === "approve"
                            ? "text-emerald-300"
                            : "text-rose-300"
                        }`}
                      >
                        {vote.choice}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section
                className={`rounded-xl border p-4 ${
                  voteResult.approved
                    ? "border-emerald-400/40 bg-emerald-400/10"
                    : "border-rose-400/40 bg-rose-400/10"
                }`}
              >
                <p className="text-sm font-black text-white">Final vote</p>
                <div className="mt-2 flex items-end gap-5">
                  <div>
                    <p className="text-xs text-emerald-200">Approve</p>
                    <p className="text-3xl font-black text-emerald-300">{approveCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-rose-200">Reject</p>
                    <p className="text-3xl font-black text-rose-300">{rejectCount}</p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-200">
                  {voteResult.approved
                    ? "Majority approved. You pass this scenario."
                    : "Majority rejected. You will retry on your next turn."}
                </p>
              </section>

              <div className="rounded-xl border border-amber-300/30 bg-amber-300/10 p-4 text-center">
                <p className="text-sm font-semibold text-slate-200">
                  NPCs are not required to agree to continue. The human player must confirm before the next turn begins.
                </p>
                <button
                  type="button"
                  onClick={onContinue}
                  className="mt-4 w-full rounded-lg bg-amber-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 focus:ring-offset-[#172438]"
                >
                  Agree &amp; Continue
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
