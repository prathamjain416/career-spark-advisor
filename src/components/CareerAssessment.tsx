
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { questions } from './career-assessment/questions';
import { AssessmentQuestionnaire } from './career-assessment/AssessmentQuestionnaire';
import { AssessmentResults } from './career-assessment/AssessmentResults';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { generateAssessmentResults } from './career-assessment/OpenAIService';

type SingleAnswerType = string | { answer: string, otherText?: string };
type MultipleAnswerType = string[] | { answers: string[], otherText?: string };
type AnswerRecord = Record<number, string | SingleAnswerType | MultipleAnswerType>;

const CareerAssessment = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [selectedMultipleAnswers, setSelectedMultipleAnswers] = useState<string[]>([]);
  const [textAnswer, setTextAnswer] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'class10' | 'class12'>('class10');
  const [isGeneratingResults, setIsGeneratingResults] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<any>(null);
  const { toast } = useToast();

  const tierQuestions = questions.filter(q => q.tier === selectedTier);

  const handleNext = () => {
    const currentQuestion = tierQuestions[currentQuestionIndex];
    
    if (currentQuestion.type === 'single') {
      let answerData: SingleAnswerType = selectedAnswer || '';
      
      if (selectedAnswer && 
          currentQuestion.options.find(o => o.id === selectedAnswer)?.text === "Other" && 
          textAnswer.trim()) {
        answerData = {
          answer: selectedAnswer,
          otherText: textAnswer.trim()
        };
      }
      
      setAnswers({ ...answers, [currentQuestion.id]: answerData });
    } 
    else if (currentQuestion.type === 'multiple') {
      let answerData: MultipleAnswerType = [...selectedMultipleAnswers];
      
      const otherOption = currentQuestion.options.find(o => o.text === "Other");
      if (otherOption && selectedMultipleAnswers.includes(otherOption.id) && textAnswer.trim()) {
        answerData = {
          answers: selectedMultipleAnswers,
          otherText: textAnswer.trim()
        };
      }
      
      setAnswers({ ...answers, [currentQuestion.id]: answerData });
    } 
    else if (currentQuestion.type === 'text') {
      setAnswers({ ...answers, [currentQuestion.id]: textAnswer });
    }
    
    if (currentQuestionIndex < tierQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      
      const nextQuestion = tierQuestions[currentQuestionIndex + 1];
      
      if (nextQuestion.type === 'single') {
        const savedAnswer = answers[nextQuestion.id];
        if (typeof savedAnswer === 'string') {
          setSelectedAnswer(savedAnswer || null);
        } else if (savedAnswer && typeof savedAnswer === 'object' && 'answer' in savedAnswer) {
          setSelectedAnswer(savedAnswer.answer);
          setTextAnswer(savedAnswer.otherText || '');
        } else {
          setSelectedAnswer(null);
        }
        setSelectedMultipleAnswers([]);
        setTextAnswer('');
      } 
      else if (nextQuestion.type === 'multiple') {
        const savedAnswer = answers[nextQuestion.id];
        if (Array.isArray(savedAnswer)) {
          setSelectedMultipleAnswers([...savedAnswer]);
        } else if (savedAnswer && typeof savedAnswer === 'object' && 'answers' in savedAnswer) {
          setSelectedMultipleAnswers([...savedAnswer.answers]);
          setTextAnswer(savedAnswer.otherText || '');
        } else {
          setSelectedMultipleAnswers([]);
        }
        setSelectedAnswer(null);
        setTextAnswer('');
      } 
      else if (nextQuestion.type === 'text') {
        const savedAnswer = answers[nextQuestion.id];
        setTextAnswer(typeof savedAnswer === 'string' ? savedAnswer : '');
        setSelectedAnswer(null);
        setSelectedMultipleAnswers([]);
      }
    } else {
      setIsCompleted(true);
      generateResults();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      
      const prevQuestion = tierQuestions[currentQuestionIndex - 1];
      
      if (prevQuestion.type === 'single') {
        const savedAnswer = answers[prevQuestion.id];
        if (typeof savedAnswer === 'string') {
          setSelectedAnswer(savedAnswer || null);
        } else if (savedAnswer && typeof savedAnswer === 'object' && 'answer' in savedAnswer) {
          setSelectedAnswer(savedAnswer.answer);
          setTextAnswer(savedAnswer.otherText || '');
        } else {
          setSelectedAnswer(null);
        }
        setSelectedMultipleAnswers([]);
      } 
      else if (prevQuestion.type === 'multiple') {
        const savedAnswer = answers[prevQuestion.id];
        if (Array.isArray(savedAnswer)) {
          setSelectedMultipleAnswers([...savedAnswer]);
        } else if (savedAnswer && typeof savedAnswer === 'object' && 'answers' in savedAnswer) {
          setSelectedMultipleAnswers([...savedAnswer.answers]);
          setTextAnswer(savedAnswer.otherText || '');
        } else {
          setSelectedMultipleAnswers([]);
        }
        setSelectedAnswer(null);
      } 
      else if (prevQuestion.type === 'text') {
        const savedAnswer = answers[prevQuestion.id];
        setTextAnswer(typeof savedAnswer === 'string' ? savedAnswer : '');
        setSelectedAnswer(null);
        setSelectedMultipleAnswers([]);
      }
    }
  };

  const generateResults = async () => {
    setIsGeneratingResults(true);
    
    try {
      const formattedAnswers = Object.keys(answers).map(questionId => {
        const question = questions.find(q => q.id === parseInt(questionId));
        const answer = answers[parseInt(questionId)];
        
        let formattedAnswer = '';
        
        if (typeof answer === 'string') {
          formattedAnswer = answer;
        } 
        else if (Array.isArray(answer)) {
          formattedAnswer = answer.map(a => {
            const option = question?.options.find(o => o.id === a);
            return option?.text || a;
          }).join(', ');
        } 
        else if (answer && typeof answer === 'object') {
          if ('answer' in answer) {
            const option = question?.options.find(o => o.id === answer.answer);
            formattedAnswer = option?.text || answer.answer;
            if (answer.otherText) {
              formattedAnswer += `: ${answer.otherText}`;
            }
          } 
          else if ('answers' in answer && Array.isArray(answer.answers)) {
            formattedAnswer = answer.answers.map(a => {
              const option = question?.options.find(o => o.id === a);
              return option?.text || a;
            }).join(', ');
            if (answer.otherText) {
              formattedAnswer += `, Other: ${answer.otherText}`;
            }
          }
        }
        
        return {
          question: question?.text || `Question ${questionId}`,
          answer: formattedAnswer
        };
      });
      
      try {
        console.log('Calling generateAssessmentResults with:', selectedTier, formattedAnswers);
        const results = await generateAssessmentResults(selectedTier, formattedAnswers);
        console.log('Results received:', results);
        setAssessmentResults(results);
        
        // Automatically switch to results tab after generating results
        const resultsTab = document.querySelector('[data-value="results"]') as HTMLElement;
        if (resultsTab) resultsTab.click();
        
        toast({
          title: "Assessment completed!",
          description: "Your personalized results are ready to view.",
        });
      } catch (error) {
        console.error('Error calling OpenAI service:', error);
        toast({
          title: "Error generating results",
          description: "Using fallback data. You can still view your results.",
          variant: "destructive"
        });
        
        // Set fallback results
        if (selectedTier === 'class10') {
          setAssessmentResults({
            recommendedStream: 'Science',
            alternateStream: 'Commerce',
            coreSubjects: 'Physics, Chemistry, Mathematics, English',
            optionalSubjects: 'Computer Science or Biology',
            boardRecommendations: [
              'CBSE - Good for competitive exam preparation',
              'ICSE - Strong focus on English and practical learning',
              'State Board - If you plan to apply for state colleges'
            ]
          });
        } else {
          setAssessmentResults({
            recommendedDegrees: [
              { name: 'B.Tech Computer Science', description: 'Strong match based on your interests in technology' },
              { name: 'B.Sc Data Science', description: 'Good option combining technology and analytics' },
              { name: 'BCA (Bachelor of Computer Applications)', description: 'Alternative option with more flexibility' }
            ],
            careerPaths: [
              { name: 'Software Development', description: 'Building applications, websites, and systems' },
              { name: 'Data Science & Analytics', description: 'Analyzing data to derive insights and make predictions' },
              { name: 'Cybersecurity', description: 'Protecting systems and data from digital attacks' }
            ],
            entranceExams: 'JEE Main, CUET, MHT-CET (for Maharashtra)',
            preparationTips: [
              'Start JEE preparation at least 1-2 years before the exam',
              'Focus on NCERT textbooks and standard reference books',
              'Join a coaching program or use online resources',
              'Practice with previous years\' question papers'
            ]
          });
        }
        
        // Automatically switch to results tab
        const resultsTab = document.querySelector('[data-value="results"]') as HTMLElement;
        if (resultsTab) resultsTab.click();
      }
    } catch (error) {
      console.error('Error generating results:', error);
      toast({
        title: "Error generating results",
        description: "There was a problem analyzing your responses. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingResults(false);
    }
  };

  const handleTierChange = (tier: 'class10' | 'class12') => {
    setSelectedTier(tier);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setSelectedMultipleAnswers([]);
    setTextAnswer('');
    setIsCompleted(false);
    setAssessmentResults(null);
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
    }, {} as AnswerRecord);
    
    setCurrentQuestionIndex(0);
    setAnswers(filteredAnswers);
    setSelectedAnswer(null);
    setSelectedMultipleAnswers([]);
    setTextAnswer('');
    setIsCompleted(false);
    setAssessmentResults(null);
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
              <TabsTrigger value="questionnaire" data-value="questionnaire">Assessment</TabsTrigger>
              <TabsTrigger value="results" data-value="results" disabled={!isCompleted}>Results</TabsTrigger>
            </TabsList>
            
            <TabsContent value="questionnaire">
              <AssessmentQuestionnaire 
                currentQuestionIndex={currentQuestionIndex}
                questions={tierQuestions}
                selectedAnswer={selectedAnswer}
                selectedMultipleAnswers={selectedMultipleAnswers}
                textAnswer={textAnswer}
                setSelectedAnswer={setSelectedAnswer}
                setSelectedMultipleAnswers={setSelectedMultipleAnswers}
                setTextAnswer={setTextAnswer}
                handleNext={handleNext}
                handlePrevious={handlePrevious}
                progressPercentage={progressPercentage}
                isCompleted={isCompleted}
                handleStartOver={handleStartOver}
                assessmentType={selectedTier === 'class10' ? 'Class 10 Stream Selector' : 'Class 12 Career Finder'}
                isGeneratingResults={isGeneratingResults}
              />
            </TabsContent>
            
            <TabsContent value="results">
              <AssessmentResults 
                onReviewAssessment={handleReviewAssessment}
                assessmentTier={selectedTier}
                answers={answers}
                results={assessmentResults}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default CareerAssessment;
