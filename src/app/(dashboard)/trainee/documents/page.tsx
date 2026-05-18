'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search, FileText, Download, Eye, Calendar, User, Shield, Wrench, Filter } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface Document {
  id: string;
  title: string;
  description: string;
  category: string;
  aircraft: string;
  system: string;
  fileType: string;
  fileSize: number;
  tags: string[];
  uploadedBy: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  manual: BookOpen,
  procedure: FileText,
  diagram: Eye,
  'technical-order': Shield,
  checklist: FileText,
  bulletin: Wrench,
};

const categoryColors: Record<string, string> = {
  manual: 'bg-af-blue/10 text-af-blue',
  procedure: 'bg-af-blue/10 text-af-blue',
  diagram: 'bg-green-500/20 text-green-400',
  'technical-order': 'bg-purple-500/20 text-purple-400',
  checklist: 'bg-blue-500/20 text-blue-400',
  bulletin: 'bg-orange-500/20 text-orange-400',
};

const aircraftLabels: Record<string, string> = {
  'su-30mki': 'Su-30MKI',
  'mig-29': 'MiG-29',
  'tejas': 'Tejas',
  'mi-17': 'Mi-17',
  'chinook': 'Chinook',
  'lh-575': 'LH-575',
  'general': 'General',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [aircraft, setAircraft] = useState<string[]>([]);
  const [systems, setSystems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAircraft, setSelectedAircraft] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedAircraft) params.append('aircraft', selectedAircraft);
      if (selectedSystem) params.append('system', selectedSystem);

      const data = await apiFetch<any>(`/documents?${params.toString()}`);
      setDocuments(data.documents);
      setCategories(data.categories);
      setAircraft(data.aircraft);
      setSystems(data.systems);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewDocument = async (doc: Document) => {
    try {
      await apiFetch<any>(`/documents/${doc.id}`);
      setSelectedDoc(doc);
    } catch (error) {
      setSelectedDoc(doc);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchDocuments();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [search, selectedCategory, selectedAircraft, selectedSystem]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory(null);
    setSelectedAircraft(null);
    setSelectedSystem(null);
  };

  const hasFilters = search || selectedCategory || selectedAircraft || selectedSystem;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col p-4 gap-4">
      <PageHeader
        title="Document Library"
        subtitle="Access technical manuals, procedures, diagrams, and training documentation"
        icon={BookOpen}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="border-slate-200 text-slate-900"
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </Button>
          </div>
        }
      />

      <div className="flex flex-1 gap-4 min-h-0 overflow-hidden">
        <Card className="w-64 shrink-0 bg-white border-slate-200 overflow-y-auto">
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-900">Filters</h3>
              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-slate-600 hover:text-slate-900 h-auto p-1"
                >
                  Clear
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            <div>
              <label className="text-xs text-slate-600 mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Search documents..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9 bg-slate-100 border-slate-200 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-600 mb-2 block">Category</label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                    !selectedCategory ? 'bg-af-blue/10 text-af-blue' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                    className={`w-full text-left px-3 py-1.5 rounded text-sm capitalize transition-colors ${
                      selectedCategory === cat ? 'bg-af-blue/10 text-af-blue' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cat.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-600 mb-2 block">Aircraft</label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedAircraft(null)}
                  className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                    !selectedAircraft ? 'bg-af-blue/10 text-af-blue' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All Aircraft
                </button>
                {aircraft.map((ac) => (
                  <button
                    key={ac}
                    onClick={() => setSelectedAircraft(selectedAircraft === ac ? null : ac)}
                    className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                      selectedAircraft === ac ? 'bg-af-blue/10 text-af-blue' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {aircraftLabels[ac] || ac}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-600 mb-2 block">System</label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedSystem(null)}
                  className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                    !selectedSystem ? 'bg-green-500/20 text-green-400' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All Systems
                </button>
                {systems.map((sys) => (
                  <button
                    key={sys}
                    onClick={() => setSelectedSystem(selectedSystem === sys ? null : sys)}
                    className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                      selectedSystem === sys ? 'bg-green-500/20 text-green-400' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {sys.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 bg-white border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-slate-600" />
              <span className="text-sm text-slate-600">
                {documents.length} document{documents.length !== 1 ? 's' : ''} found
              </span>
              {hasFilters && (
                <Badge variant="secondary" className="bg-af-blue/10 text-af-blue">
                  Filtered
                </Badge>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 border-2 border-af-blue border-t-transparent rounded-full animate-spin" />
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <BookOpen className="w-12 h-12 text-slate-400 mb-3" />
                <p className="text-slate-600">No documents found</p>
                <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {documents.map((doc) => {
                  const Icon = categoryIcons[doc.category] || FileText;

                  return (
                    <Card
                      key={doc.id}
                      className="bg-slate-50 border-slate-100 hover:border-af-blue/50 transition-colors cursor-pointer"
                      onClick={() => viewDocument(doc)}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${categoryColors[doc.category] || 'bg-slate-100 text-slate-900'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm text-slate-900 line-clamp-1">
                              {doc.title}
                            </CardTitle>
                            <CardDescription className="text-xs text-slate-500 line-clamp-2 mt-1">
                              {doc.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-xs capitalize">
                            {doc.category.replace('-', ' ')}
                          </Badge>
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-xs">
                            {aircraftLabels[doc.aircraft] || doc.aircraft}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {doc.viewCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {doc.uploadedBy.split(' ')[0]}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(doc.createdAt)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => {
                  const Icon = categoryIcons[doc.category] || FileText;

                  return (
                    <div
                      key={doc.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-af-blue/50 transition-colors cursor-pointer"
                      onClick={() => viewDocument(doc)}
                    >
                      <div className={`p-2 rounded-lg ${categoryColors[doc.category] || 'bg-slate-100 text-slate-900'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900 font-medium truncate">{doc.title}</p>
                        <p className="text-xs text-slate-500 truncate">{doc.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-xs capitalize">
                          {doc.category.replace('-', ' ')}
                        </Badge>
                        <span className="text-xs text-slate-500">{formatDate(doc.createdAt)}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {doc.viewCount}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {selectedDoc && (
          <Card className="w-96 shrink-0 bg-white border-slate-200 overflow-hidden flex flex-col">
            <CardHeader className="p-4 border-b border-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm text-slate-900">{selectedDoc.title}</CardTitle>
                  <p className="text-xs text-slate-500 mt-1">{selectedDoc.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDoc(null)}
                  className="text-slate-600 hover:text-slate-900"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-1 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Category</label>
                  <Badge className={categoryColors[selectedDoc.category] || 'bg-slate-100 text-slate-900 capitalize'}>
                    {selectedDoc.category.replace('-', ' ')}
                  </Badge>
                </div>

                <div>
                  <label className="text-xs text-slate-500 block mb-1">Aircraft</label>
                  <p className="text-sm text-slate-900">{aircraftLabels[selectedDoc.aircraft] || selectedDoc.aircraft}</p>
                </div>

                <div>
                  <label className="text-xs text-slate-500 block mb-1">System</label>
                  <p className="text-sm text-slate-900 capitalize">{selectedDoc.system.replace('-', ' ')}</p>
                </div>

                <div>
                  <label className="text-xs text-slate-500 block mb-1">File Type</label>
                  <p className="text-sm text-slate-900 uppercase">{selectedDoc.fileType} ({formatFileSize(selectedDoc.fileSize)})</p>
                </div>

                <div>
                  <label className="text-xs text-slate-500 block mb-1">Tags</label>
                  <div className="flex flex-wrap gap-1">
                    {selectedDoc.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-600 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <User className="w-3 h-3" />
                    <span>{selectedDoc.uploadedBy}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <Calendar className="w-3 h-3" />
                    <span>Uploaded: {formatDate(selectedDoc.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Eye className="w-3 h-3" />
                    <span>Views: {selectedDoc.viewCount}</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button className="w-full bg-af-blue hover:bg-af-blue-light text-white">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" className="w-full border-slate-200 text-slate-900">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Read Document
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
