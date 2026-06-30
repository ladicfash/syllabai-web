import React, { useState } from 'react';
import { useLocation } from 'wouter';
import StudyLayout from '@/components/StudyLayout';
import { CourseGraphInteractive } from '@/components/CourseGraphInteractive';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Topic {
  id: string;
  name: string;
  description: string;
  completed?: boolean;
  inProgress?: boolean;
}

export const CourseGraph: React.FC = () => {
  const [, navigate] = useLocation();
  
  // Mock data - replace with real API calls from trpc.courseGraph.getTopics
  const [topics] = useState<Topic[]>([
    {
      id: '1',
      name: 'SQL Fundamentals',
      description: 'Core SQL concepts including SELECT, WHERE, and basic queries',
      completed: true,
    },
    {
      id: '2',
      name: 'SELECT Basics',
      description: 'Master SELECT statements and column filtering',
      completed: true,
    },
    {
      id: '3',
      name: 'JOINs',
      description: 'Learn INNER, LEFT, RIGHT, and FULL OUTER joins',
      inProgress: true,
    },
    {
      id: '4',
      name: 'GROUP BY & Aggregates',
      description: 'Aggregate functions and grouping data',
    },
    {
      id: '5',
      name: 'Window Functions',
      description: 'Advanced analytics with window functions',
    },
    {
      id: '6',
      name: 'Subqueries',
      description: 'Nested queries and correlated subqueries',
    },
  ]);

  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

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

        {/* Main interactive graph */}
        <div className="flex-1 min-h-0">
          <CourseGraphInteractive
            courseId="demo-sql"
            courseName="SQL Mastery"
            topics={topics}
            onTopicClick={(topicId) => {
              const topic = topics.find((t) => t.id === topicId);
              if (topic) setSelectedTopic(topic);
            }}
          />
        </div>

        {/* Selected topic details panel */}
        {selectedTopic && (
          <Card className="p-4 bg-slate-900 border-slate-700 flex-shrink-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{selectedTopic.name}</h3>
                <p className="text-slate-400 text-sm mt-2">{selectedTopic.description}</p>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline">
                    Study Materials
                  </Button>
                  <Button size="sm" variant="outline">
                    Practice Quiz
                  </Button>
                </div>
              </div>
              <button
                onClick={() => setSelectedTopic(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </Card>
        )}
      </div>
    </StudyLayout>
  );
};

export default CourseGraph;
