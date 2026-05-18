'use client';

import { useState, useRef, useEffect } from 'react';
import { sendMessage as backendSendMessage } from '@/lib/aiAssistant';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { PageTransition } from '@/components/ui/PageTransition';
import {
  Bot,
  Send,
  User,
  Sparkles,
  BookOpen,
  Wrench,
  Plane,
  Cpu,
  Lightbulb,
  RotateCcw,
  AlertCircle,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ─── AI API Config ──────────────────────────────────────────────────────────
const AI_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
const IS_OPENROUTER = AI_API_KEY?.startsWith('sk-or-');

const AI_API_URL = IS_OPENROUTER
  ? 'https://openrouter.ai/api/v1/chat/completions'
  : 'https://api.groq.com/openai/v1/chat/completions';

const AI_MODEL = IS_OPENROUTER
  ? 'meta-llama/llama-3.1-8b-instruct'
  : 'llama-3.1-8b-instant';

const SYSTEM_PROMPT = `You are an expert AI training assistant for the Indian Air Force (IAF).
You specialise in:
- Su-30MKI, MiG-29, Tejas, and other IAF aircraft systems
- Engine procedures (AL-31FP, R-29B, Kaveri)
- Hydraulics, avionics, radar, and weapons systems
- Pre-flight / post-flight checklists
- Emergency and abnormal procedures
- Maintenance and troubleshooting

Always provide structured, step-by-step answers where applicable.
Use **bold** for critical parameters and warnings.
Cite sources like "IAF Technical Manual" or "OEM documentation" when relevant.
If you are unsure, say so — never fabricate safety-critical procedures.`;
// ─────────────────────────────────────────────────────────────────────────────

const quickQuestions = [
  { icon: BookOpen, label: 'Engine start procedure', query: 'What is the engine start procedure for AL-31FP?' },
  { icon: Wrench,   label: 'Hydraulic system check',  query: 'How do I check hydraulic system pressure?' },
  { icon: Plane,    label: 'Pre-flight checklist',     query: 'What is the pre-flight checklist for Su-30MKI?' },
  { icon: Cpu,      label: 'Avionics troubleshooting', query: 'How to troubleshoot radar system issues?' },
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: string[];
  error?: boolean;
}

// ── Markdown renderer: **bold**, numbered lists, bullet lists ─────────────────
function renderMarkdown(text: string) {
  return text.split('\n').map((line, i) => {
    const numbered = line.match(/^(\d+)\.\s+(.*)/);
    const bullet   = line.match(/^[-•✓]\s+(.*)/);

    const renderInline = (raw: string) => {
      const parts = raw.split(/\*\*(.*?)\*\*/g);
      return parts.map((part, j) =>
        j % 2 === 1
          ? <strong key={j} className="text-af-navy font-bold">{part}</strong>
          : <span key={j}>{part}</span>
      );
    };

    if (numbered) {
      return (
        <div key={i} className="flex gap-2 mb-1">
          <span className="text-iaf-gold font-semibold shrink-0">{numbered[1]}.</span>
          <span>{renderInline(numbered[2])}</span>
        </div>
      );
    }
    if (bullet) {
      return (
        <div key={i} className="flex gap-2 mb-1">
          <span className="text-iaf-cyan shrink-0">•</span>
          <span>{renderInline(bullet[1])}</span>
        </div>
      );
    }
    if (line.trim() === '') return <div key={i} className="h-2" />;
    return <div key={i} className="mb-1">{renderInline(line)}</div>;
  });
}
// ─────────────────────────────────────────────────────────────────────────────

const toGroqHistory = (msgs: Message[]) =>
  msgs.filter((m) => !m.error).map(({ role, content }) => ({ role, content }));

// Source citation data for AI responses
const documentSources = [
  { doc: 'FCOM Vol.1 - Engine Systems', section: 'Section 3.2.1', relevance: 95, keywords: ['engine', 'turbofan', 'start', 'al-31', 'thrust'] },
  { doc: 'QRH - Emergency Procedures', section: 'Section 4.1', relevance: 92, keywords: ['emergency', 'fire', 'failure', 'shutdown', 'mayday'] },
  { doc: 'AMM - Hydraulic Systems', section: 'Chapter 29', relevance: 88, keywords: ['hydraulic', 'pressure', 'pump', 'fluid', 'brake'] },
  { doc: 'FCOM Vol.2 - Avionics', section: 'Section 7.3', relevance: 85, keywords: ['avionics', 'radar', 'navigation', 'display', 'hud'] },
  { doc: 'SOP - Pre-flight Checklist', section: 'Appendix A', relevance: 90, keywords: ['pre-flight', 'checklist', 'inspection', 'walkthrough'] },
  { doc: 'FCOM Vol.3 - Flight Controls', section: 'Section 5.1', relevance: 87, keywords: ['control', 'fly-by-wire', 'actuator', 'surface'] },
];

function getRelevantSources(content: string) {
  const lower = content.toLowerCase();
  return documentSources
    .filter(s => s.keywords.some(k => lower.includes(k)))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 3);
}

