'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageTransition } from '@/components/ui/PageTransition';
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';
import { getCourses } from '@/lib/courses';
import { courses as mockCourses } from '@/data/mockData';
import type { Course } from '@/types';
import { cn, getDifficultyBadgeColor } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import {
  BookOpen,
  Search,
  Filter,
  Clock,
  Layers,
  Play,
  CheckCircle,
  RotateCcw,
} from 'lucide-react';

const categories = [
  'All',
  'Jet Engine Systems',
  'Hydraulics',
  'Electrical Systems',
  'Avionics',
  'Flight Control',
  'Weapons Systems',
  'Landing Gear',
  'Fuel Systems',
];

const difficulties = ['All', 'beginner', 'intermediate', 'advanced'];

export default function CourseCatalogPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getCourses().then(data => {
      const list = Array.isArray(data) && data.length > 0 ? data : mockCourses;
      setCourses(list);
      setTimeout(() => setIsLoading(false), 800);
    }).catch(err => {
      console.error(err);
      setCourses(mockCourses);
      setIsLoading(false);
    });
  }, []);

  const filteredCourses = (courses || []).filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || course.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-af-green" />;
      case 'in-progress':
        return <Play className="w-4 h-4 text-af-blue" />;
      default:
        return null;
    }
  };

  const getActionButton = (course: Course) => {
    switch (course.status) {
      case 'completed':
        return (
          <Button
            variant="outline"
            size="sm"
            className="border-af-green/50 text-af-green hover:bg-af-green/10 w-full"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/trainee/module/${course.id}`);
            }}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Review
          </Button>
        );
      case 'in-progress':
        return (
          <Button
            size="sm"
            className="bg-af-blue hover:bg-af-midnight text-white w-full"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/trainee/module/${course.id}`);
            }}
          >
            <Play className="w-4 h-4 mr-1" />
            Continue
          </Button>
        );
      default:
        return (
          <Button
            size="sm"
            className="bg-af-blue hover:bg-af-midnight text-white w-full"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/trainee/module/${course.id}`);
            }}
          >
            <Play className="w-4 h-4 mr-1" />
            Start
          </Button>
        );
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Training Catalog"
          subtitle="Browse and enroll in aircraft systems training courses"
          icon={BookOpen}
        />

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search courses, topics, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-af-blue focus:ring-af-blue/10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'border-slate-200 text-slate-600 hover:bg-slate-50 transition-all',
                showFilters && 'bg-slate-50 border-af-blue/50'
              )}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-4 shadow-sm mb-4">
                  {/* Category Filter */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={cn(
                            'px-3 py-1.5 text-xs rounded-full border transition-colors',
                            selectedCategory === category
                              ? 'bg-af-blue border-af-blue text-white shadow-sm'
                              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                          )}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty Filter */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Difficulty</label>
                    <div className="flex flex-wrap gap-2">
                      {difficulties.map((difficulty) => (
                        <button
                          key={difficulty}
                          onClick={() => setSelectedDifficulty(difficulty)}
                          className={cn(
                            'px-3 py-1.5 text-xs rounded-full border transition-colors capitalize',
                            selectedDifficulty === difficulty
                              ? 'bg-af-orange border-af-orange text-white shadow-sm'
                              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                          )}
                        >
                          {difficulty}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing <span className="text-slate-900 font-bold">{filteredCourses.length}</span> courses
            </p>
            {(selectedCategory !== 'All' || selectedDifficulty !== 'All') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedDifficulty('All');
                }}
                className="text-af-blue hover:text-af-blue/80 hover:bg-af-blue/5"
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Card
                className="bg-white border-slate-200 hover:border-af-blue/30 hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden h-full flex flex-col"
                onClick={() => router.push(`/trainee/module/${course.id}`)}
              >
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent" />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={course.status} size="sm" />
                  </div>

                  {/* Difficulty Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className={cn(
                      'capitalize border-0 bg-white/90 backdrop-blur-sm',
                      course.difficulty === 'beginner' ? 'text-af-green' :
                      course.difficulty === 'intermediate' ? 'text-af-blue' : 'text-af-orange'
                    )}>
                      {course.difficulty}
                    </Badge>
                  </div>

                  {/* Category */}
                  <div className="absolute bottom-3 left-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-slate-900/60 backdrop-blur-sm px-2 py-0.5 rounded">
                      {course.category}
                    </span>
                  </div>
                </div>

                <CardContent className="p-5 space-y-4 flex-1 flex flex-col">
                  {/* Title */}
                  <div className="flex items-start gap-2">
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-2 flex-1 tracking-tight group-hover:text-af-blue transition-colors">
                      {course.title}
                    </h3>
                    {getStatusIcon(course.status)}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed flex-1">
                    {course.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>{course.moduleCount} modules</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{course.duration}</span>
                    </div>
                  </div>

                  {/* Progress */}
                  {course.status !== 'not-started' && (
                    <div className="pt-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <ProgressBar value={course.progress} size="sm" />
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-2 mt-auto">
                    {getActionButton(course)}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200"
          >
            <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No missions found</h3>
            <p className="text-sm text-slate-500">
              Try adjusting your search filters to find available training modules
            </p>
            <Button
              variant="ghost"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedDifficulty('All');
              }}
              className="mt-4 text-af-blue font-bold"
            >
              Reset all filters
            </Button>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
