'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search, BookOpen, Brain, Sparkles, ChevronRight, Clock,
  ArrowLeft, ExternalLink, Cpu, Zap, Fuel, Settings, Plane
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface KnowledgeEntry {
  id: string;
  title: string;
  summary: string;
  category: string;
  aircraft: string;
  system: string;
  difficulty: string;
  tags: string[];
  lastUpdated: string;
  matchedIn?: string;
}

interface SearchResult {
  entry: KnowledgeEntry;
  score: number;
  contextMatches: string[];
}

const systemIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  engine: Cpu,
  hydraulics: Settings,
  electrical: Zap,
  avionics: Cpu,
  'flight-control': Settings,
  weapons: Cpu,
  fuel: Fuel,
  'landing-gear': Settings,
  general: Plane,
};

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-500/20 text-green-400',
  intermediate: 'bg-yellow-500/20 text-yellow-400',
  advanced: 'bg-red-500/20 text-red-400',
};

const categoryColors: Record<string, string> = {
  'Technical Reference': 'bg-af-blue/10 text-af-blue',
  'Procedures': 'bg-af-blue/10 text-af-blue',
  'Emergency Procedures': 'bg-red-500/20 text-red-400',
  'Checklists': 'bg-blue-500/20 text-blue-400',
  'Training': 'bg-purple-500/20 text-purple-400',
};

const aircraftLabels: Record<string, string> = {
  'su-30mki': 'Su-30MKI',
  'mig-29': 'MiG-29',
  'tejas': 'Tejas',
  'general': 'General',
};

