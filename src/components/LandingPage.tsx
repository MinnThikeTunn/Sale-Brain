import { useMemo, useState } from "react";

type LandingPageProps = {
  onEnter: () => void;
};

const runtimeLogs = [
  { time: "00:00:01", scope: "tenant.core", message: "loaded isolation schema: shop_id -> partition key", status: "ok" },
  { time: "00:00:03", scope: "lead.pipe", message: "incoming lead normalized from Telegram session", status: "parse" },
  { time: "00:00:05", scope: "gemini.intent", message: "generated cart intent: browse -> qualify -> invoice", status: "ai" },
  { time: "00:00:08", scope: "payment.hook", message: "webhook signature validated and mapped to order ledger", status: "valid" },
  { time: "00:00:13", scope: "fallback.llm", message: "localized response reserve online for low-latency handoff", status: "ready" }
];

const features = [
  {
    title: "Polymorphic Safety Matrix",
    metric: "tenant.boundary.strict",
    body: "Explicit data boundaries keep shop schemas robust, inspectable, and isolated at the database core."
  },
  {
    title: "Autonomous Action Brain",
    metric: "workflow.builder.none",
    body: "Contextual execution runs independently of brittle step-by-step workflow builders and manual operator routing."
  },
  {
    title: "Asynchronous Validation",
    metric: "webhook.latency.realtime",
    body: "Gateway events map directly into backend order state, receipt review, and fulfillment readiness."
  },
  {
    title: "High-Tech Infrastructure",
    metric: "fastapi.beanie.llm",
    body: "Industrial-grade stability designed around FastAPI, Beanie ORM, Gemini reasoning, and localized fallback models."
  }
];

const footerLinks = ["Documentation", "Architecture", "Runtime", "Security"];

