import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { CourseGraphVisualization } from '@/components/CourseGraphVisualization';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, Plus, Settings } from 'lucide-react';

interface Topic {
  id: number;
  name: string;
  masteryScore: number;
  parentTopicId?: number;
  assetCount?: number;
  lastReviewedAt?: string;
}

export const CourseGraph: React.FC = () => {
  // Mock data - replace with real API calls
  const [topics] = useState<Topic[]>([
    {
      id: 1,
      name: 'SQL Fundamentals',
      masteryScore: 85,
      assetCount: 12,
      lastReviewedAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'SELECT Basics',
      masteryScore: 90,
      parentTopicId: 1,
      assetCount: 5,
    },
    {
      id: 3,
      name: 'JOINs',
      masteryScore: 62,
      parentTopicId: 1,
      assetCount: 8,
    },
    {
      id: 4,
      name: 'GROUP BY',
      masteryScore: 45,
      parentTopicId: 1,
      assetCount: 3,
    },
    {
      id: 5,
      name: 'Window Functions',
      masteryScore: 30,
      parentTopicId: 1,
      assetCount: 2,
    },
  ]);

  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const getMasteryLabel = (score: number): string => {
    if (score < 33) return 'Weak';
    if (score < 66) return 'Medium';
    return 'Strong';
  };

  const getMasteryColor = (score: number): string => {
    if (score < 33) return 'bg-red-500';
    if (score < 66) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">CourseGraph</h1>
            <p className="text-muted-foreground mt-1">
              Personalized academic intelligence across your course
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Course
            </Button>
          </div>
        </div>

        {/* Main visualization */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Knowledge Graph</h2>
          <CourseGraphVisualization
            topics={topics}
            onNodeClick={setSelectedTopic}
            height={500}
          />
        </Card>

        <div className="grid grid-cols-3 gap-6">
          {/* Topics list */}
          <div className="col-span-2 space-y-4">
            <h2 className="text-xl font-semibold">Topics</h2>
            {topics.map((topic) => (
              <Card
                key={topic.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedTopic?.id === topic.id
                    ? 'ring-2 ring-primary'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedTopic(topic)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{topic.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {topic.assetCount || 0} assets • Last reviewed{' '}
                      {topic.lastReviewedAt
                        ? new Date(topic.lastReviewedAt).toLocaleDateString()
                        : 'Never'}
                    </p>
                  </div>
                  <Badge
                    className={`${getMasteryColor(topic.masteryScore)} text-white`}
                  >
                    {getMasteryLabel(topic.masteryScore)}
                  </Badge>
                </div>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Mastery</span>
                    <span className="font-semibold">{topic.masteryScore}%</span>
                  </div>
                  <Progress
                    value={topic.masteryScore}
                    className="h-2"
                  />
                </div>
              </Card>
            ))}
          </div>

          {/* Topic details panel */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Details</h2>
            {selectedTopic ? (
              <Card className="p-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedTopic.name}</h3>
                  <Badge className={getMasteryColor(selectedTopic.masteryScore)}>
                    {getMasteryLabel(selectedTopic.masteryScore)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Mastery Score</p>
                    <p className="text-2xl font-bold">{selectedTopic.masteryScore}%</p>
                  </div>
                  <Progress value={selectedTopic.masteryScore} />
                </div>

                <div className="text-sm">
                  <p className="text-muted-foreground">Assets</p>
                  <p className="font-semibold">{selectedTopic.assetCount || 0}</p>
                </div>

                <div className="text-sm">
                  <p className="text-muted-foreground">Last Reviewed</p>
                  <p className="font-semibold">
                    {selectedTopic.lastReviewedAt
                      ? new Date(selectedTopic.lastReviewedAt).toLocaleDateString()
                      : 'Never'}
                  </p>
                </div>

                <div className="pt-4 space-y-2">
                  <Button className="w-full" size="sm">
                    Generate Practice Quiz
                  </Button>
                  <Button className="w-full" variant="outline" size="sm">
                    Review Assets
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-4 text-center text-muted-foreground">
                <p>Click a topic to view details</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
