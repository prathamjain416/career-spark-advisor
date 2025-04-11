
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface AssessmentResultsProps {
  onReviewAssessment: () => void;
  assessmentTier: 'class10' | 'class12';
  answers: Record<number, any>;
  results: any;
}

export const AssessmentResults: React.FC<AssessmentResultsProps> = ({ 
  onReviewAssessment, 
  assessmentTier
}) => {
  // This function scrolls to the chat section 
  const scrollToChatSection = () => {
    try {
      const chatSection = document.getElementById('chat');
      if (chatSection) {
        chatSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Fallback to scrolling to the bottom
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      }
    } catch (error) {
      console.error("Error scrolling to chat section:", error);
    }
  };

  return (
    <Card className="shadow-md border-2">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="text-xl">
          {assessmentTier === 'class10' ? 'Class 10 Stream Selector' : 'Class 12 Career Path Finder'}
        </CardTitle>
        <CardDescription>
          Your assessment results are now available in the chat below
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium mb-2">Results Shared to Chat</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Your assessment results have been automatically shared with our AI Career Counselor. 
            Please scroll down to the chat section to discuss your results and get personalized advice.
          </p>
          <Button 
            onClick={scrollToChatSection} 
            className="bg-blue-600 hover:bg-blue-700 transition-all"
          >
            Go to Chat
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-3 pb-4 border-t bg-gray-50">
        <Button variant="outline" onClick={onReviewAssessment}>
          Review Assessment
        </Button>
      </CardFooter>
    </Card>
  );
};
