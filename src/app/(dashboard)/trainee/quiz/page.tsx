'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Brain, BookOpen, Clock, Trophy, CheckCircle, XCircle,
  AlertCircle, Play, Sparkles, Target, Zap, History, Timer,
  ChevronRight, ChevronDown
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import { quizzes as mockQuizzes } from '@/data/mockData';

interface Quiz {
  id: string;
  title: string;
  description: string;
  aircraft: string;
  system: string;
  courseId?: string;
  timeLimit: number;
  passingScore: number;
  questionCount: number;
  createdBy: string;
  generatedBy: string;
  createdAt: string;
  attempts?: number;
  bestScore?: number;
  lastAttempt?: string;
}

interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'matching';
  question: string;
  options?: string[];
  points: number;
  difficulty: string;
  topic: string;
}

interface QuizResult {
  attemptId: string;
  score: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
  results: {
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    explanation: string;
    correctAnswer: string;
  }[];
  timeTaken: number;
}

const difficultyColors:Record<string,string>={
  easy:'bg-green-50 border border-green-200 text-green-700',
  medium:'bg-yellow-50 border border-yellow-200 text-yellow-700',
  hard:'bg-red-50 border border-red-200 text-red-700',
};

const aircraftLabels: Record<string, string> = {
  'su-30mki': 'Su-30MKI',
  'mig-29': 'MiG-29',
  'tejas': 'Tejas',
  'mi-17': 'Mi-17',
  'general': 'General',
};

