
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Send, Bot, Trash, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  role: 'user' | 'bot';
  content: string;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: "Hello! I'm your AI career counselor. How can I assist you with your career planning today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkForResults = () => {
      const storedResults = localStorage.getItem('assessmentResults');
      if (storedResults) {
        try {
          const parsedResults = JSON.parse(storedResults);
          if (parsedResults && parsedResults.message) {
            setMessages(prev => [...prev, { 
              role: 'bot' as const, 
              content: parsedResults.message 
            }]);
            localStorage.removeItem('assessmentResults');
          }
        } catch (error) {
          console.error('Error parsing assessment results:', error);
        }
      }
    };

    checkForResults();

    const interval = setInterval(checkForResults, 1000); // Check every second

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkExternalInput = () => {
      if (inputRef.current && inputRef.current.value && inputRef.current.value !== input) {
        setInput(inputRef.current.value);
      }
    };
    
    checkExternalInput();
    const intervalId = setInterval(checkExternalInput, 1000);
    
    return () => clearInterval(intervalId);
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-counselor', {
        body: { 
          prompt: userMessage,
          context: messages.slice(-4).map(m => ({ role: m.role === 'user' ? 'user' : 'model', content: m.content }))
        }
      });

      if (error) throw error;

      const aiMessage: Message = { 
        role: 'bot' as const,  
        content: data.message || "I'm sorry, I couldn't generate a response at this time. Please try again." 
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setConnectionError(false);
      setRetryCount(0);
    } catch (error) {
      console.error('Error getting response:', error);
      setConnectionError(true);
      setRetryCount(prev => prev + 1);
      toast({
        title: "Error",
        description: "Failed to get response from AI. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'bot', content: "Hello! I'm your AI career counselor. How can I assist you with your career planning today?" }]);
    setConnectionError(false);
    setRetryCount(0);
  };

  const getConnectionStatus = () => {
    if (connectionError) {
      if (retryCount > 2) {
        return (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 flex items-center justify-between">
            <span>Connection issues persist. Try again later.</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs bg-red-50 hover:bg-red-100"
              onClick={clearChat}
            >
              Reset Chat
            </Button>
          </div>
        );
      }
      return (
        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-700">
          Currently in offline mode. Some features may be limited.
        </div>
      );
    }
    return null;
  };

  return (
    <div className="py-4 md:py-12 bg-white" id="chat">
      <div className={`container ${isMobile ? 'px-2' : 'px-4 md:px-6'}`}>
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-4 md:mb-8">
            <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold tracking-tight mb-2`}>Chat with AI Career Counselor</h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Ask questions about careers, entrance exams, or educational paths
            </p>
            {getConnectionStatus()}
          </div>
          
          <Card className="border-2 shadow-md">
            <CardHeader className="border-b bg-muted/50 p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-base lg:text-lg">AI Counselor</CardTitle>
                </div>
                <div className="flex gap-1 md:gap-2">
                  {/* Save and History buttons removed */}
                  <Button variant="ghost" size={isMobile ? "sm" : "icon"} onClick={clearChat}>
                    <Trash className="h-4 w-4" />
                    {isMobile && <span className="sr-only">Clear</span>}
                  </Button>
                </div>
              </div>
              <CardDescription className="text-xs md:text-sm">
                Get personalized career advice and guidance
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div 
                ref={chatContainerRef}
                className={`${isMobile ? 'h-[350px]' : 'h-[400px]'} overflow-y-auto p-3 md:p-4 flex flex-col gap-3 md:gap-4`}
              >
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-2 md:mb-4`}
                  >
                    <div 
                      className={`max-w-[85%] rounded-lg p-3 ${
                        message.role === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {message.role === 'bot' ? (
                        <ReactMarkdown className="prose prose-sm max-w-none break-words">
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <p className="break-words">{message.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
                {isLoading && (
                  <div 
                    className="chat-bubble chat-bubble-ai bg-blue-50 border border-blue-100 rounded-lg p-3"
                    style={{ maxWidth: '85%' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-medium">AI Counselor</span>
                    </div>
                    <div className="typing-indicator flex space-x-1">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{animationDelay: '0s'}}></span>
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{animationDelay: '0.2s'}}></span>
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{animationDelay: '0.4s'}}></span>
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t p-3 md:p-4">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                  <Input
                    ref={inputRef}
                    placeholder={isMobile ? "Ask a question..." : "Ask about career options, exams, or educational paths..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size={isMobile ? "sm" : "icon"} disabled={input.trim() === "" || isLoading}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-4 text-xs md:text-sm text-center text-muted-foreground">
            <p>Example questions: "What career paths suit someone interested in biology?" or "How should I prepare for engineering entrance exams?"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
