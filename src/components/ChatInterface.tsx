
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Send, Bot, Trash, Sparkles, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { id: 1, content: "Hello! I'm your AI career counselor. How can I assist you with your career planning today? You can ask me about your assessment results or any career-related questions.", sender: "ai" }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Effect to check if input value has been set externally (from assessment results)
  useEffect(() => {
    const checkExternalInput = () => {
      if (inputRef.current && inputRef.current.value && inputRef.current.value !== inputMessage) {
        setInputMessage(inputRef.current.value);
      }
    };
    
    // Check immediately and then periodically
    checkExternalInput();
    const intervalId = setInterval(checkExternalInput, 1000);
    
    return () => clearInterval(intervalId);
  }, [inputMessage]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() === "") return;

    // Add user message
    const userMessage = { id: messages.length + 1, content: inputMessage, sender: "user" };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setConnectionError(false);

    try {
      // Special handling for assessment result sharing
      if (inputMessage.includes("Based on my assessment") || inputMessage.includes("My assessment suggests")) {
        // Let the AI know that the user is sharing assessment results
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate server delay
        
        const aiResponse = `Thank you for sharing your assessment results! I'd be happy to discuss them further.
        
What specific aspects of ${inputMessage.includes("stream is") ? "your recommended stream" : "these career options"} would you like to know more about? For example, I can provide information about:
- Career prospects and job roles
- Skills required for success
- Educational pathways
- Industry trends
- Day-to-day responsibilities`;
        
        const aiMessage = { 
          id: messages.length + 2, 
          content: aiResponse, 
          sender: "ai" 
        };
        
        setMessages(prevMessages => [...prevMessages, aiMessage]);
        setIsLoading(false);
        return;
      }
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('chat-with-counselor', {
        body: { 
          prompt: inputMessage,
          context: messages.slice(-6).map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.content }))
        }
      });
      
      if (error) {
        console.error("Error calling AI service:", error);
        throw new Error(error.message);
      }
      
      // Use the response from the function
      const aiMessage = { 
        id: messages.length + 2, 
        content: data.message || "I'm sorry, I couldn't generate a response at this time. Please try again.", 
        sender: "ai" 
      };
      
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setConnectionError(true);
      
      toast({
        title: "Connection issue",
        description: "Using offline mode. Your experience may be limited.",
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

  const saveConversation = async () => {
    if (messages.length <= 1) {
      toast({
        title: "Nothing to save",
        description: "Please have a conversation before saving.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      // Get current user session
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      if (!userId) {
        throw new Error("You must be logged in to save conversations.");
      }

      const { error } = await supabase
        .from('chat_logs')
        .insert({
          user_id: userId,
          messages: messages.map(m => ({
            content: m.content,
            sender: m.sender
          }))
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Conversation saved",
        description: "Your conversation has been saved for future reference.",
      });
    } catch (error) {
      console.error("Error saving conversation:", error);
      toast({
        title: "Save failed",
        description: "There was a problem saving your conversation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const clearChat = () => {
    setMessages([{ id: 1, content: "Hello! I'm your AI career counselor. How can I assist you with your career planning today? You can ask me about your assessment results or any career-related questions.", sender: "ai" }]);
    setConnectionError(false);
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
            {connectionError && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-700">
                Currently in offline mode. Some features may be limited.
              </div>
            )}
          </div>
          
          <Card className="border-2 shadow-md">
            <CardHeader className="border-b bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">AI Counselor</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={saveConversation} disabled={isSaving || messages.length <= 1}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={clearChat}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
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
                    ref={inputRef}
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
