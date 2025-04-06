
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { questions } from './career-assessment/questions';
import { AssessmentQuestionnaire } from './career-assessment/AssessmentQuestionnaire';
import { AssessmentResults } from './career-assessment/AssessmentResults';
import { Button } from "@/components/ui/button";

const CareerAssessment = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'class10' | 'class12'>('class10');

  // Filter questions by the selected tier
  const tierQuestions = questions.filter(q => q.tier === selectedTier);

  const handleNext = () => {
    if (selectedAnswer) {
      setAnswers({ ...answers, [tierQuestions[currentQuestionIndex].id]: selectedAnswer });
      
      if (currentQuestionIndex < tierQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(answers[tierQuestions[currentQuestionIndex + 1].id] || null);
      } else {
        setIsCompleted(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answers[tierQuestions[currentQuestionIndex - 1].id] || null);
    }
  };

  const handleTierChange = (tier: 'class10' | 'class12') => {
    setSelectedTier(tier);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCompleted(false);
  };

  const progressPercentage = Math.round(((Object.keys(answers).filter(key => 
    questions.find(q => q.id === parseInt(key))?.tier === selectedTier
  ).length) / tierQuestions.length) * 100);

  const handleStartOver = () => {
    const filteredAnswers = Object.keys(answers).reduce((acc, key) => {
      if (questions.find(q => q.id === parseInt(key))?.tier !== selectedTier) {
        acc[parseInt(key)] = answers[parseInt(key)];
      }
      return acc;
    }, {} as Record<number, string>);
    
    setCurrentQuestionIndex(0);
    setAnswers(filteredAnswers);
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
          
          <div className="bg-white rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium mb-3">Select Assessment Type:</h3>
            <div className="flex gap-4">
              <Button 
                onClick={() => handleTierChange('class10')}
                variant={selectedTier === 'class10' ? "default" : "outline"}
                className="flex-1"
              >
                Class 10 Stream Selector
              </Button>
              <Button 
                onClick={() => handleTierChange('class12')}
                variant={selectedTier === 'class12' ? "default" : "outline"}
                className="flex-1"
              >
                Class 12 Career Finder
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="questionnaire" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="questionnaire">Assessment</TabsTrigger>
              <TabsTrigger value="results" disabled={!isCompleted}>Results</TabsTrigger>
            </TabsList>
            
            <TabsContent value="questionnaire">
              <AssessmentQuestionnaire 
                currentQuestionIndex={currentQuestionIndex}
                questions={tierQuestions}
                selectedAnswer={selectedAnswer}
                setSelectedAnswer={setSelectedAnswer}
                handleNext={handleNext}
                handlePrevious={handlePrevious}
                progressPercentage={progressPercentage}
                isCompleted={isCompleted}
                handleStartOver={handleStartOver}
                assessmentType={selectedTier === 'class10' ? 'Class 10 Stream Selector' : 'Class 12 Career Finder'}
              />
            </TabsContent>
            
            <TabsContent value="results">
              <AssessmentResults 
                onReviewAssessment={handleReviewAssessment}
                assessmentTier={selectedTier}
                answers={answers}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default CareerAssessment;
