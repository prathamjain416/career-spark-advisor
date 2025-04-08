import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, School, GraduationCap, Briefcase, Book } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AssessmentResultsProps {
  onReviewAssessment: () => void;
  assessmentTier: 'class10' | 'class12';
  answers: Record<number, any>;
  results: any;
}

export const AssessmentResults: React.FC<AssessmentResultsProps> = ({ 
  onReviewAssessment, 
  assessmentTier,
  answers,
  results
}) => {
  const { toast } = useToast();

  if (!results) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Results Available</CardTitle>
          <CardDescription>
            Please complete the assessment to view your personalized results.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Your results will appear here after you complete the assessment questionnaire.
            </p>
            <Button onClick={onReviewAssessment}>
              Go to Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const scrollToChatSection = () => {
    try {
      const chatSection = document.getElementById('chat');
      if (chatSection) {
        chatSection.scrollIntoView({ behavior: 'smooth' });
        
        // Add visual feedback
        setTimeout(() => {
          toast({
            title: "Chat section available",
            description: "You can now chat with our AI career counselor",
          });
          
          // Add a subtle highlight effect to the chat section
          chatSection.classList.add('ring-2', 'ring-blue-300');
          setTimeout(() => {
            chatSection.classList.remove('ring-2', 'ring-blue-300');
          }, 2000);
        }, 500);
        
        return;
      }
      
      // Fallback to scrolling to the bottom if chat section not found
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
      
      toast({
        title: "Scroll down for chat",
        description: "The AI career counselor chat is at the bottom of the page",
      });
    } catch (error) {
      console.error("Error scrolling to chat section:", error);
      // Fallback to alert
      toast({
        title: "Please scroll down",
        description: "The AI career counselor chat is at the bottom of the page",
      });
    }
  };

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
                <div className="text-xl font-semibold text-blue-700">{results.recommendedStream}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Your analytical thinking and interest in problem-solving indicate a strong fit for {results.recommendedStream} stream.
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  <div className="font-medium">Alternate Option</div>
                  <div className="text-sm text-muted-foreground">{results.alternateStream}</div>
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
                  <div className="text-sm text-muted-foreground">{results.coreSubjects}</div>
                </div>
                <div className="bg-emerald-50/70 p-3 rounded-lg">
                  <div className="font-medium">Optional Subject Recommendations</div>
                  <div className="text-sm text-muted-foreground">{results.optionalSubjects}</div>
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
                {results.boardRecommendations?.map((recommendation: string, index: number) => (
                  <li key={index}>{recommendation}</li>
                ))}
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
                {results.recommendedDegrees?.map((degree: {name: string, description: string}, index: number) => (
                  <div key={index} className={`bg-blue-50${index > 0 ? '/' + (70 - index * 20) : ''} p-3 rounded-lg`}>
                    <div className="font-medium">{degree.name}</div>
                    <div className="text-sm text-muted-foreground">{degree.description}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <Briefcase className="mr-2 h-5 w-5 text-emerald-600" />
                Top Career Paths
              </h3>
              <div className="grid gap-2">
                {results.careerPaths?.map((career: {name: string, description: string}, index: number) => (
                  <div key={index} className={`bg-emerald-50${index > 0 ? '/' + (70 - index * 20) : ''} p-3 rounded-lg`}>
                    <div className="font-medium">{career.name}</div>
                    <div className="text-sm text-muted-foreground">{career.description}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-amber-600" />
                Entrance Exams & Preparation
              </h3>
              <div className="bg-amber-50 p-3 rounded-lg mb-2">
                <div className="font-medium">Required Entrance Exams</div>
                <div className="text-sm text-muted-foreground">{results.entranceExams}</div>
              </div>
              <div className="text-sm text-muted-foreground mb-1">
                Preparation Tips:
              </div>
              <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                {results.preparationTips?.map((tip: string, index: number) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-3">
        <Button variant="outline" onClick={onReviewAssessment}>
          Review Assessment
        </Button>
        <Button 
          onClick={scrollToChatSection} 
          className="animate-pulse hover:animate-none bg-blue-600 hover:bg-blue-700 transition-all"
        >
          Chat with AI Counselor
        </Button>
      </CardFooter>
    </Card>
  );
};
