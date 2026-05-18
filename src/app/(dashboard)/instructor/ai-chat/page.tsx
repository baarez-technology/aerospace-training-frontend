'use client';

import { useState, useRef, useEffect } from 'react';
import { sendMessage as backendSendMessage } from '@/lib/aiAssistant';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { PageTransition } from '@/components/ui/PageTransition';
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';
import { Bot, Send, User, Sparkles, BookOpen, BarChart3, ClipboardList, FileText, Lightbulb, RotateCcw } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickActions = [
  { label: 'Generate Lesson Plan', icon: BookOpen, prompt: 'Generate a lesson plan for Su-30MKI engine systems training' },
  { label: 'Create Assessment', icon: ClipboardList, prompt: 'Create an assessment for hydraulic systems fundamentals' },
  { label: 'Analyze Performance', icon: BarChart3, prompt: 'Analyze trainee performance trends for the current cohort' },
  { label: 'Debrief Summary', icon: FileText, prompt: 'Generate a debrief summary for today\'s simulation session' },
];

const mockResponses: Record<string, string> = {
  'lesson': '## Lesson Plan: Su-30MKI Engine Systems\n\n**Duration:** 2 hours\n**Target:** Type-rating trainees\n\n### Objectives\n1. Understand AL-31FP turbofan architecture\n2. Master startup/shutdown sequences\n3. Interpret engine instrument indications\n\n### Structure\n- **Theory (45 min):** Engine components, operating principles\n- **Interactive (30 min):** Digital twin exploration\n- **Practical (30 min):** Simulated startup procedures\n- **Assessment (15 min):** Quick knowledge check\n\n### Resources\n- FCOM Vol.1, Ch.3 - Engine Systems\n- Digital Twin: AL-31FP Model\n- Simulation: Engine Start Procedures',
  'assessment': '## Assessment: Hydraulic Systems Fundamentals\n\n**Type:** Written + Practical\n**Total Marks:** 100\n\n### Section A - Theory (40 marks)\n1. Describe the dual hydraulic system architecture (10)\n2. List normal operating pressures and limits (10)\n3. Explain emergency extension procedures (10)\n4. Identify hydraulic system components from diagram (10)\n\n### Section B - Practical (60 marks)\n1. Pre-flight hydraulic check (20)\n2. System isolation drill (20)\n3. Emergency gear extension (20)\n\n### Pass Criteria\n- Minimum 70% overall\n- Minimum 60% in practical section',
  'performance': '## Cohort Performance Analysis\n\n### Current Cohort: Batch 2024-A (8 trainees)\n\n**Overall Readiness:** 72% (Target: 80%)\n\n### Key Findings\n- **Top Performer:** Flt. Lt. Neha Gupta (88% readiness)\n- **Needs Attention:** Fg. Off. Rahul Kumar (52% readiness)\n- **Strongest Area:** Hydraulic Systems (avg 85%)\n- **Weakest Area:** Weapons Integration (avg 45%)\n\n### Recommendations\n1. Schedule remedial sessions for weapons systems\n2. Pair Rahul with Neha for peer mentoring\n3. Increase simulation hours for emergency procedures\n4. Consider extending training timeline by 1 week',
  'debrief': '## Debrief Summary - Simulation Session\n\n**Date:** Today | **Type:** Engine Fire Emergency\n**Participants:** 3 trainees\n\n### Performance Scores\n- Arjun Singh: 87% (Proficient)\n- Rahul Kumar: 62% (Developing)\n- Neha Gupta: 94% (Expert)\n\n### Observations\n- Arjun: Good throttle management, slight delay in fire suppression\n- Rahul: Hesitated on engine identification, needs more practice\n- Neha: Textbook execution, excellent CRM communication\n\n### Action Items\n- Rahul: Repeat engine fire drill (solo) before next group session\n- All: Review QRH Section 4.2 - Fire Emergency Procedures',
};

