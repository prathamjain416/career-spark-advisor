import React, { useState, useRef } from 'react';
import { questions } from './career-assessment/questions';
import { AssessmentQuestionnaire } from './career-assessment/AssessmentQuestionnaire';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { generateAssessmentResults, shareResultsWithChat } from './career-assessment/OpenAIService';
import { supabase } from '@/integrations/supabase/client';

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
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      
      const previousQuestion = tierQuestions[currentQuestionIndex - 1];
      
      if (previousQuestion.type === 'single') {
        const savedAnswer = answers[previousQuestion.id];
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
      else if (previousQuestion.type === 'multiple') {
        const savedAnswer = answers[previousQuestion.id];
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
      else if (previousQuestion.type === 'text') {
        const savedAnswer = answers[previousQuestion.id];
        setTextAnswer(typeof savedAnswer === 'string' ? savedAnswer : '');
        setSelectedAnswer(null);
        setSelectedMultipleAnswers([]);
      }
    }
  };

  const generateResults = async () => {
    try {
      setIsGeneratingResults(true);
      toast({
        title: "Generating results",
        description: "Please wait while we analyze your responses...",
      });
      
      // Format answers for the assessment service
      const formattedAnswers = Object.entries(answers)
        .filter(([key]) => {
          const question = questions.find(q => q.id === parseInt(key));
          return question?.tier === selectedTier;
        })
        .map(([questionId, answer]) => ({
          questionId: parseInt(questionId),
          answer: answer
        }));
      
      // Generate assessment results
      const results = await generateAssessmentResults(selectedTier, formattedAnswers);
      
      // Update state with results
      setAssessmentResults(results);
      setIsCompleted(true);
      
      toast({
        title: "Assessment completed!",
        description: "Click the 'View Results' button to see your recommendations.",
      });
    } catch (err) {
      console.error('Error generating results:', err);
      toast({
        title: "Error generating results",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingResults(false);
    }
  };

  const handleViewResults = async () => {
    if (!assessmentResults) return;

    try {
      setIsLoading(true);
      
      // Get the current user's session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error("Failed to get user session");
      if (!session?.user) throw new Error("User not authenticated");

      // Format the user's answers for the AI with actual option text
      const formattedAnswers = Object.entries(answers)
        .filter(([key]) => {
          const question = questions.find(q => q.id === parseInt(key));
          return question?.tier === selectedTier;
        })
        .map(([questionId, answer]) => {
          const question = questions.find(q => q.id === parseInt(questionId));
          if (!question) return null;

          let formattedAnswer = '';
          
          if (question.type === 'single') {
            const selectedOption = question.options.find(opt => opt.id === answer);
            formattedAnswer = selectedOption?.text || '';
          } else if (question.type === 'multiple') {
            if (Array.isArray(answer)) {
              const selectedOptions = question.options
                .filter(opt => answer.includes(opt.id))
                .map(opt => opt.text);
              formattedAnswer = selectedOptions.join(', ');
            } else if (typeof answer === 'object' && 'answers' in answer) {
              const selectedOptions = question.options
                .filter(opt => answer.answers.includes(opt.id))
                .map(opt => opt.text);
              formattedAnswer = selectedOptions.join(', ');
              if (answer.otherText) {
                formattedAnswer += ` (Other: ${answer.otherText})`;
              }
            }
          } else if (question.type === 'text') {
            formattedAnswer = answer as string;
          }

          return {
            question: question.text,
            answer: formattedAnswer
          };
        })
        .filter(Boolean); // Remove any null entries

      // Send assessment results to AI for personalized response
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('chat-with-counselor', {
        body: { 
          prompt: `Please analyze these assessment results and provide personalized career guidance:
          Assessment Type: ${selectedTier}
          User's Answers:
          ${JSON.stringify(formattedAnswers, null, 2)}
          Please provide a detailed analysis and recommendations in markdown format.`,
          context: []
        }
      });

      if (aiError) {
        console.error('AI Analysis Error:', aiError);
        throw new Error("Failed to get AI analysis");
      }

      if (!aiResponse?.message) {
        throw new Error("No response from AI");
      }

      try {
        // Try to store the assessment results in Supabase
        const { error: saveError } = await supabase
          .from('assessment_results')
          .insert({
            user_id: session.user.id,
            assessment_type: selectedTier,
            results: formattedAnswers,
            ai_analysis: aiResponse.message,
            created_at: new Date().toISOString()
          });

        if (saveError) {
          console.warn('Failed to save to database:', saveError);
          // Continue execution even if save fails
        }
      } catch (dbError) {
        console.warn('Database error:', dbError);
        // Continue execution even if database operation fails
      }

      // Store the AI response in localStorage to be picked up by the chat interface
      localStorage.setItem('assessmentResults', JSON.stringify({
        message: aiResponse.message,
        timestamp: new Date().toISOString()
      }));

      // Navigate to the chat section
      const chatSection = document.getElementById('chat');
      if (chatSection) {
        chatSection.scrollIntoView({ behavior: 'smooth' });
      }

      // Show success message
      toast({
        title: "Results Ready",
        description: "Your assessment results have been analyzed and shared in the chat.",
      });
    } catch (error) {
      console.error('Error processing results:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process your results. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
          
          <form ref={formRef}>
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
          </form>

          {isCompleted && assessmentResults && (
            <div className="mt-6 flex justify-center">
              <Button 
                onClick={handleViewResults}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Analyzing...' : 'View Results in Chat'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CareerAssessment;
