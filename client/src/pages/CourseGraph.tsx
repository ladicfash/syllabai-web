import React, { useState, useMemo } from 'react';
import { AdSpace } from "@/components/AdSpace";
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import StudyLayout from '@/components/StudyLayout';
import { CourseGraphInteractive } from '@/components/CourseGraphInteractive';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';

interface Topic {
  id: string;
  name: string;
  description: string;
  completed?: boolean;
  inProgress?: boolean;
}

export const CourseGraph: React.FC = () => {
  const [, navigate] = useLocation();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // Fetch user's courses
  const { data: courses = [], isLoading: coursesLoading } = trpc.courseGraph.getCourses.useQuery();

  // Fetch topics for selected course
  const { data: dbTopics = [], isLoading: topicsLoading } = trpc.courseGraph.getTopics.useQuery(
    { courseId: selectedCourseId! },
    { enabled: selectedCourseId !== null }
  );

  // Set first course as selected on load
  React.useEffect(() => {
    if (courses.length > 0 && selectedCourseId === null) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  // Transform DB topics to UI format
  const topics: Topic[] = useMemo(() => {
    return dbTopics.map((t: any) => ({
      id: String(t.id),
      name: t.name,
      description: t.description || '',
      completed: t.masteryScore && t.masteryScore >= 80,
      inProgress: t.masteryScore && t.masteryScore >= 30 && t.masteryScore < 80,
    }));
  }, [dbTopics]);

  const selectedCourse = courses.find((c: any) => c.id === selectedCourseId);
  const isLoading = coursesLoading || topicsLoading;

  return (
    <StudyLayout>
      <div className="p-6 space-y-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-3xl font-bold text-white">CourseGraph</h1>
            <p className="text-slate-400 mt-1">
              Visualize your course structure and track learning progress
            </p>
          </div>
          <Button onClick={() => navigate('/course-graph/new')} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Course
          </Button>
        </div>

        {/* Course selector */}
        {courses.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {courses.map((course: any) => (
              <Button
                key={course.id}
                variant={selectedCourseId === course.id ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedCourseId(course.id);
                  setSelectedTopic(null);
                }}
              >
                {course.name}
              </Button>
            ))}
          </div>
        )}
        {/* Ad space - course selector */}
        <div className="flex justify-center">
          <AdSpace format="banner-468x60" />
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-slate-400">Loading course graph...</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && courses.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-slate-400 mb-4">No courses yet. Create your first course to get started.</p>
              <Button onClick={() => navigate('/course-graph/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Course
              </Button>
            </div>
          </div>
        )}

        {/* Main interactive graph */}
        {!isLoading && selectedCourse && topics.length > 0 && (
          <div className="flex-1 min-h-0">
            <CourseGraphInteractive
              courseId={String(selectedCourse.id)}
              courseName={selectedCourse.name}
              topics={topics}
              onTopicClick={(topicId) => {
                const topic = topics.find((t) => t.id === topicId);
                if (topic) setSelectedTopic(topic);
              }}
            />
          </div>
        )}

        {/* Empty topics state */}
        {!isLoading && selectedCourse && topics.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-slate-400 mb-4">No topics in this course yet.</p>
              <Button onClick={() => navigate('/course-graph/new')} variant="outline">
                Add Topics
              </Button>
            </div>
          </div>
        )}

        {/* Selected topic details panel */}
        {selectedTopic && (
          <Card className="p-4 bg-slate-900 border-slate-700 flex-shrink-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{selectedTopic.name}</h3>
                <p className="text-slate-400 text-sm mt-2">{selectedTopic.description}</p>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => navigate('/study-tools')}>
                    Study Materials
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate('/spaced-rep')}>
                    Practice Quiz
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTopic(null)}
              >
                ✕
              </Button>
            </div>
          </Card>
        )}
      </div>
    </StudyLayout>
  );
};