export default function InstructorAIChatPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Welcome, Instructor. I\'m your AI Training Assistant. I can help you generate lesson plans, create assessments, analyze trainee performance, and prepare debrief summaries. How can I assist you today?', timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const generateResponse = (query: string): string => {
    const lower = query.toLowerCase();
    if (lower.includes('lesson') || lower.includes('plan')) return mockResponses['lesson'];
    if (lower.includes('assessment') || lower.includes('quiz') || lower.includes('test')) return mockResponses['assessment'];
    if (lower.includes('performance') || lower.includes('analyze') || lower.includes('trend')) return mockResponses['performance'];
    if (lower.includes('debrief') || lower.includes('summary') || lower.includes('session')) return mockResponses['debrief'];
    return 'I can help you with:\n\n1. **Lesson Plan Generation** - Create structured training plans\n2. **Assessment Creation** - Design quizzes and practical evaluations\n3. **Performance Analysis** - Review trainee progress and trends\n4. **Debrief Summaries** - Prepare post-session reports\n\nPlease try one of the quick actions or ask me about any of these topics.';
  };

  const handleSend = async (text?: string) => {
    const content = text || input.trim();
    if (!content) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await backendSendMessage(content);
      const aiMsg: Message = { id: `a-${Date.now()}`, role: 'assistant', content: result.assistantMessage.content, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      // Offline fallback — mock responses keep the demo working without backend
      const response = generateResponse(content);
      const aiMsg: Message = { id: `a-${Date.now()}`, role: 'assistant', content: response, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([{ id: '1', role: 'assistant', content: 'Welcome, Instructor. I\'m your AI Training Assistant. How can I assist you today?', timestamp: new Date() }]);
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <PageTransition>
      <div className="p-6 space-y-6 flex flex-col h-[calc(100vh-4rem)]">
        <PageHeader 
          title="AI Instructor Assistant" 
          subtitle="Instructor-grade AI tools for lesson planning, assessment, and squadron analysis" 
          icon={Bot} 
          actions={
            <Button variant="outline" size="sm" onClick={clearChat} className="border-slate-200 text-slate-500 hover:bg-slate-50">
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear
            </Button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
          {/* Chat Area */}
          <div className="lg:col-span-3 flex flex-col min-h-0">
            <Card className="bg-white border-slate-200 shadow-md flex-1 flex flex-col min-h-0 rounded-2xl overflow-hidden">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 pb-2">
                  {messages.map((msg) => (
                    <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}>
                      <div className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border', 
                        msg.role === 'assistant' ? 'bg-af-orange/10 border-af-orange/20' : 'bg-af-blue/10 border-af-blue/20'
                      )}>
                        {msg.role === 'assistant' ? <Bot className="w-5 h-5 text-af-orange" /> : <User className="w-5 h-5 text-af-blue" />}
                      </div>
                      <div className={cn(
                        'max-w-[80%] rounded-2xl px-5 py-3 shadow-sm border', 
                        msg.role === 'assistant' ? 'bg-slate-50 border-slate-100 text-slate-800' : 'bg-af-blue text-white border-af-blue/20'
                      )}>
                        <div className={cn('text-sm whitespace-pre-wrap leading-relaxed font-medium', msg.role === 'assistant' ? 'text-slate-700' : 'text-white')}>
                          {msg.content}
                        </div>
                        <div className={cn('text-[10px] mt-2 opacity-40 font-bold', msg.role === 'user' ? 'text-right' : 'text-left')}>
                          {msg.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="w-9 h-9 rounded-xl bg-af-orange/10 border border-af-orange/20 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-af-orange" />
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 flex items-center gap-1.5 shadow-sm">
                        <div className="w-1.5 h-1.5 bg-af-orange/40 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-af-orange/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1.5 h-1.5 bg-af-orange/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Quick Actions */}
              <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex gap-2 flex-wrap shrink-0">
                {quickActions.map((action) => (
                  <button 
                    key={action.label} 
                    onClick={() => handleSend(action.prompt)} 
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:border-af-orange/40 hover:text-af-orange transition-all shadow-sm active:scale-95"
                  >
                    <action.icon className="w-3.5 h-3.5" />
                    {action.label}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-100 shrink-0 bg-white shadow-inner">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-3">
                  <Input 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder="Describe a lesson, assessment or cohort analysis query..." 
                    className="flex-1 bg-slate-50 border-slate-200 focus:bg-white rounded-xl h-12" 
                  />
                  <Button 
                    type="submit" 
                    className="bg-af-blue hover:bg-af-navy text-white rounded-xl px-6 shadow-lg shadow-af-blue/20" 
                    disabled={!input.trim() || isTyping}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </div>

          {/* Capabilities Sidebar */}
          <div className="space-y-4 shrink-0 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="pb-3 bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-[10px] font-black text-af-navy uppercase tracking-[0.2em] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-af-orange" />
                  AI Protocol
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {[
                  { icon: BookOpen, label: 'Curriculum Gen', desc: 'Structured plans with objectives' },
                  { icon: BarChart3, label: 'Performance Analytics', desc: 'Squadron progress and trends' },
                  { icon: ClipboardList, label: 'Technical Assessment', desc: 'Recommended quizzes and drills' },
                  { icon: FileText, label: 'Debrief Automation', desc: 'Intelligent post-session summaries' },
                ].map((cap) => (
                  <div key={cap.label} className="flex items-start gap-3 group">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-af-orange/10 group-hover:border-af-orange/20 transition-all">
                      <cap.icon className="w-4.5 h-4.5 text-slate-400 group-hover:text-af-orange" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-900 group-hover:text-af-orange transition-colors">{cap.label}</p>
                      <p className="text-[10px] text-slate-500 font-medium leading-tight">{cap.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-af-orange/5 border-af-orange/20 shadow-sm shadow-af-orange/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-af-orange/20 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-4 h-4 text-af-orange" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-af-orange uppercase tracking-widest">Efficiency Tip</p>
                    <p className="text-[10px] text-slate-600 font-medium mt-1 leading-relaxed italic">"Analyze training trends for Batch 2024-A" provides deep insights into cohort bottlenecks.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