export default function QuizPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('browse');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [takingQuiz, setTakingQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<QuizResult | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [generateParams, setGenerateParams] = useState({
    topic: '',
    aircraft: 'su-30mki',
    system: 'engine',
    questionCount: 5,
  });
  const [generating, setGenerating] = useState(false);
  const [attemptHistory, setAttemptHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchQuizzes();
    fetchAttemptHistory();

    const quizId = searchParams.get('quiz');
    if (quizId) {
      loadQuiz(quizId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (takingQuiz && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (takingQuiz && timeLeft === 0 && quizQuestions.length > 0) {
      submitQuiz();
    }
  }, [takingQuiz, timeLeft]);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any>('/quizzes');
      const list = data?.quizzes || [];
      setQuizzes(list.length > 0 ? list : mockQuizzes as any[]);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
      setQuizzes(mockQuizzes as any[]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttemptHistory = async () => {
    try {
      const data = await apiFetch<any>('/quizzes/attempts/history');
      setAttemptHistory(data?.attempts || []);
    } catch (error) {
      console.error('Failed to fetch attempt history:', error);
    }
  };

  const loadQuiz = async (quizId: string) => {
    try {
      const data = await apiFetch<any>(`/quizzes/${quizId}`);
      if (data) {
        setQuizQuestions(data.questions || []);
        setSelectedQuiz(data);
        setActiveTab('take');
      }
    } catch (error) {
      console.error('Failed to load quiz:', error);
    }
  };

  const getMockQuestions = (quiz: Quiz): Question[] => [
    {
      id: `${quiz.id}_q1`,
      type: 'multiple-choice',
      question: `What is the primary function of the ${quiz.system.replace('-', ' ')} system on the ${(aircraftLabels[quiz.aircraft] || quiz.aircraft)}?`,
      options: ['Provide structural support', 'Manage power distribution and system operation', 'Control fuel flow only', 'Handle navigation data'],
      points: 10,
      difficulty: 'medium',
      topic: quiz.system,
    },
    {
      id: `${quiz.id}_q2`,
      type: 'true-false',
      question: `Emergency procedures for ${quiz.system.replace('-', ' ')} failures must be completed within 30 seconds of detection.`,
      points: 10,
      difficulty: 'easy',
      topic: quiz.system,
    },
    {
      id: `${quiz.id}_q3`,
      type: 'multiple-choice',
      question: 'Which instrument provides the primary indication of system health during cruise phase?',
      options: ['Master Caution Panel', 'Multi-Function Display (MFD)', 'Heads-Up Display (HUD)', 'Engine Instrument Display'],
      points: 10,
      difficulty: 'medium',
      topic: quiz.system,
    },
    {
      id: `${quiz.id}_q4`,
      type: 'multiple-choice',
      question: 'In the event of a total system failure, the first corrective action is:',
      options: ['Eject immediately', 'Declare emergency and follow checklist', 'Increase throttle', 'Cycle the master switch'],
      points: 10,
      difficulty: 'hard',
      topic: quiz.system,
    },
    {
      id: `${quiz.id}_q5`,
      type: 'true-false',
      question: 'Pre-flight checks for all aircraft systems must be logged in the Technical Log before departure.',
      points: 10,
      difficulty: 'easy',
      topic: 'general',
    },
  ];

  const startQuiz = async (quiz: Quiz) => {
    try {
      const data = await apiFetch<any>(`/quizzes/${quiz.id}`);
      setQuizQuestions(data.questions);
      setSelectedQuiz(quiz);
      setAnswers({});
      setCurrentQuestion(0);
      setTimeLeft((data.timeLimit || 15) * 60);
      setTakingQuiz(true);
      setShowResults(false);
      setResults(null);
      setActiveTab('take');
    } catch (error) {
      const questions = getMockQuestions(quiz);
      setQuizQuestions(questions);
      setSelectedQuiz(quiz);
      setAnswers({});
      setCurrentQuestion(0);
      setTimeLeft((quiz.timeLimit || 15) * 60);
      setTakingQuiz(true);
      setShowResults(false);
      setResults(null);
      setActiveTab('take');
    }
  };

  const submitQuiz = async () => {
    if (!selectedQuiz) return;

    setTakingQuiz(false);

    try {
      const data = await apiFetch<any>(`/quizzes/${selectedQuiz.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          answers,
          timeTaken: (selectedQuiz.timeLimit || 15) * 60 - timeLeft,
        }),
      });
      setResults(data);
      setShowResults(true);
      fetchAttemptHistory();
    } catch (error) {
      const correctAnswers: Record<string, string> = {
        [`${selectedQuiz.id}_q1`]: 'Manage power distribution and system operation',
        [`${selectedQuiz.id}_q2`]: 'False',
        [`${selectedQuiz.id}_q3`]: 'Multi-Function Display (MFD)',
        [`${selectedQuiz.id}_q4`]: 'Declare emergency and follow checklist',
        [`${selectedQuiz.id}_q5`]: 'True',
      };
      const resultDetails = quizQuestions.map(q => {
        const userAnswer = answers[q.id] || '';
        const correct = correctAnswers[q.id] || '';
        const isCorrect = userAnswer.toLowerCase() === correct.toLowerCase();
        return {
          questionId: q.id,
          userAnswer,
          isCorrect,
          explanation: `The correct procedure per IAF training standards is: ${correct}.`,
          correctAnswer: correct,
        };
      });
      const score = resultDetails.filter(r => r.isCorrect).length;
      const percentage = Math.round((score / quizQuestions.length) * 100);
      setResults({
        attemptId: `mock_${Date.now()}`,
        score,
        percentage,
        passed: percentage >= (selectedQuiz.passingScore || 75),
        passingScore: selectedQuiz.passingScore || 75,
        results: resultDetails,
        timeTaken: (selectedQuiz.timeLimit || 15) * 60 - timeLeft,
      });
      setShowResults(true);
    }
  };

  const generateQuiz = async () => {
    setGenerating(true);
    try {
      const data = await apiFetch<any>('/quizzes/generate', {
        method: 'POST',
        body: JSON.stringify(generateParams),
      });
      setSelectedQuiz(data);
      setQuizQuestions(data.questions);
      setAnswers({});
      setCurrentQuestion(0);
      setTimeLeft((data.timeLimit || 15) * 60);
      setTakingQuiz(true);
      setShowResults(false);
      setResults(null);
      setShowGenerator(false);
      setActiveTab('take');
    } catch (error) {
      console.error('Failed to generate quiz:', error);
    } finally {
      setGenerating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col p-4 gap-4 overflow-hidden text-slate-900">
      <PageHeader
        title="Assessment Center"
        subtitle="AI-powered quiz generation and assessment tools"
        icon={Brain}
        actions={
          <div className="flex gap-2">
            <Button
              onClick={() => setShowGenerator(true)}
              className="bg-af-orange hover:bg-af-orange/90 text-white font-bold h-10 shadow-sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Generate Quiz
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="bg-slate-50 border border-slate-200 shrink-0 p-1 rounded-xl">
          <TabsTrigger value="browse" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-af-blue font-semibold">
            <BookOpen className="w-4 h-4 mr-2" />
            Browse Quizzes
          </TabsTrigger>
          <TabsTrigger value="take" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-af-blue font-semibold" disabled={!selectedQuiz}>
            <Play className="w-4 h-4 mr-2" />
            Take Quiz
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-af-blue font-semibold">
            <History className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="flex-1 overflow-hidden mt-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-2 border-af-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : quizzes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <Brain className="w-12 h-12 text-slate-200 mb-3" />
              <p className="text-slate-500 font-medium">No quizzes available</p>
              <p className="text-sm text-slate-400">Generate a new quiz using the AI quiz generator</p>
            </div>
          ) : (
            <ScrollArea className="h-full pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {quizzes.map((quiz) => (
                  <Card
                    key={quiz.id}
                    className="bg-white border border-slate-200/60 hover:border-af-blue/30 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    <CardHeader className="p-4 pb-2 border-b border-slate-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-bold text-slate-900 truncate">{quiz.title}</CardTitle>
                          <CardDescription className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                            {quiz.description}
                          </CardDescription>
                        </div>
                        <Badge className={quiz.generatedBy === 'ai' ? 'bg-af-orange/5 text-af-orange border border-af-orange/20' : 'bg-af-blue/5 text-af-blue border border-af-blue/20'}>
                          {quiz.generatedBy === 'ai' ? 'AI Agent' : 'Manual'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-4">
                      <div className="flex items-center gap-2 flex-wrap mb-4">
                        <Badge variant="secondary" className="bg-slate-50 border border-slate-200/60 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                          {aircraftLabels[quiz.aircraft] || quiz.aircraft}
                        </Badge>
                        <Badge variant="secondary" className="bg-slate-50 border border-slate-200/60 text-slate-600 text-[10px] font-bold uppercase tracking-wider capitalize">
                          {quiz.system.replace('-', ' ')}
                        </Badge>
                        <Badge variant="secondary" className="bg-slate-50 border border-slate-200/60 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                          {quiz.questionCount} Units
                        </Badge>
                      </div>

                      <div className="space-y-2.5 mb-5">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {quiz.timeLimit} min
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5" />
                            Pass: {quiz.passingScore}%
                          </span>
                        </div>
                        {quiz.attempts !== undefined && quiz.attempts > 0 && (
                          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>{quiz.attempts} attempt{quiz.attempts !== 1 ? 's' : ''}</span>
                            {quiz.bestScore && (
                              <span className="flex items-center gap-1.5 font-bold">
                                <Trophy className="w-3.5 h-3.5 text-af-orange" />
                                Best: {quiz.bestScore}%
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() => startQuiz(quiz)}
                        className="w-full bg-af-blue hover:bg-af-midnight text-white font-bold shadow-sm h-10"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Assessment
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="take" className="flex-1 overflow-hidden mt-4">
          {!takingQuiz && !showResults ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Brain className="w-16 h-16 text-slate-200 mb-4" />
              <p className="text-slate-500 text-lg font-bold mb-2">Select a quiz to begin</p>
              <p className="text-slate-400 text-sm mb-6 max-w-sm">Choose from the available quizzes above or generate a new one using AI intelligence</p>
              <Button onClick={() => setActiveTab('browse')} variant="outline" className="border-af-blue text-af-blue hover:bg-af-blue/5 font-bold">
                Browse Registry
              </Button>
            </div>
          ) : takingQuiz ? (
            <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <h3 className="text-slate-900 font-bold tracking-tight">{selectedQuiz?.title}</h3>
                  <div className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 shadow-sm">
                    Question {currentQuestion + 1} of {quizQuestions.length}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm',
                    timeLeft < 60 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-white text-af-blue border border-slate-200'
                  )}>
                    <Timer className="w-4 h-4" />
                    {formatTime(timeLeft)}
                  </div>
                  <Button onClick={submitQuiz} variant="ghost" className="text-slate-400 hover:text-red-500 hover:bg-red-50 font-bold text-xs uppercase tracking-wider">
                    Term Assessment
                  </Button>
                </div>
              </div>

              <Progress
                value={(currentQuestion + 1) / quizQuestions.length * 100}
                className="h-1 rounded-none bg-slate-100 [&>div]:bg-af-blue"
              />

              <div className="flex-1 overflow-hidden flex flex-col p-6">
                <ScrollArea className="flex-1 pr-4">
                  {quizQuestions[currentQuestion] && (
                    <div className="max-w-3xl mx-auto py-4">
                      <div className="flex items-center gap-3 mb-6">
                        <Badge className={cn('capitalize border-0 font-bold', difficultyColors[quizQuestions[currentQuestion].difficulty])}>
                          {quizQuestions[currentQuestion].difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-slate-400 border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                          {quizQuestions[currentQuestion].topic}
                        </Badge>
                        <Badge variant="outline" className="text-af-blue border-af-blue/20 bg-af-blue/5 font-bold uppercase tracking-wider text-[10px]">
                          {quizQuestions[currentQuestion].points} Points
                        </Badge>
                      </div>

                      <h3 className="text-2xl font-bold text-slate-900 mb-8 leading-tight">{quizQuestions[currentQuestion].question}</h3>

                      {quizQuestions[currentQuestion].type === 'multiple-choice' && (
                        <div className="space-y-4">
                          {quizQuestions[currentQuestion].options?.map((option, idx) => (
                            <button
                              key={idx}
                              onClick={() => setAnswers({ ...answers, [quizQuestions[currentQuestion].id]: option })}
                              className={cn(
                                'w-full text-left p-5 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group',
                                answers[quizQuestions[currentQuestion].id] === option
                                  ? 'bg-af-blue/5 border-af-blue shadow-inner'
                                  : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                              )}
                            >
                              <div className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors',
                                answers[quizQuestions[currentQuestion].id] === option
                                  ? 'bg-af-blue text-white'
                                  : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                              )}>
                                {String.fromCharCode(65 + idx)}
                              </div>
                              <span className={cn(
                                'font-medium transition-colors',
                                answers[quizQuestions[currentQuestion].id] === option ? 'text-af-blue' : 'text-slate-700'
                              )}>
                                {option}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {quizQuestions[currentQuestion].type === 'true-false' && (
                        <div className="grid grid-cols-2 gap-6">
                          {['True', 'False'].map((option) => (
                            <button
                              key={option}
                              onClick={() => setAnswers({ ...answers, [quizQuestions[currentQuestion].id]: option })}
                              className={cn(
                                'p-8 rounded-xl border-2 transition-all duration-200 text-center font-bold text-lg',
                                answers[quizQuestions[currentQuestion].id] === option
                                  ? 'bg-af-blue/5 border-af-blue text-af-blue shadow-inner'
                                  : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-600'
                              )}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}

                      {quizQuestions[currentQuestion].type === 'fill-blank' && (
                        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block">Enter response</label>
                          <Input
                            placeholder="Type your answer precisely..."
                            value={answers[quizQuestions[currentQuestion].id] || ''}
                            onChange={(e) => setAnswers({ ...answers, [quizQuestions[currentQuestion].id]: e.target.value })}
                            className="bg-white border-slate-200 text-slate-900 text-xl p-8 h-16 rounded-xl focus:border-af-blue focus:ring-af-blue/10"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>

                <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
                  <Button
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                    variant="outline"
                    className="border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                  >
                    Previous Question
                  </Button>

                  <div className="hidden md:flex gap-1.5">
                    {quizQuestions.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentQuestion(idx)}
                        className={cn(
                          'w-9 h-9 rounded-lg text-xs font-bold transition-all duration-200 border',
                          currentQuestion === idx
                            ? 'bg-af-blue border-af-blue text-white shadow-md transform scale-110 z-10'
                            : answers[quizQuestions[idx].id]
                            ? 'bg-af-blue/10 border-af-blue/20 text-af-blue'
                            : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                        )}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>

                  <Button
                    onClick={() => {
                      if (currentQuestion === quizQuestions.length - 1) {
                        submitQuiz();
                      } else {
                        setCurrentQuestion(currentQuestion + 1);
                      }
                    }}
                    className="bg-af-blue hover:bg-af-midnight text-white font-bold px-8"
                  >
                    {currentQuestion === quizQuestions.length - 1 ? 'Finalize Assessment' : 'Next Question'}
                  </Button>
                </div>
              </div>
            </div>
          ) : showResults && results ? (
            <Card className="bg-white border-slate-200 shadow-xl max-w-4xl mx-auto overflow-hidden">
              <div className={cn(
                'h-2',
                results.passed ? 'bg-af-green' : 'bg-af-orange'
              )} />
              <CardHeader className="text-center pb-8 pt-10">
                <div className={cn(
                  'w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 shadow-lg transform transition-transform duration-500 scale-110',
                  results.passed ? 'bg-af-green/10 text-af-green' : 'bg-af-orange/10 text-af-orange'
                )}>
                  {results.passed ? (
                    <Trophy className="w-12 h-12" />
                  ) : (
                    <AlertCircle className="w-12 h-12" />
                  )}
                </div>
                <CardTitle className="text-3xl font-bold text-slate-900 tracking-tight">
                  {results.passed ? 'Assessment Qualified' : 'Qualification Pending'}
                </CardTitle>
                <CardDescription className="text-slate-500 text-lg mt-2 font-medium">
                  {selectedQuiz?.title}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-10 px-8 pb-10">
                <div className="grid grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                    <p className={cn('text-4xl font-black mb-1', results.passed ? 'text-af-green' : 'text-af-orange')}>{results.percentage}%</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Final Score</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                    <p className="text-4xl font-black text-slate-800 mb-1">{results.passingScore}%</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Target Pass</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                    <p className="text-4xl font-black text-af-blue mb-1">{formatTime(results.timeTaken)}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Time Elapsed</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Intelligence Review</h4>
                  <div className="space-y-3">
                    {results.results.map((result, idx) => {
                      const question = quizQuestions.find(q => q.id === result.questionId);
                      return (
                        <div
                          key={result.questionId}
                          className={cn(
                            'p-4 rounded-xl border-2 transition-all duration-300',
                            result.isCorrect
                              ? 'bg-af-green/5 border-af-green/10'
                              : 'bg-af-orange/5 border-af-orange/10'
                          )}
                        >
                          <div className="flex items-start gap-4">
                            {result.isCorrect ? (
                              <CheckCircle className="w-6 h-6 text-af-green shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-6 h-6 text-af-orange shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-800 leading-relaxed">
                                <span className="text-slate-400 mr-2">Q{idx + 1}.</span> {question?.question}
                              </p>
                              {!result.isCorrect && (
                                <div className="mt-3 p-3 bg-white/50 rounded-lg border border-af-orange/5">
                                  <p className="text-xs text-slate-500 font-medium">
                                    Correct Protocol: <span className="text-af-green font-bold ml-1">{result.correctAnswer}</span>
                                  </p>
                                </div>
                              )}
                              {result.explanation && (
                                <p className="text-xs text-slate-500 mt-3 leading-relaxed bg-white/50 p-3 rounded-lg border border-slate-100 italic">
                                  {result.explanation}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    onClick={() => {
                      setShowResults(false);
                      setTakingQuiz(false);
                      setActiveTab('browse');
                    }}
                    variant="outline"
                    className="flex-1 border-slate-200 text-slate-600 font-bold h-12 rounded-xl"
                  >
                    Return to Assessment Center
                  </Button>
                  <Button
                    onClick={() => selectedQuiz && startQuiz(selectedQuiz)}
                    className="flex-1 bg-af-blue hover:bg-af-midnight text-white font-bold h-12 rounded-xl shadow-lg"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Retry Qualification
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="history" className="flex-1 overflow-hidden mt-4">
          {attemptHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <History className="w-16 h-16 text-slate-200 mb-4" />
              <p className="text-slate-500 font-bold text-lg mb-2">No qualification history found</p>
              <p className="text-slate-400 text-sm">Complete any assessment to generate performance logs</p>
            </div>
          ) : (
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {attemptHistory.map((attempt) => (
                  <Card key={attempt.id} className="bg-white border-slate-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
                    <div className={cn('w-1 h-full absolute left-0', attempt.passed ? 'bg-af-green' : 'bg-af-orange')} />
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-bold text-slate-900 truncate">{attempt.quizTitle}</h4>
                          <div className="flex items-center gap-4 mt-2">
                             <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                               <Clock className="w-3.5 h-3.5" />
                               {new Date(attempt.completedAt).toLocaleString()}
                             </p>
                             <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                               <Timer className="w-3.5 h-3.5" />
                               {formatTime(attempt.timeTaken)} elapsed
                             </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 pr-2">
                          <div className="text-right">
                            <div className={cn('text-3xl font-black', attempt.passed ? 'text-af-green' : 'text-af-orange')}>
                              {attempt.percentage}%
                            </div>
                            <Badge className={cn('border-0 font-bold uppercase tracking-widest text-[10px] mt-1 pr-3', attempt.passed ? 'bg-af-green/10 text-af-green' : 'bg-af-orange/10 text-af-orange')}>
                              {attempt.passed ? 'Qualified' : 'Deficiency'}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="icon" className="text-slate-300 hover:text-af-blue hover:bg-af-blue/5 rounded-full">
                             <ChevronRight className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>

      {showGenerator && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="h-2 bg-gradient-to-r from-af-orange to-af-blue" />
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-af-orange/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-af-orange" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">AI Assessment Intel</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">Configure parameters for custom evaluation</CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowGenerator(false)}
                  className="text-slate-300 hover:text-slate-600 hover:bg-slate-100 h-10 w-10 p-0 rounded-full transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1">Mission Topic</label>
                <Input
                  placeholder="e.g., Engine fire protocols, emergency landing..."
                  value={generateParams.topic}
                  onChange={(e) => setGenerateParams({ ...generateParams, topic: e.target.value })}
                  className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl h-12 focus:border-af-orange focus:ring-af-orange/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1">Target Aircraft</label>
                  <div className="relative">
                    <select
                      value={generateParams.aircraft}
                      onChange={(e) => setGenerateParams({ ...generateParams, aircraft: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-af-orange/20 transition-all"
                    >
                      <option value="su-30mki">Su-30MKI Flanker</option>
                      <option value="mig-29">MiG-29 Fulcrum</option>
                      <option value="tejas">HAL Tejas</option>
                      <option value="mi-17">Mi-17 V5</option>
                      <option value="general">Operational General</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1">Sub-System</label>
                  <div className="relative">
                    <select
                      value={generateParams.system}
                      onChange={(e) => setGenerateParams({ ...generateParams, system: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-af-orange/20 transition-all border-slate-200"
                    >
                      <option value="engine">Propulsion Systems</option>
                      <option value="hydraulics">Hydraulic Systems</option>
                      <option value="electrical">Electrical Grid</option>
                      <option value="avionics">Avionics Suite</option>
                      <option value="fuel">Fuel Management</option>
                      <option value="flight-control">Flight Controls</option>
                      <option value="weapons">Armament Systems</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Question Density</label>
                   <span className="text-sm font-bold text-af-orange bg-af-orange/10 px-3 py-0.5 rounded-full">{generateParams.questionCount} Units</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={generateParams.questionCount}
                  onChange={(e) => setGenerateParams({ ...generateParams, questionCount: parseInt(e.target.value) })}
                  className="w-full accent-af-orange h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() => setShowGenerator(false)}
                  variant="ghost"
                  className="flex-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 font-bold h-12 rounded-xl border border-transparent hover:border-slate-100"
                >
                  Discard
                </Button>
                <Button
                  onClick={generateQuiz}
                  disabled={generating || !generateParams.topic}
                  className="flex-1 bg-af-orange hover:bg-af-orange/90 text-white font-bold h-12 rounded-xl shadow-lg transition-all transform hover:scale-[1.02]"
                >
                  {generating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                      Synthesizing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Deploy Agent
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