const quickSearches = [
  { label: 'Engine Start Procedure', query: 'engine start procedure' },
  { label: 'Hydraulic System', query: 'hydraulic system' },
  { label: 'Radar Operation', query: 'radar N011M' },
  { label: 'Emergency Procedures', query: 'emergency fire' },
  { label: 'Pre-flight Inspection', query: 'pre-flight inspection' },
  { label: 'Electrical System', query: 'electrical generator' },
];

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [allEntries, setAllEntries] = useState<KnowledgeEntry[]>([]);
  const [, setCategories] = useState<string[]>([]);
  const [systems, setSystems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [entryContent, setEntryContent] = useState<string>('');
  const [filterSystem, setFilterSystem] = useState<string | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateParams, setGenerateParams] = useState({
    topic: '',
    aircraft: 'su-30mki',
    system: 'engine',
  });

  useEffect(() => {
    fetchAllEntries();
  }, []);

  const fetchAllEntries = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any>('/knowledge');
      setAllEntries(data.entries);
      setCategories(data.categories);
      setSystems(data.systems);
    } catch (error) {
      console.error('Failed to fetch knowledge entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setSearchQuery(query);

    try {
      const data = await apiFetch<any>('/knowledge/search', { method: 'POST', body: JSON.stringify({ query }) });
      setSearchResults(data.results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewEntry = async (entry: KnowledgeEntry) => {
    try {
      const data = await apiFetch<any>(`/knowledge/${entry.id}`);
      setSelectedEntry(data);
      setEntryContent(data.content);
      setActiveTab('view');
    } catch (error) {
      console.error('Failed to load entry:', error);
    }
  };

  const generateArticle = async () => {
    if (!generateParams.topic.trim()) return;

    setGenerating(true);
    try {
      const data = await apiFetch<any>('/knowledge/generate', {
        method: 'POST',
        body: JSON.stringify(generateParams),
      });
      setSelectedEntry(data);
      setEntryContent(data.content);
      setShowGenerator(false);
      setActiveTab('view');
      fetchAllEntries();
    } catch (error) {
      console.error('Failed to generate article:', error);
    } finally {
      setGenerating(false);
    }
  };

  const filteredEntries = allEntries.filter(entry => {
    if (filterSystem && entry.system !== filterSystem) return false;
    if (filterDifficulty && entry.difficulty !== filterDifficulty) return false;
    return true;
  });

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      const numbered = line.match(/^(\d+)\.\s+(.*)/);
      const bullet = line.match(/^[-•]\s+(.*)/);
      const heading = line.match(/^#+\s+(.*)/);

      if (heading) {
        const level = heading[0].match(/^#+/)![0].length;
        const content = heading[1];
        return (
          <p key={i} className={`text-slate-900 font-semibold ${level === 1 ? 'text-lg mt-4 mb-2' : 'text-base mt-3 mb-1'}`}>
            {content}
          </p>
        );
      }

      if (numbered) {
        return (
          <div key={i} className="flex gap-2 mb-1 ml-4">
            <span className="text-af-blue font-medium shrink-0">{numbered[1]}.</span>
            <span className="text-slate-800">{renderBoldText(numbered[2])}</span>
          </div>
        );
      }

      if (bullet) {
        return (
          <div key={i} className="flex gap-2 mb-1 ml-4">
            <span className="text-af-blue shrink-0">•</span>
            <span className="text-slate-800">{renderBoldText(bullet[1])}</span>
          </div>
        );
      }

      if (line.trim() === '') return <div key={i} className="h-2" />;
      return <p key={i} className="text-slate-800 mb-1">{renderBoldText(line)}</p>;
    });
  };

  const renderBoldText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i} className="text-slate-900 font-bold">{part}</strong> : part
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col p-4 gap-4">
      <PageHeader
        title="Knowledge Base"
        subtitle="AI-powered knowledge generation and exploration"
        icon={Brain}
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowGenerator(true)}
              className="bg-af-blue hover:bg-af-blue-light text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Article
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="bg-white border border-slate-200 shrink-0">
          <TabsTrigger value="search" className="data-[state=active]:bg-af-blue/10">
            <Search className="w-4 h-4 mr-2" />
            Search
          </TabsTrigger>
          <TabsTrigger value="browse" className="data-[state=active]:bg-af-blue/10">
            <BookOpen className="w-4 h-4 mr-2" />
            Browse All
          </TabsTrigger>
          <TabsTrigger value="view" className="data-[state=active]:bg-af-blue/10" disabled={!selectedEntry}>
            <BookOpen className="w-4 h-4 mr-2" />
            View Article
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="flex-1 flex flex-col gap-4 mt-4">
          <Card className="bg-white border-slate-200 shrink-0">
            <CardContent className="p-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input
                    placeholder="Search knowledge base... (e.g., 'engine start procedure', 'hydraulic troubleshooting')"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && performSearch(searchQuery)}
                    className="pl-10 h-12 bg-slate-100 border-slate-200 text-slate-900 text-lg"
                  />
                </div>
                <Button
                  onClick={() => performSearch(searchQuery)}
                  disabled={!searchQuery.trim() || loading}
                  className="bg-af-blue hover:bg-af-blue-light text-white h-12 px-6"
                >
                  <Search className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {!hasSearched ? (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="mb-4">
                <h3 className="text-sm text-slate-600 mb-3">Quick Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {quickSearches.map((qs) => (
                    <Button
                      key={qs.query}
                      variant="outline"
                      onClick={() => performSearch(qs.query)}
                      className="border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    >
                      {qs.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                <h3 className="text-sm text-slate-600 mb-3">Popular Articles</h3>
                <ScrollArea className="h-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {allEntries.slice(0, 6).map((entry) => (
                      <Card
                        key={entry.id}
                        className="bg-white border-slate-200 hover:border-af-blue/50 cursor-pointer transition-colors"
                        onClick={() => viewEntry(entry)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-af-blue/10">
                              <BookOpen className="w-5 h-5 text-af-blue" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm text-slate-900 font-medium truncate">{entry.title}</h4>
                              <p className="text-xs text-slate-500 line-clamp-2 mt-1">{entry.summary}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={categoryColors[entry.category] || 'bg-slate-100 text-slate-900'} variant="secondary">
                                  {entry.category}
                                </Badge>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-8 h-8 border-2 border-af-blue border-t-transparent rounded-full animate-spin" />
                </div>
              ) : searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <Search className="w-12 h-12 text-slate-400 mb-3" />
                  <p className="text-slate-600">No results found</p>
                  <p className="text-sm text-slate-500">Try different keywords or browse all entries</p>
                  <Button onClick={() => { setHasSearched(false); setSearchQuery(''); }} className="mt-4 bg-af-blue hover:bg-af-blue-light text-white">
                    Browse All
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found</p>
                  {searchResults.map((result) => (
                    <Card
                      key={result.entry.id}
                      className="bg-white border-slate-200 hover:border-af-blue/50 cursor-pointer transition-colors"
                      onClick={() => viewEntry(result.entry)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-slate-900 font-medium">{result.entry.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={categoryColors[result.entry.category] || 'bg-slate-100 text-slate-900'} variant="secondary">
                                {result.entry.category}
                              </Badge>
                              <Badge className={difficultyColors[result.entry.difficulty]} variant="secondary">
                                {result.entry.difficulty}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                              Score: {result.score}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-2">{result.entry.summary}</p>
                        {result.contextMatches.length > 0 && (
                          <div className="p-2 rounded bg-slate-50">
                            <p className="text-xs text-slate-600 italic">
                              {result.contextMatches[0]}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="browse" className="flex-1 flex gap-4 mt-4">
          <Card className="w-64 shrink-0 bg-white border-slate-200 overflow-y-auto">
            <CardHeader className="p-4">
              <h3 className="text-sm font-medium text-slate-900">Filters</h3>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div>
                <label className="text-xs text-slate-600 mb-2 block">System</label>
                <div className="space-y-1">
                  <button
                    onClick={() => setFilterSystem(null)}
                    className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                      !filterSystem ? 'bg-af-blue/10 text-af-blue' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    All Systems
                  </button>
                  {systems.map((sys) => (
                    <button
                      key={sys}
                      onClick={() => setFilterSystem(filterSystem === sys ? null : sys)}
                      className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors capitalize ${
                        filterSystem === sys ? 'bg-af-blue/10 text-af-blue' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {sys.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-600 mb-2 block">Difficulty</label>
                <div className="space-y-1">
                  <button
                    onClick={() => setFilterDifficulty(null)}
                    className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                      !filterDifficulty ? 'bg-af-blue/10 text-af-blue' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    All Levels
                  </button>
                  {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setFilterDifficulty(filterDifficulty === level ? null : level)}
                      className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors capitalize ${
                        filterDifficulty === level ? `bg-af-blue/10 text-af-blue` : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 bg-white border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <p className="text-sm text-slate-600">{filteredEntries.length} article{filteredEntries.length !== 1 ? 's' : ''}</p>
            </div>
            <ScrollArea className="h-[calc(100%-3rem)]">
              <div className="p-4 space-y-3">
                {filteredEntries.map((entry) => {
                  const Icon = systemIcons[entry.system] || Plane;
                  return (
                    <Card
                      key={entry.id}
                      className="bg-slate-50 border-slate-100 hover:border-af-blue/50 cursor-pointer transition-colors"
                      onClick={() => viewEntry(entry)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            entry.system === 'engine' ? 'bg-af-blue/10' :
                            entry.system === 'hydraulics' ? 'bg-iaf-cyan/10' :
                            entry.system === 'avionics' ? 'bg-purple-500/10' :
                            'bg-slate-50'
                          }`}>
                            <Icon className={`w-5 h-5 ${
                              entry.system === 'engine' ? 'text-af-blue' :
                              entry.system === 'hydraulics' ? 'text-af-blue' :
                              entry.system === 'avionics' ? 'text-purple-400' :
                              'text-slate-900'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm text-slate-900 font-medium truncate">{entry.title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-1">{entry.summary}</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Badge className={categoryColors[entry.category] || 'bg-slate-100 text-slate-900'} variant="secondary">
                                {entry.category}
                              </Badge>
                              <Badge className={difficultyColors[entry.difficulty]} variant="secondary">
                                {entry.difficulty}
                              </Badge>
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {entry.lastUpdated}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="view" className="flex-1 mt-4 overflow-hidden">
          {selectedEntry && (
            <Card className="h-full bg-white border-slate-200 overflow-hidden flex flex-col">
              <CardHeader className="p-4 border-b border-slate-200 shrink-0">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => { setActiveTab('browse'); setSelectedEntry(null); }}
                    className="text-slate-600 hover:text-slate-900"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-200 text-slate-900"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in Full View
                  </Button>
                </div>
                <div className="mt-4">
                  <h2 className="text-xl text-slate-900 font-semibold">{selectedEntry.title}</h2>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge className={categoryColors[selectedEntry.category] || 'bg-slate-100 text-slate-900'} variant="secondary">
                      {selectedEntry.category}
                    </Badge>
                    <Badge className={difficultyColors[selectedEntry.difficulty]} variant="secondary">
                      {selectedEntry.difficulty}
                    </Badge>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 capitalize">
                      {aircraftLabels[selectedEntry.aircraft] || selectedEntry.aircraft}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span>Author: {selectedEntry.author}</span>
                    <span>Source: {selectedEntry.source}</span>
                    <span>Updated: {selectedEntry.lastUpdated}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedEntry.tags?.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="bg-slate-50 text-slate-500 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex-1 overflow-y-auto">
                <div className="prose  max-w-none">
                  {renderMarkdown(entryContent)}
                </div>

                {selectedEntry.related?.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <h3 className="text-sm font-medium text-slate-900 mb-3">Related Articles</h3>
                    <div className="space-y-2">
                      {selectedEntry.related.map((rel: any) => (
                        <button
                          key={rel.id}
                          onClick={() => viewEntry({ ...rel, system: rel.system })}
                          className="w-full text-left p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-af-blue/50 transition-colors"
                        >
                          <p className="text-sm text-slate-900">{rel.title}</p>
                          <p className="text-xs text-slate-500 capitalize">{rel.system?.replace('-', ' ')}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {showGenerator && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-white border-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-af-blue" />
                  <CardTitle className="text-slate-900">AI Article Generator</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowGenerator(false)}
                  className="text-slate-600 hover:text-slate-900"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-slate-600 mb-2 block">Topic</label>
                <Input
                  placeholder="e.g., Engine start procedures, Radar operation..."
                  value={generateParams.topic}
                  onChange={(e) => setGenerateParams({ ...generateParams, topic: e.target.value })}
                  className="bg-slate-100 border-slate-200 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-600 mb-2 block">Aircraft</label>
                  <select
                    value={generateParams.aircraft}
                    onChange={(e) => setGenerateParams({ ...generateParams, aircraft: e.target.value })}
                    className="w-full h-10 px-3 rounded border bg-slate-100 border-slate-200 text-slate-900"
                  >
                    <option value="su-30mki">Su-30MKI</option>
                    <option value="mig-29">MiG-29</option>
                    <option value="tejas">Tejas</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-600 mb-2 block">System</label>
                  <select
                    value={generateParams.system}
                    onChange={(e) => setGenerateParams({ ...generateParams, system: e.target.value })}
                    className="w-full h-10 px-3 rounded border bg-slate-100 border-slate-200 text-slate-900"
                  >
                    <option value="engine">Engine</option>
                    <option value="hydraulics">Hydraulics</option>
                    <option value="electrical">Electrical</option>
                    <option value="avionics">Avionics</option>
                    <option value="flight-control">Flight Control</option>
                    <option value="weapons">Weapons</option>
                    <option value="fuel">Fuel</option>
                    <option value="landing-gear">Landing Gear</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowGenerator(false)}
                  variant="outline"
                  className="flex-1 border-slate-200 text-slate-900"
                >
                  Cancel
                </Button>
                <Button
                  onClick={generateArticle}
                  disabled={generating || !generateParams.topic.trim()}
                  className="flex-1 bg-af-blue hover:bg-af-blue-light text-white"
                >
                  {generating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-50 border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate
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
