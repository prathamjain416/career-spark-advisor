
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Send, Bot, Trash, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { id: 1, content: "Hello! I'm your AI career counselor. How can I assist you with your career planning today?", sender: "ai" }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() === "") return;

    // Add user message
    const userMessage = { id: messages.length + 1, content: inputMessage, sender: "user" };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-assessment', {
        body: { 
          assessmentType: 'chat', 
          prompt: inputMessage,
          context: messages.slice(-6).map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.content }))
        }
      });
      
      if (error) {
        console.error("Error calling AI service:", error);
        throw new Error(error.message);
      }
      
      // Use the response from OpenAI
      const aiMessage = { 
        id: messages.length + 2, 
        content: data.message || "I'm sorry, I couldn't generate a response at this time. Please try again.", 
        sender: "ai" 
      };
      
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again later.",
        variant: "destructive"
      });
      
      // Fallback to predetermined responses
      const aiResponses = [
        "Based on your interests, you might want to explore careers in technology, particularly software development or data science.",
        "Have you considered taking aptitude tests to better understand your strengths? I can guide you through some assessments.",
        "For someone interested in healthcare, there are many paths besides medicine - like healthcare administration, public health, or medical research.",
        "Engineering offers diverse specializations. Would you like to know more about computer, mechanical, or civil engineering?"
      ];
      
      const aiMessage = { 
        id: messages.length + 2, 
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)], 
        sender: "ai" 
      };
      
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ id: 1, content: "Hello! I'm your AI career counselor. How can I assist you with your career planning today?", sender: "ai" }]);
  };

  return (
    <section id="chat" className="py-12 bg-white">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Chat with AI Career Counselor</h2>
            <p className="text-muted-foreground">
              Ask questions about careers, entrance exams, or educational paths
            </p>
          </div>
          
          <Card className="border-2 shadow-md">
            <CardHeader className="border-b bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">AI Counselor</CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={clearChat}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Get personalized career advice and guidance
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div 
                ref={chatContainerRef}
                className="h-[400px] overflow-y-auto p-4 flex flex-col gap-4"
              >
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`chat-bubble ${message.sender === 'ai' ? 'chat-bubble-ai' : 'chat-bubble-user'} ${
                      message.sender === 'ai' 
                        ? 'bg-blue-50 border border-blue-100 rounded-lg p-3' 
                        : 'bg-gray-100 border border-gray-200 rounded-lg p-3 ml-auto'
                    }`}
                    style={{ 
                      maxWidth: '85%',
                      marginLeft: message.sender === 'user' ? 'auto' : '0'
                    }}
                  >
                    {message.sender === 'ai' && (
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-medium">AI Counselor</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                ))}
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
              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <Input
                    placeholder="Ask about career options, exams, or educational paths..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={inputMessage.trim() === "" || isLoading}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-4 text-sm text-center text-muted-foreground">
            <p>Example questions: "What career paths suit someone interested in biology?" or "How should I prepare for engineering entrance exams?"</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatInterface;
