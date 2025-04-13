import React from 'react';
import { Button } from "@/components/ui/button";
import { BookOpen, Compass, BarChart, User, LogOut } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Compass className="h-6 w-6 text-blue-600" />
          <Link to="/" className="text-xl font-bold">CareerSpark</Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#assessment" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Assessment
          </a>
          <a href="#chat" className="text-sm font-medium hover:text-blue-600 transition-colors">
            AI Counselor
          </a>
        </nav>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {user.user_metadata?.name || 'User'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-red-500 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2" asChild>
                <Link to="/auth">
                  <User className="h-4 w-4" />
                  Sign In
                </Link>
              </Button>
              <Button size="sm" className="hidden md:flex" asChild>
                <Link to="/auth?tab=signup">Get Started</Link>
              </Button>
            </>
          )}
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
