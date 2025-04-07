import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Question } from './questions';

interface AssessmentQuestionnaireProps {
  currentQuestionIndex: number;
  questions: Question[];
  selectedAnswer: string | null;
  selectedMultipleAnswers: string[];
  textAnswer: string;
  setSelectedAnswer: (answer: string) => void;
  setSelectedMultipleAnswers: (answers: string[] | ((prev: string[]) => string[])) => void;
  setTextAnswer: (text: string) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  progressPercentage: number;
  isCompleted: boolean;
  handleStartOver: () => void;
  assessmentType: string;
  isGeneratingResults: boolean;
}

export const AssessmentQuestionnaire: React.FC<AssessmentQuestionnaireProps> = ({
  currentQuestionIndex,
  questions,
  selectedAnswer,
  selectedMultipleAnswers,
  textAnswer,
  setSelectedAnswer,
  setSelectedMultipleAnswers,
  setTextAnswer,
  handleNext,
  handlePrevious,
  progressPercentage,
  isCompleted,
  handleStartOver,
  assessmentType,
  isGeneratingResults
}) => {
  const handleCheckboxChange = (id: string) => {
    setSelectedMultipleAnswers((prev: string[]) => {
      // Type-safe implementation of the checkbox toggle logic
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  if (isCompleted) {
    return (
      <Card className="text-center p-8">
        <CardContent className="pt-6">
          {isGeneratingResults ? (
            <>
              <div className="flex flex-col items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <h3 className="text-2xl font-bold mb-2">Generating Your Results</h3>
                <p className="text-muted-foreground mb-6">
                  We're analyzing your responses to provide personalized career guidance...
                </p>
              </div>
            </>
          ) : (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Assessment Completed!</h3>
              <p className="text-muted-foreground mb-6">
                Thank you for completing the {assessmentType}. Click below to view your results.
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
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="text-center p-8">
        <CardContent className="pt-6">
          <h3 className="text-2xl font-bold mb-2">No Questions Available</h3>
          <p className="text-muted-foreground mb-6">
            There are no questions available for this assessment type at the moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isMultipleChoice = currentQuestion.type === 'multiple';
  const isTextInput = currentQuestion.type === 'text';
  const isSingleChoice = currentQuestion.type === 'single';

  const hasValidResponse = () => {
    if (isTextInput) {
      return textAnswer.trim() !== '';
    } else if (isMultipleChoice) {
      return selectedMultipleAnswers.length > 0;
    } else {
      return selectedAnswer !== null;
    }
  };

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
          {currentQuestion.text}
        </CardTitle>
        <CardDescription>
          {assessmentType}: {isMultipleChoice ? "Select all that apply" : isSingleChoice ? "Select the option that best describes you" : "Please provide your answer"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isTextInput ? (
          <Textarea 
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="min-h-[100px]"
          />
        ) : isMultipleChoice ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQuestion.options.map((option) => (
              <div key={option.id} className="flex items-start space-x-2 rounded-md p-2 hover:bg-muted/50">
                <Checkbox 
                  id={`option-${option.id}`}
                  checked={selectedMultipleAnswers.includes(option.id)}
                  onCheckedChange={() => handleCheckboxChange(option.id)}
                />
                <Label 
                  htmlFor={`option-${option.id}`} 
                  className="flex-1 cursor-pointer py-0.5"
                >
                  {option.text}
                </Label>
              </div>
            ))}
          </div>
        ) : (
          <RadioGroup 
            value={selectedAnswer || ""} 
            onValueChange={setSelectedAnswer}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {currentQuestion.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2 rounded-md p-2 hover:bg-muted/50">
                <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer py-0.5">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
        
        {isMultipleChoice && currentQuestion.options.some(opt => opt.text === "Other") && (
          <div className="mt-3 pl-6">
            <Textarea
              placeholder="If you selected 'Other', please specify..."
              className="mt-1"
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              disabled={!selectedMultipleAnswers.includes(
                currentQuestion.options.find(opt => opt.text === "Other")?.id || ""
              )}
            />
          </div>
        )}
        
        {isSingleChoice && currentQuestion.options.some(opt => opt.text === "Other") && 
          selectedAnswer === currentQuestion.options.find(opt => opt.text === "Other")?.id && (
          <div className="mt-3 pl-6">
            <Textarea
              placeholder="Please specify..."
              className="mt-1"
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
            />
          </div>
        )}
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
          disabled={!hasValidResponse()}
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
