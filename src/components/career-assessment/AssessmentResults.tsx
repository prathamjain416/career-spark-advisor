
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface AssessmentResultsProps {
  onReviewAssessment: () => void;
}

export const AssessmentResults: React.FC<AssessmentResultsProps> = ({ onReviewAssessment }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Assessment Results</CardTitle>
        <CardDescription>
          Based on your responses, here are your career recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Top Career Clusters</h3>
            <div className="grid gap-2">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="font-medium">Technology & Computer Science</div>
                <div className="text-sm text-muted-foreground">Software Development, Data Science, Cybersecurity</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="font-medium">Business & Management</div>
                <div className="text-sm text-muted-foreground">Marketing, Finance, Entrepreneurship</div>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg">
                <div className="font-medium">Creative Arts & Design</div>
                <div className="text-sm text-muted-foreground">UX/UI Design, Digital Media, Animation</div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Personality Type</h3>
            <p className="text-muted-foreground mb-2">
              You exhibit characteristics of an <span className="font-medium text-blue-600">Analytical Innovator</span>
            </p>
            <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
              <li>Strong problem-solving abilities</li>
              <li>Enjoys creative and technical challenges</li>
              <li>Works well independently and in small teams</li>
              <li>Prefers flexible work environments</li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onReviewAssessment}>
          Review Assessment
        </Button>
        <Button onClick={() => document.getElementById('careers')?.scrollIntoView({ behavior: 'smooth' })}>
          View Career Details
        </Button>
      </CardFooter>
    </Card>
  );
};
