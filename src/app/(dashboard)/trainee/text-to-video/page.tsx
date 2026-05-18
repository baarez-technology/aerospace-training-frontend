'use client';

import { useState, useEffect, useRef } from 'react';

const T2V_API = process.env.NEXT_PUBLIC_T2V_API || 'http://localhost:8100';

const DEMO_QUESTIONS = [
  "How does the F-16 engine start?",
  "How does the fly-by-wire flight control system work?",
  "How does the F-16 hydraulic system work?",
  "How does the ejection sequence work?",
  "How does the F-16 fuel system work?",
];

export default function TextToVideoPage() {
  const [question, setQuestion] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startGeneration = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      const res = await fetch(`${T2V_API}/api/t2v/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, domain: 'aerospace' }),
      });

      if (res.status === 403) {
        const data = await res.json();
        const detail = data.detail || {};
        setError(detail.message || 'This question is not available in demo mode.');
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data = await res.json();
      setJobId(data.job_id);

      pollRef.current = setInterval(async () => {
        try {
          const pollRes = await fetch(`${T2V_API}/api/t2v/status/${data.job_id}`);
          const pollData = await pollRes.json();
          setStatus(pollData);

          if (pollData.status === 'completed' || pollData.status === 'failed') {
            if (pollRef.current) clearInterval(pollRef.current);
            setLoading(false);
          }
        } catch {
          // retry silently
        }
      }, 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start generation');
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const verdictColor = (v: string) => ({
    VERIFIED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    CORRECTED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    FLAGGED: 'bg-red-500/20 text-red-400 border-red-500/30',
  }[v] || 'bg-gray-500/20 text-gray-400 border-gray-500/30');

  const result = status as Record<string, unknown> | null;
  const steps = (result?.steps || []) as { step: number; title: string; verdict: string }[];
  const isCompleted = result?.status === 'completed';
  const isFailed = result?.status === 'failed';
  const isRunning = loading && !isCompleted && !isFailed;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Text-to-Video Generator
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          F-16C/D Fighting Falcon — Generate animated training videos from the Flight Manual
        </p>
        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700/40 rounded-full">
          <span className="w-2 h-2 bg-blue-500 rounded-full" />
          <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">SME-Validated Training Modules</span>
        </div>
      </div>

      {/* Question Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Select a validated training module for video generation
        </label>

        <div className="space-y-2">
          {DEMO_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => setQuestion(q)}
              disabled={loading}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                question === q
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-300 dark:hover:border-blue-500/30'
              }`}
            >
              {q}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
          <span className="text-xs text-gray-500 uppercase tracking-wide">or ask your own question</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
        </div>

        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={loading}
          rows={3}
          placeholder="e.g. How does the F-16 leading-edge flap system operate?"
          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all resize-none"
        />
        <p className="text-xs text-gray-500">
          Ask anything about the F-16C/D — answers are grounded in the Flight Manual. Repeated
          questions are served instantly from cache.
        </p>

        <button
          onClick={startGeneration}
          disabled={loading || !question.trim()}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {loading ? 'Generating Video...' : 'Generate Video'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Progress */}
      {isRunning && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="font-medium text-gray-900 dark:text-white">
              {(result?.progress as string) || 'Processing...'}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
          <p className="text-sm text-gray-500">
            Status: {(result?.status as string) || 'queued'} — This may take 2-3 minutes
          </p>
        </div>
      )}

      {/* Failed */}
      {isFailed && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400">
          Generation failed: {(result?.error as string) || 'Unknown error'}
        </div>
      )}

      {/* Completed */}
      {isCompleted && result && (
        <div className="space-y-6">
          <div className="bg-black rounded-xl overflow-hidden">
            <video
              controls
              autoPlay
              className="w-full aspect-video"
              src={`${T2V_API}${result.video_url}`}
            >
              Your browser does not support video playback.
            </video>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Steps', value: (result.phase2 as Record<string, unknown>)?.total_steps || '-' },
              { label: 'Frames', value: (result.phase3 as Record<string, unknown>)?.total_frames || '-' },
              { label: 'Validated', value: (result.phase3 as Record<string, unknown>)?.frames_ok || '-' },
              { label: 'Time', value: `${Math.round(result.elapsed_s as number || 0)}s` },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{String(s.value)}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {steps.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Animation Steps</h3>
              <div className="space-y-3">
                {steps.map((step) => (
                  <div key={step.step} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold">
                      {step.step}
                    </span>
                    <span className="flex-1 text-gray-900 dark:text-white">{step.title}</span>
                    <span className={`px-2 py-1 text-xs rounded-full border ${verdictColor(step.verdict)}`}>
                      {step.verdict}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