function SourceCitations({ messageContent }: { messageContent: string }) {
  const [expanded, setExpanded] = useState(false);
  const sources = getRelevantSources(messageContent);
  if (sources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-af-blue hover:text-af-blue/80 transition-colors"
      >
        <FileText className="w-3 h-3" />
        Document Sources ({sources.length})
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {expanded && (
        <div className="mt-2 space-y-1.5">
          {sources.map((src, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 hover:border-af-blue/30 transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-3.5 h-3.5 text-af-blue flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-900 truncate">{src.doc}</p>
                  <p className="text-[10px] text-slate-400">{src.section}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] font-bold text-af-green bg-af-green/10 px-1.5 py-0.5 rounded">{src.relevance}%</span>
                <button className="p-1 hover:bg-af-blue/10 rounded transition-colors">
                  <ExternalLink className="w-3 h-3 text-af-blue" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    role: 'assistant',
    content: 'Welcome to the IAF Training Intelligence Platform. I am your AI training assistant powered by Llama 3.1. How can I help you today with aircraft systems, maintenance procedures, or mission briefings?',
    timestamp: new Date().toISOString(),
  }]);
  const [input, setInput]       = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const callAI = async (userText: string, history: Message[]): Promise<{ content: string; fromBackend: boolean }> => {
    // Primary: backend → OpenAI/Gemini (handles auth, rate limiting, PII filter)
    try {
      const result = await backendSendMessage(userText);
      setBackendAvailable(true);
      return { content: result.assistantMessage.content, fromBackend: true };
    } catch (backendErr) {
      console.warn('Backend AI unavailable, trying direct API:', backendErr);
      setBackendAvailable(false);
    }

    // Fallback: direct Groq / OpenRouter if a key is set in the env
    if (!AI_API_KEY) throw new Error('Backend AI is unreachable and no direct API key is configured.');

    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_API_KEY}`,
        ...(IS_OPENROUTER && {
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
          'X-Title': 'IAF Training Platform',
        }),
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...toGroqHistory(history),
          { role: 'user', content: userText },
        ],
        temperature: 0.4,
        max_tokens: 1024,
        stream: false,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message ?? `Direct API error ${response.status}`);
    }
    const data = await response.json();
    return { content: data.choices?.[0]?.message?.content ?? 'No response received.', fromBackend: false };
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    setApiError(null);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const { content: aiText, fromBackend } = await callAI(userMessage.content, messages);
      const sourceLabel = fromBackend
        ? 'OpenAI GPT-4o · AEGIS'
        : IS_OPENROUTER ? 'OpenRouter · Llama 3.1' : 'Groq · Llama 3.1';
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiText,
        timestamp: new Date().toISOString(),
        sources: [sourceLabel, 'IAF Training Context'],
      }]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setApiError(msg);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ Could not get a response: ${msg}`,
        timestamp: new Date().toISOString(),
        error: true,
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setApiError(null);
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: 'Welcome to the IAF Training Intelligence Platform. I am your AI training assistant powered by Llama 3.1. How can I help you today?',
      timestamp: new Date().toISOString(),
    }]);
  };

  return (
    <PageTransition>
      <div className="flex flex-col h-[calc(100vh-4rem)] p-4 gap-3 overflow-hidden">
        {/* Header */}
        <div className="shrink-0">
          <PageHeader
            title="AI Training Assistant"
            subtitle="Ask questions about aircraft systems, procedures, and training materials"
            icon={Bot}
            actions={
              <Button variant="outline" size="sm" onClick={clearChat}
                className="border-slate-200 text-slate-600 hover:bg-slate-50">
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear Chat
              </Button>
            }
          />
        </div>

        {/* API key missing banner — only show when backend is down and no fallback key */}
        {!backendAvailable && !AI_API_KEY && (
          <div className="shrink-0 flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm text-yellow-800 shadow-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-yellow-600" />
            <span>
              <strong className="font-bold text-yellow-900">AI backend unreachable</strong> and no fallback key is configured.
              Set <code>NEXT_PUBLIC_GROQ_API_KEY</code> or <code>NEXT_PUBLIC_OPENROUTER_API_KEY</code> in your environment to enable direct AI calls.
            </span>
          </div>
        )}

        {apiError && AI_API_KEY && (
          <div className="shrink-0 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800 shadow-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            {apiError}
          </div>
        )}

        {/* Body: sidebar + chat — fills all remaining space */}
        <div className="flex flex-1 gap-4 min-h-0 overflow-hidden">
          {/* ── Left sidebar ─────────────────────────────────────────── */}
          <div className="hidden lg:flex flex-col gap-4 w-64 shrink-0 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-af-orange" />
                  <h3 className="text-sm font-bold text-af-navy uppercase tracking-wider">Quick Launch</h3>
                </div>
                <div className="space-y-2">
                  {quickQuestions.map((item, index) => (
                    <button key={index} onClick={() => setInput(item.query)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-af-blue/5 hover:border-af-blue/20 transition-all duration-200 text-left group">
                      <item.icon className="w-4 h-4 text-slate-400 group-hover:text-af-blue shrink-0 transition-colors" />
                      <span className="text-sm text-slate-600 group-hover:text-slate-900 leading-tight font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-af-blue" />
                  <h3 className="text-sm font-bold text-af-navy uppercase tracking-wider">Capabilities</h3>
                </div>
                <ul className="space-y-2.5 text-sm text-slate-600">
                  {[
                    'Explain aircraft procedures',
                    'Technical manual reference',
                    'Troubleshooting guidance',
                    'Maintenance checklists',
                    'Session memory',
                  ].map((cap) => (
                    <li key={cap} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-af-blue/40 mt-1.5 shrink-0" />
                      <span className="font-medium text-xs">{cap}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{IS_OPENROUTER ? 'OpenRouter' : 'Groq'} · Llama 3</p>
                  <div className="w-2 h-2 rounded-full bg-af-green animate-pulse shadow-sm shadow-af-green/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Chat panel ───────────────────────────────────────────── */}
          <Card className="flex flex-col flex-1 min-w-0 min-h-0 bg-white border-slate-200 shadow-md overflow-hidden rounded-2xl">
            {/* Scrollable message list */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4">
              <div className="space-y-4 pb-2">
                {messages.map((message) => (
                  <div key={message.id}
                    className={cn('flex gap-3 items-start', message.role === 'user' && 'flex-row-reverse')}>
                    {/* Avatar */}
                    <div className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm border',
                      message.role === 'assistant' ? 'bg-af-orange/10 border-af-orange/20' : 'bg-af-blue/10 border-af-blue/20',
                    )}>
                      {message.role === 'assistant'
                        ? <Bot className="w-5 h-5 text-af-orange" />
                        : <User className="w-5 h-5 text-af-blue" />}
                    </div>

                    {/* Bubble */}
                    <div className={cn(
                      'max-w-[82%] rounded-2xl p-4 text-sm shadow-sm border transition-all',
                      message.role === 'assistant'
                        ? message.error
                          ? 'bg-red-50 border-red-200 text-red-900'
                          : 'bg-slate-50 border-slate-100 text-slate-800'
                        : 'bg-af-blue text-white border-af-blue/20 shadow-af-blue/10',
                    )}>
                      {message.role === 'assistant' && !message.error
                        ? <div className="leading-relaxed font-medium">{renderMarkdown(message.content)}</div>
                        : <p className="whitespace-pre-line leading-relaxed font-medium">{message.content}</p>
                      }

                      {message.sources && message.sources.length > 0 && (
                        <div className={cn(
                          'mt-4 pt-3 border-t',
                          message.role === 'user' ? 'border-white/20' : 'border-slate-200'
                        )}>
                          <p className={cn('text-[10px] font-bold uppercase tracking-wider mb-2', message.role === 'user' ? 'text-white/60' : 'text-slate-400')}>Reference Sources:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {message.sources.map((src, idx) => (
                              <span key={idx}
                                className={cn('text-[10px] px-2 py-0.5 rounded font-bold transition-colors', message.role === 'user' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-200 text-slate-600 hover:bg-slate-300')}>
                                {src}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Enhanced Source Citations */}
                      {message.role === 'assistant' && !message.error && message.id !== 'welcome' && (
                        <SourceCitations messageContent={message.content} />
                      )}

                      <p className={cn('text-[10px] font-bold mt-2 opacity-60', message.role === 'user' ? 'text-right' : 'text-left')}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="w-9 h-9 rounded-xl bg-af-orange/10 border border-af-orange/20 flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5 text-af-orange" />
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                )}
                {/* Auto-scroll anchor */}
                <div ref={bottomRef} />
              </div>
            </div>

            {/* Input bar — pinned to bottom */}
            <div className="shrink-0 p-4 bg-white border-t border-slate-100 shadow-inner">
              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Type your question here..."
                  className="flex-1 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-af-blue focus:ring-af-blue/10 rounded-xl px-4 py-6"
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="bg-af-blue hover:bg-af-navy text-white disabled:opacity-50 shrink-0 rounded-xl px-6 h-[52px] shadow-lg shadow-af-blue/20 transition-all active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-3 text-center">
                Mission Control Intelligence System · Verified Procedures Only
              </p>
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
