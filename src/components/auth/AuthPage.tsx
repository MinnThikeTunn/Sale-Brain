import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const result = mode === "login" ? await signIn(email, password) : await signUp(email, password);
      if (result.error) {
        setError(result.error);
      } else if (result.needsEmailConfirmation) {
        setInfo(
          "Account created. Check your email for the confirmation link, then sign in here."
        );
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070f21] text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900/60 p-8 shadow-xl">
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Sales Brain AI</h1>
        <p className="text-sm text-slate-400 mb-6">
          {mode === "login" ? "Sign in to your shop dashboard" : "Create your shop account"}
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          {info && (
            <p className="text-sm text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 rounded-lg px-3 py-2">
              {info}
            </p>
          )}
          {error && (
            <p className="text-sm text-rose-400 bg-rose-950/40 border border-rose-800/50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {mode === "signup" && (
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Dev tip: Supabase’s built-in email allows only a few sign-up emails per hour. If you
              hit rate limits, disable “Confirm email” under Authentication → Providers → Email, or
              sign in with an account you already created.
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-2.5 text-sm font-medium transition-colors"
          >
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Sign up"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError(null);
            setInfo(null);
          }}
          className="mt-4 w-full text-center text-xs text-slate-400 hover:text-indigo-300"
        >
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
