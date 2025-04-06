
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Question } from './questions';

interface AssessmentQuestionnaireProps {
  currentQuestionIndex: number;
  questions: Question[];
  selectedAnswer: string | null;
  setSelectedAnswer: (answer: string) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  progressPercentage: number;
  isCompleted: boolean;
  handleStartOver: () => void;
}

export const AssessmentQuestionnaire: React.FC<AssessmentQuestionnaireProps> = ({
  currentQuestionIndex,
  questions,
  selectedAnswer,
  setSelectedAnswer,
  handleNext,
  handlePrevious,
  progressPercentage,
  isCompleted,
  handleStartOver
}) => {
  if (isCompleted) {
    return (
      <Card className="text-center p-8">
        <CardContent className="pt-6">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-2xl font-bold mb-2">Assessment Completed!</h3>
          <p className="text-muted-foreground mb-6">
            Thank you for completing the assessment. Click below to view your results.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={handleStartOver}>
              Start Over
            </Button>
            <Button onClick={() => {
              const resultsTab = document.querySelector('[data-value="results"]') as HTMLElement;
              if (resultsTab) resultsTab.click();
            }}>
              View Results
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          <div className="text-sm text-muted-foreground">
            {progressPercentage}% Complete
          </div>
        </div>
        <Progress value={progressPercentage} className="w-full h-2" />
        <CardTitle className="mt-4 text-xl">
          {questions[currentQuestionIndex].text}
        </CardTitle>
        <CardDescription>
          Select the option that best describes you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={selectedAnswer || ""} 
          onValueChange={setSelectedAnswer}
          className="space-y-3"
        >
          {questions[currentQuestionIndex].options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <RadioGroupItem value={option.id} id={`option-${option.id}`} />
              <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer py-2">
                {option.text}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!selectedAnswer}
        >
          {currentQuestionIndex < questions.length - 1 ? (
            <>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Complete
              <CheckCircle className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