export function LandingPage({ onEnter }: LandingPageProps) {
  const [activeLog, setActiveLog] = useState(0);
  const selectedLog = runtimeLogs[activeLog];

  const terminalRows = useMemo(
    () =>
      runtimeLogs.map((log, index) => ({
        ...log,
        isActive: index === activeLog
      })),
    [activeLog]
  );

  return (
    <div className="salesbrain-landing min-h-screen bg-[#070f21] text-slate-100 selection:bg-emerald-400 selection:text-slate-950">
      <style>{`
        .salesbrain-landing {
          --sb-bg: #070f21;
          --sb-panel: rgba(2, 6, 23, 0.72);
          --sb-line: rgba(148, 163, 184, 0.18);
          --sb-line-strong: rgba(148, 163, 184, 0.34);
          --sb-muted: #94a3b8;
          --sb-soft: #cbd5e1;
          --sb-white: #f8fafc;
          --sb-green: #34d399;
          --sb-blue: #38bdf8;
          --sb-indigo: #818cf8;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background:
            linear-gradient(var(--sb-line) 1px, transparent 1px),
            linear-gradient(90deg, var(--sb-line) 1px, transparent 1px),
            radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.09), transparent 30rem),
            var(--sb-bg);
          background-size: 72px 72px, 72px 72px, auto, auto;
        }

        .salesbrain-shell {
          width: min(1180px, calc(100% - 32px));
          margin: 0 auto;
        }

        .salesbrain-status-dot {
          box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.12);
        }

        .salesbrain-terminal-row {
          grid-template-columns: 76px minmax(112px, 0.55fr) minmax(0, 1fr) 72px;
        }

        @media (max-width: 760px) {
          .salesbrain-shell {
            width: min(100% - 24px, 1180px);
          }

          .salesbrain-terminal-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <header className="salesbrain-shell flex items-center justify-between gap-4 border-b border-slate-500/20 py-5">
        <a href="#top" className="font-mono text-sm font-extrabold tracking-widest text-slate-50">
          SalesBrain.AI
        </a>
        <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-emerald-300">
          <span className="salesbrain-status-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Engine v1.5 Live
        </div>
      </header>

      <main id="top">
        <section className="salesbrain-shell grid min-h-[calc(100vh-76px)] content-center gap-12 py-16 md:grid-cols-[1.02fr_0.98fr] md:py-20">
          <div className="max-w-3xl">
            <p className="mb-5 font-mono text-[11px] font-extrabold uppercase tracking-widest text-sky-300">
              Autonomous sales execution for modern SMEs
            </p>
            <h1 className="text-5xl font-semibold leading-[0.98] tracking-normal text-slate-50 sm:text-6xl lg:text-7xl">
              Don&apos;t worry about the sales, we will handle it
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              SalesBrain AI is a digital executive branch for commerce teams that need the work done, not another tool to operate. Multi-tenant AI agents qualify leads, generate intent, validate payments, and keep the backend ledger moving while owners stay out of the loop until judgment is required.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onEnter}
                className="h-11 border border-slate-100 bg-slate-100 px-5 font-mono text-[11px] font-extrabold uppercase tracking-widest text-slate-950 transition hover:bg-white"
              >
                Enter Console
              </button>
              <a
                href="#architecture"
                className="flex h-11 items-center justify-center border border-slate-500/30 px-5 font-mono text-[11px] font-extrabold uppercase tracking-widest text-slate-300 transition hover:border-slate-300 hover:text-white"
              >
                Inspect Runtime
              </a>
            </div>
          </div>

          <section aria-label="Interface sandbox" className="border border-slate-500/25 bg-slate-950/60">
            <div className="flex items-center justify-between border-b border-slate-500/25 px-4 py-3">
              <div>
                <p className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Interface Sandbox</p>
                <h2 className="mt-1 text-sm font-semibold text-slate-100">agent-runtime.log</h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveLog((current) => (current + 1) % runtimeLogs.length)}
                className="border border-slate-600 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-300 transition hover:border-emerald-400 hover:text-emerald-300"
              >
                Step
              </button>
            </div>
            <div className="divide-y divide-slate-500/15 font-mono text-[11px]">
              {terminalRows.map((log, index) => (
                <button
                  key={log.time}
                  type="button"
                  onClick={() => setActiveLog(index)}
                  className={`salesbrain-terminal-row grid w-full gap-3 px-4 py-3 text-left transition ${
                    log.isActive ? "bg-emerald-400/10 text-slate-100" : "text-slate-400 hover:bg-slate-800/35"
                  }`}
                >
                  <span>{log.time}</span>
                  <span className={log.isActive ? "text-sky-300" : "text-slate-500"}>{log.scope}</span>
                  <span className="leading-5">{log.message}</span>
                  <span className={log.isActive ? "text-emerald-300" : "text-slate-500"}>{log.status}</span>
                </button>
              ))}
            </div>
            <div className="border-t border-slate-500/25 px-4 py-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">selected trace</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {selectedLog.scope}: {selectedLog.message}
              </p>
            </div>
          </section>
        </section>

        <section id="architecture" className="salesbrain-shell py-12">
          <div className="mb-5 flex items-end justify-between gap-4 border-b border-slate-500/20 pb-4">
            <div>
              <p className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Polymorphic Safety Grid</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-50">Infrastructure that behaves like an operator.</h2>
            </div>
            <p className="hidden max-w-sm text-right font-mono text-[10px] uppercase leading-5 tracking-widest text-slate-500 md:block">
              isolated data, autonomous decisions, validated settlement
            </p>
          </div>
          <div className="grid border border-slate-500/25 md:grid-cols-2">
            {features.map((feature) => (
              <article key={feature.title} className="min-h-56 border-b border-slate-500/25 p-5 last:border-b-0 md:border-r md:even:border-r-0 md:[&:nth-last-child(-n+2)]:border-b-0">
                <p className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-emerald-300">{feature.metric}</p>
                <h3 className="mt-8 text-lg font-semibold text-slate-50">{feature.title}</h3>
                <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="salesbrain-shell py-12">
          <div className="border-l-2 border-emerald-400 bg-slate-950/35 px-6 py-8">
            <p className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-emerald-300">Architectural Philosophy</p>
            <p className="mt-4 max-w-4xl text-2xl font-medium leading-snug text-slate-100">
              The shift is not from spreadsheets to dashboards. It is from human operational overhead to an automated utility layer that observes, decides, validates, and sustains sales execution as part of the backend.
            </p>
          </div>
        </section>
      </main>

      <footer className="salesbrain-shell grid gap-4 border-t border-slate-500/20 py-8 font-mono text-[10px] uppercase tracking-widest text-slate-500 md:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <p>Copyright 2026 SalesBrain AI. All rights reserved.</p>
          <p>Operational claims are subject to deployment configuration, data quality, and gateway availability.</p>
        </div>
        <nav className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
          {footerLinks.map((link) => (
            <a key={link} href="#architecture" className="transition hover:text-slate-200">
              {link}
            </a>
          ))}
        </nav>
      </footer>
    </div>
  );
}
