
import React from 'react';
import { Button } from "@/components/ui/button";
import { BookOpen, Compass, BarChart, User } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Compass className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold">CareerSpark</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#assessment" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Assessment
          </a>
          <a href="#chat" className="text-sm font-medium hover:text-blue-600 transition-colors">
            AI Counselor
          </a>
          <a href="#careers" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Explore Careers
          </a>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2">
            <User className="h-4 w-4" />
            Sign In
          </Button>
          <Button size="sm" className="hidden md:flex">Get Started</Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
