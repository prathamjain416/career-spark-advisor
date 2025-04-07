
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Send, Bot, Trash, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
      // In a real implementation, you would make an API call to OpenAI here
      // For now, simulate a response after a delay
      setTimeout(() => {
        const aiResponses = [
          "Based on your interests, you might want to explore careers in technology, particularly software development or data science.",
          "Have you considered taking aptitude tests to better understand your strengths? I can guide you through some assessments.",
          "For someone interested in healthcare, there are many paths besides medicine - like healthcare administration, public health, or medical research.",
          "Engineering offers diverse specializations. Would you like to know more about computer, mechanical, or civil engineering?",
          "Creative fields like design or digital marketing combine technical skills with creativity. These fields are growing rapidly.",
          "If you're interested in the Science stream, focus on building a strong foundation in mathematics and physics. These subjects are crucial for many technical careers.",
          "Commerce with mathematics opens up opportunities in finance, accounting, business analytics, and economics. Have you considered any of these fields?",
          "For humanities students, developing strong communication and critical thinking skills is valuable for careers in law, journalism, psychology, and social work.",
          "When preparing for entrance exams like JEE or NEET, consistent daily practice and regular mock tests are essential strategies for success."
        ];
        
        // Check for keywords to provide more relevant responses
        let response = "";
        const query = inputMessage.toLowerCase();
        
        if (query.includes("engineering") || query.includes("jee")) {
          response = "For engineering aspirants, JEE preparation requires strong fundamentals in Physics, Chemistry, and Mathematics. Focus on NCERT books first, then move to advanced reference materials. Would you like specific advice about a particular engineering field?";
        } else if (query.includes("medical") || query.includes("neet") || query.includes("doctor")) {
          response = "For a medical career, NEET preparation should focus on Biology, Physics, and Chemistry. Medical careers require dedication and many years of education, but offer rewarding opportunities to help others. Beyond being a doctor, you could explore research, public health, or specialized areas like radiology.";
        } else if (query.includes("commerce") || query.includes("business") || query.includes("finance")) {
          response = "Commerce offers diverse career paths in banking, finance, marketing, and entrepreneurship. If you enjoy mathematics, consider careers in chartered accountancy, financial analysis, or actuarial science. If you prefer people-oriented roles, marketing, HR, or business management might suit you better.";
        } else if (query.includes("arts") || query.includes("humanities")) {
          response = "Humanities graduates have versatile career options in fields like law, journalism, teaching, psychology, foreign services, and content creation. These careers value critical thinking, communication skills, and creativity. Many successful professionals in leadership roles come from humanities backgrounds.";
        } else if (query.includes("computer") || query.includes("software") || query.includes("programming")) {
          response = "Computer Science and IT careers are in high demand. Beyond coding, you could explore cybersecurity, AI/ML, data science, or UI/UX design. For these fields, building projects and practical skills alongside your degree will give you a competitive edge.";
        } else {
          response = aiResponses[Math.floor(Math.random() * aiResponses.length)];
        }
        
        const aiMessage = { id: messages.length + 2, content: response, sender: "ai" };
        setMessages(prevMessages => [...prevMessages, aiMessage]);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again later.",
        variant: "destructive"
      });
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
