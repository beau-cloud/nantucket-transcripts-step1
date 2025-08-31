'use client';

import { useState } from 'react';
import { Check } from '../components/Check';

type DiagResponse = {
  ok: boolean;
  checks: {
    hasEnvKey: boolean;
    youtubeApiReachable: boolean;
    channelFound: boolean;
  };
  channel?: {
    id?: string;
    title?: string;
    url?: string;
  };
  keyMasked?: string;
  usedOverrideKey?: boolean;
  error?: string;
  debug?: any;
};

export default function Page() {
  const [channel, setChannel] = useState('UC-sgxA1fdoxteLNzRAUHIxA'); // Town of Nantucket channel ID
  const [ytkeyOverride, setYtkeyOverride] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagResponse | null>(null);
  const [raw, setRaw] = useState('');

  async function runDiagnostics() {
    setLoading(true);
    setResult(null);
    setRaw('');
    try {
      const params = new URLSearchParams();
      if (channel) params.set('channel', channel.trim());
      if (ytkeyOverride) params.set('ytkey', ytkeyOverride.trim());
      const res = await fetch('/api/diagnostics?' + params.toString(), { cache: 'no-store' });
      const text = await res.text();
      setRaw(text);
      const json = JSON.parse(text);
      setResult(json);
    } catch (e: any) {
      setResult({
        ok: false,
        checks: { hasEnvKey: false, youtubeApiReachable: false, channelFound: false },
        error: e?.message || 'Unknown error parsing diagnostics'
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white/90">
            Open Source Government Transcripts — Step 1: Diagnostics
          </h1>
          <p className="mt-2 text-sm text-neutral-300">
            This checks your YouTube API key and confirms we can reach the Town of Nantucket channel.
            No keys are stored; overrides are used only for this request.
          </p>
        </header>

        <section className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <div className="mb-1 text-xs uppercase tracking-wide text-neutral-400">Channel (URL, @handle, or UC… ID)</div>
              <input
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 placeholder-neutral-500 outline-none focus:ring-2 focus:ring-neutral-500"
                placeholder="@TownofNantucket or https://youtube.com/channel/UC-…"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              />
              <div className="mt-1 text-xs text-neutral-400">Default is Town of Nantucket: UC-sgxA1fdoxteLNzRAUHIxA</div>
            </label>

            <label className="block">
              <div className="mb-1 text-xs uppercase tracking-wide text-neutral-400">Optional: Temporary YT API key override</div>
              <input
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 placeholder-neutral-500 outline-none focus:ring-2 focus:ring-neutral-500"
                placeholder="Use only for testing; env key is preferred"
                value={ytkeyOverride}
                onChange={(e) => setYtkeyOverride(e.target.value)}
              />
              <div className="mt-1 text-xs text-neutral-400">If empty, we use the server env var YT_API_KEY.</div>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={runDiagnostics}
              disabled={loading}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-50"
            >
              {loading ? 'Running…' : 'Run diagnostics'}
            </button>
            {result && (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2"><span className="text-xs text-neutral-400">Key:</span><Check ok={!!result.checks?.hasEnvKey || !!result.usedOverrideKey} /></div>
                <div className="flex items-center gap-2"><span className="text-xs text-neutral-400">API:</span><Check ok={!!result.checks?.youtubeApiReachable} /></div>
                <div className="flex items-center gap-2"><span className="text-xs text-neutral-400">Channel:</span><Check ok={!!result.checks?.channelFound} /></div>
              </div>
            )}
          </div>

          {result && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              <h2 className="text-sm font-semibold text-neutral-200">Result</h2>
              <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap text-xs text-neutral-300">{raw}</pre>
            </div>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5">
          <h3 className="text-sm font-semibold text-neutral-200">Next steps</h3>
          <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-neutral-300">
            <li>Create <code>.env.local</code> in the project root and set <code>YT_API_KEY</code> (see <code>.env.local.example</code>).</li>
            <li>Run <code>npm i</code>, then <code>npm run dev</code>, and open <code>http://localhost:3000</code>.</li>
            <li>Run diagnostics above and confirm all checks are green.</li>
            <li>After that, we’ll add <code>/api/videos</code> and the board/date filtering UI.</li>
          </ol>
        </section>
      </div>
    </main>
  );
}
