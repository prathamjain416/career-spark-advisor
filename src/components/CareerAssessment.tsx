import React, { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState('questionnaire');
  const { toast } = useToast();

  const tierQuestions = questions.filter(q => q.tier === selectedTier);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  useEffect(() => {
    if (assessmentResults) {
      setActiveTab('results');
    }
  }, [assessmentResults]);

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
    toast({
      title: "Generating results",
      description: "Please wait while we analyze your responses...",
    });
    
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
      
      const tierAnswers = formattedAnswers.filter(a => {
        const question = questions.find(q => q.text === a.question);
        return question?.tier === selectedTier;
      });
      
      if (tierAnswers.length === 0) {
        toast({
          title: "No answers found",
          description: "Please complete the assessment before generating results.",
          variant: "destructive"
        });
        setIsGeneratingResults(false);
        return;
      }
      
      console.log('Calling generateAssessmentResults with:', selectedTier, tierAnswers);
      
      const results = await generateAssessmentResults(selectedTier, tierAnswers);
      console.log('Results received:', results);
      
      if (!results) {
        throw new Error("No results received from assessment service");
      }
      
      setAssessmentResults(results);
      
      setActiveTab('results');
      
      toast({
        title: "Assessment completed!",
        description: "Your personalized results are ready to view.",
      });
    } catch (error) {
      console.error('Error generating results:', error);
      toast({
        title: "Error generating results",
        description: "Using fallback data. You can still view your results.",
        variant: "destructive"
      });
      
      if (selectedTier === 'class10') {
        setAssessmentResults({
          recommendedStream: 'Arts/Humanities',
          alternateStream: 'Commerce',
          coreSubjects: 'History, Political Science, Sociology, English',
          optionalSubjects: 'Psychology or Economics',
          boardRecommendations: [
            'CBSE - Well-rounded curriculum with focus on conceptual understanding',
            'ICSE - Strong focus on English and humanities subjects',
            'State Board - If you plan to apply for state colleges with arts specialization'
          ]
        });
      } else {
        setAssessmentResults({
          recommendedDegrees: [
            { name: 'B.A. in Psychology', description: 'Understand human behavior and mental processes' },
            { name: 'B.A. in Mass Communication', description: 'Learn media production and journalism skills' },
            { name: 'B.A. in Economics', description: 'Study market trends and economic theories' }
          ],
          careerPaths: [
            { name: 'Counseling Psychology', description: 'Help people overcome personal challenges' },
            { name: 'Content Creation', description: 'Create engaging content for digital platforms' },
            { name: 'Social Work', description: 'Support communities and individuals in need' }
          ],
          entranceExams: 'CUET, IPUCET, Symbiosis SET',
          preparationTips: [
            'Focus on building a strong portfolio of your work',
            'Develop communication and interpersonal skills',
            'Read widely to build your knowledge base',
            'Participate in relevant volunteer work or internships'
          ]
        });
      }
      
      setActiveTab('results');
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
    setActiveTab('questionnaire');
  };

  const handleReviewAssessment = () => {
    setActiveTab('questionnaire');
  };

  const handleShareToChat = () => {
    try {
      const chatSection = document.getElementById('chat');
      if (chatSection) {
        toast({
          title: "Assessment results shared",
          description: "Your results have been shared with the AI Counselor chat.",
        });
        
        chatSection.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error("Error sharing to chat:", error);
    }
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
          
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="questionnaire" data-value="questionnaire">Assessment</TabsTrigger>
              <TabsTrigger 
                value="results" 
                data-value="results" 
                disabled={!isCompleted && !assessmentResults}
              >
                Results
              </TabsTrigger>
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
