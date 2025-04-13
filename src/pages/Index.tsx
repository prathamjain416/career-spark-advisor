
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CareerAssessment from '@/components/CareerAssessment';
import ResponsiveChatLayout from '@/components/ResponsiveChatLayout';

const Index = () => {
  const [showChat, setShowChat] = useState(false);

  // Load chat visibility state from localStorage when component mounts
  useEffect(() => {
    const savedState = localStorage.getItem('showChat');
    if (savedState) {
      // Only set to true if explicitly true, otherwise default to false
      setShowChat(savedState === 'true');
    } else {
      // If no saved state, default to false
      setShowChat(false);
      // Initialize localStorage with false
      localStorage.setItem('showChat', 'false');
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
        <ResponsiveChatLayout showChat={showChat} setShowChat={setShowChat} />
      </main>
      <footer className="py-4 md:py-6 bg-blue-50 border-t">
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
