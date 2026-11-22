export interface PlotNotificationData {
  title: string;
  description: string;
  moneyChange: number;
  scoreChange: number;
  movementChange: number;
  kind: "reward" | "penalty" | "movement" | "normal";
}

interface PlotNotificationProps {
  notice: PlotNotificationData;
}

export default function PlotNotification({ notice }: PlotNotificationProps) {
  const positive = notice.kind === "reward";
  const tone = positive
    ? "border-emerald-400/50 bg-[#142D2A]/95"
    : notice.kind === "penalty"
      ? "border-rose-400/50 bg-[#332127]/95"
      : "border-sky-400/50 bg-[#172B40]/95";
  const label = positive ? "REWARD RECEIVED" : notice.kind === "penalty" ? "PENALTY APPLIED" : "MOVEMENT EFFECT";

  return (
    <div className="fixed left-1/2 top-5 z-[60] w-[min(440px,calc(100vw-2rem))] -translate-x-1/2 animate-[nq-toast-in_.24s_ease-out]">
      <section role="status" aria-live="polite" className={`rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${tone}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-300">{label}</p>
            <h3 className="mt-1 text-base font-black text-white">{notice.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-300">{notice.description}</p>
          </div>
          <span className="text-xl" aria-hidden="true">{positive ? "✦" : notice.kind === "penalty" ? "!" : "↗"}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-black">
          {notice.moneyChange !== 0 && <span className={notice.moneyChange > 0 ? "text-emerald-300" : "text-rose-300"}>{notice.moneyChange > 0 ? "+" : "−"}RM{Math.abs(notice.moneyChange).toLocaleString("en-MY")}</span>}
          {notice.scoreChange !== 0 && <span className={notice.scoreChange > 0 ? "text-emerald-300" : "text-rose-300"}>{notice.scoreChange > 0 ? "+" : "−"}{Math.abs(notice.scoreChange)} achievement points</span>}
          {notice.movementChange !== 0 && <span className="text-sky-200">{notice.movementChange > 0 ? "+" : "−"}{Math.abs(notice.movementChange)} spaces</span>}
        </div>
      </section>
    </div>
  );
}
