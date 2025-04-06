
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, School, GraduationCap, Briefcase } from "lucide-react";

interface AssessmentResultsProps {
  onReviewAssessment: () => void;
  assessmentTier: 'class10' | 'class12';
  answers: Record<number, string>;
}

export const AssessmentResults: React.FC<AssessmentResultsProps> = ({ 
  onReviewAssessment, 
  assessmentTier,
  answers 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {assessmentTier === 'class10' ? 'Class 10 Stream Selector Results' : 'Class 12 Career Path Results'}
        </CardTitle>
        <CardDescription>
          {assessmentTier === 'class10' 
            ? 'Based on your responses, here are the recommended streams for your 11th and 12th studies'
            : 'Based on your responses, here are the recommended career paths and degree programs'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {assessmentTier === 'class10' ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-blue-600" />
                Recommended Stream
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="text-xl font-semibold text-blue-700">Science</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Your analytical thinking and interest in problem-solving indicate a strong fit for Science stream.
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  <div className="font-medium">Alternate Option</div>
                  <div className="text-sm text-muted-foreground">Commerce</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <School className="mr-2 h-5 w-5 text-emerald-600" />
                Recommended Subjects
              </h3>
              <div className="grid gap-2">
                <div className="bg-emerald-50 p-3 rounded-lg">
                  <div className="font-medium">Core Subjects</div>
                  <div className="text-sm text-muted-foreground">Physics, Chemistry, Mathematics, English</div>
                </div>
                <div className="bg-emerald-50/70 p-3 rounded-lg">
                  <div className="font-medium">Optional Subject Recommendations</div>
                  <div className="text-sm text-muted-foreground">Computer Science or Biology, depending on your interests</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <GraduationCap className="mr-2 h-5 w-5 text-amber-600" />
                Board Recommendations
              </h3>
              <div className="text-sm text-muted-foreground mb-2">
                Based on your learning style and goals, these boards might be suitable:
              </div>
              <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                <li>CBSE - Good for competitive exam preparation</li>
                <li>ICSE - Strong focus on English and practical learning</li>
                <li>State Board - If you plan to apply for state colleges</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <GraduationCap className="mr-2 h-5 w-5 text-blue-600" />
                Recommended Undergraduate Degrees
              </h3>
              <div className="grid gap-2">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="font-medium">B.Tech Computer Science</div>
                  <div className="text-sm text-muted-foreground">Strong match based on your interests in technology</div>
                </div>
                <div className="bg-blue-50/70 p-3 rounded-lg">
                  <div className="font-medium">B.Sc Data Science</div>
                  <div className="text-sm text-muted-foreground">Good option combining technology and analytics</div>
                </div>
                <div className="bg-blue-50/50 p-3 rounded-lg">
                  <div className="font-medium">BCA (Bachelor of Computer Applications)</div>
                  <div className="text-sm text-muted-foreground">Alternative option with more flexibility</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <Briefcase className="mr-2 h-5 w-5 text-emerald-600" />
                Top Career Paths
              </h3>
              <div className="grid gap-2">
                <div className="bg-emerald-50 p-3 rounded-lg">
                  <div className="font-medium">Software Development</div>
                  <div className="text-sm text-muted-foreground">Building applications, websites, and systems</div>
                </div>
                <div className="bg-emerald-50/70 p-3 rounded-lg">
                  <div className="font-medium">Data Science & Analytics</div>
                  <div className="text-sm text-muted-foreground">Analyzing data to derive insights and make predictions</div>
                </div>
                <div className="bg-emerald-50/50 p-3 rounded-lg">
                  <div className="font-medium">Cybersecurity</div>
                  <div className="text-sm text-muted-foreground">Protecting systems and data from digital attacks</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-amber-600" />
                Entrance Exams & Preparation
              </h3>
              <div className="bg-amber-50 p-3 rounded-lg mb-2">
                <div className="font-medium">Required Entrance Exams</div>
                <div className="text-sm text-muted-foreground">JEE Main, CUET, MHT-CET (for Maharashtra)</div>
              </div>
              <div className="text-sm text-muted-foreground mb-1">
                Preparation Tips:
              </div>
              <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                <li>Start JEE preparation at least 1-2 years before the exam</li>
                <li>Focus on NCERT textbooks and standard reference books</li>
                <li>Join a coaching program or use online resources</li>
                <li>Practice with previous years' question papers</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-3">
        <Button variant="outline" onClick={onReviewAssessment}>
          Review Assessment
        </Button>
        <Button onClick={() => document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth' })}>
          Chat with AI Counselor
        </Button>
      </CardFooter>
    </Card>
  );
};
