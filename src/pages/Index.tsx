
import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CareerAssessment from '@/components/CareerAssessment';
import ChatInterface from '@/components/ChatInterface';
import CareerSuggestions from '@/components/CareerSuggestions';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <CareerAssessment />
        <ChatInterface />
        <CareerSuggestions />
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
