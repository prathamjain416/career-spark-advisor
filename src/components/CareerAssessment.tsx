
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { questions } from './career-assessment/questions';
import { AssessmentQuestionnaire } from './career-assessment/AssessmentQuestionnaire';
import { AssessmentResults } from './career-assessment/AssessmentResults';

const CareerAssessment = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleNext = () => {
    if (selectedAnswer) {
      setAnswers({ ...answers, [currentQuestionIndex]: selectedAnswer });
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(answers[currentQuestionIndex + 1] || null);
      } else {
        setIsCompleted(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1] || null);
    }
  };

  const progressPercentage = Math.round(((Object.keys(answers).length) / questions.length) * 100);

  const handleStartOver = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSelectedAnswer(null);
    setIsCompleted(false);
  };

  const handleReviewAssessment = () => {
    const questionnaireTab = document.querySelector('[data-value="questionnaire"]') as HTMLElement;
    if (questionnaireTab) questionnaireTab.click();
  };

  return (
    <section id="assessment" className="py-12 bg-blue-50">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Career Assessment</h2>
            <p className="text-muted-foreground">
              Discover your interests, strengths, and suitable career paths
            </p>
          </div>
          
          <Tabs defaultValue="questionnaire" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="questionnaire">Assessment</TabsTrigger>
              <TabsTrigger value="results" disabled={!isCompleted}>Results</TabsTrigger>
            </TabsList>
            
            <TabsContent value="questionnaire">
              <AssessmentQuestionnaire 
                currentQuestionIndex={currentQuestionIndex}
                questions={questions}
                selectedAnswer={selectedAnswer}
                setSelectedAnswer={setSelectedAnswer}
                handleNext={handleNext}
                handlePrevious={handlePrevious}
                progressPercentage={progressPercentage}
                isCompleted={isCompleted}
                handleStartOver={handleStartOver}
              />
            </TabsContent>
            
            <TabsContent value="results">
              <AssessmentResults 
                onReviewAssessment={handleReviewAssessment}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default CareerAssessment;
