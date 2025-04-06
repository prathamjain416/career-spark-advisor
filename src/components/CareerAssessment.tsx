
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const questions = [
  {
    id: 1,
    text: "Which of these activities do you enjoy the most?",
    category: "interests",
    options: [
      { id: "a", text: "Solving mathematical problems" },
      { id: "b", text: "Creating art or designs" },
      { id: "c", text: "Helping others with their problems" },
      { id: "d", text: "Building or fixing things" }
    ]
  },
  {
    id: 2,
    text: "In a group project, which role do you prefer to take?",
    category: "personality",
    options: [
      { id: "a", text: "The leader who organizes everyone" },
      { id: "b", text: "The creative one who comes up with ideas" },
      { id: "c", text: "The supportive one who helps others" },
      { id: "d", text: "The analytical one who solves problems" }
    ]
  },
  {
    id: 3,
    text: "Which subject do you find most interesting?",
    category: "interests",
    options: [
      { id: "a", text: "Science (Physics, Chemistry, Biology)" },
      { id: "b", text: "Humanities (History, Literature, Languages)" },
      { id: "c", text: "Mathematics and Computing" },
      { id: "d", text: "Arts and Design" }
    ]
  },
  {
    id: 4,
    text: "How do you prefer to solve problems?",
    category: "personality",
    options: [
      { id: "a", text: "Analyze data and find patterns" },
      { id: "b", text: "Brainstorm creative solutions" },
      { id: "c", text: "Discuss with others to find consensus" },
      { id: "d", text: "Follow established procedures and methods" }
    ]
  },
  {
    id: 5,
    text: "What type of work environment do you prefer?",
    category: "preferences",
    options: [
      { id: "a", text: "Structured with clear guidelines" },
      { id: "b", text: "Flexible and changing" },
      { id: "c", text: "Collaborative with lots of teamwork" },
      { id: "d", text: "Independent where I can work alone" }
    ]
  }
];

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
              {!isCompleted ? (
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
              ) : (
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
              )}
            </TabsContent>
            
            <TabsContent value="results">
              <Card>
                <CardHeader>
                  <CardTitle>Your Assessment Results</CardTitle>
                  <CardDescription>
                    Based on your responses, here are your career recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Simplified results section - would be more sophisticated in actual implementation */}
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
                  <Button variant="outline" onClick={() => {
                    const questionnaireTab = document.querySelector('[data-value="questionnaire"]') as HTMLElement;
                    if (questionnaireTab) questionnaireTab.click();
                  }}>
                    Review Assessment
                  </Button>
                  <Button onClick={() => document.getElementById('careers')?.scrollIntoView({ behavior: 'smooth' })}>
                    View Career Details
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default CareerAssessment;
