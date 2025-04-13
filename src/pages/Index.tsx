
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CareerAssessment from '@/components/CareerAssessment';
import ChatInterface from '@/components/ChatInterface';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [showChat, setShowChat] = useState(false);
  const isMobile = useIsMobile();

  // Save chat visibility state to localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('showChat');
    if (savedState) {
      setShowChat(savedState === 'true');
    }
  }, []);

  // Update localStorage when state changes
  useEffect(() => {
    localStorage.setItem('showChat', showChat.toString());
  }, [showChat]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <CareerAssessment />
        
        {isMobile ? (
          <>
            {showChat ? (
              <div className="fixed inset-0 z-50 bg-white flex flex-col">
                <div className="p-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowChat(false)}
                    className="mb-2"
                  >
                    Back to Main Page
                  </Button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <ChatInterface />
                </div>
              </div>
            ) : (
              <div className="fixed bottom-4 right-4 z-50">
                <Button 
                  size="lg" 
                  className="rounded-full h-14 w-14 shadow-lg flex items-center justify-center"
                  onClick={() => setShowChat(true)}
                >
                  <MessageSquare className="h-6 w-6" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <ChatInterface />
        )}
      </main>
      <footer className="py-6 bg-blue-50 border-t">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} CareerSpark. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Helping students find their perfect career path
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
