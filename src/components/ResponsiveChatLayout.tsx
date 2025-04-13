
import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare, X } from "lucide-react";
import { useIsMobile, useViewportSize } from "@/hooks/use-mobile";
import ChatInterface from './ChatInterface';

interface ResponsiveChatLayoutProps {
  showChat: boolean;
  setShowChat: (show: boolean) => void;
}

const ResponsiveChatLayout: React.FC<ResponsiveChatLayoutProps> = ({
  showChat,
  setShowChat
}) => {
  const isMobile = useIsMobile();
  const { width } = useViewportSize();
  
  // This component handles different layouts based on screen size
  if (isMobile) {
    return (
      <>
        {showChat ? (
          <div className="fixed inset-0 z-50 bg-white flex flex-col animate-fade-in">
            <div className="sticky top-0 p-3 flex items-center justify-between bg-white shadow-sm z-10">
              <h2 className="text-lg font-semibold">AI Career Counselor</h2>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowChat(false)}
                className="rounded-full"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
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
              aria-label="Open chat"
            >
              <MessageSquare className="h-6 w-6" />
            </Button>
          </div>
        )}
      </>
    );
  }
  
  // Tablets and small screens - more compact layout
  if (width < 1024) {
    return (
      <div className="px-2 md:px-4 py-4 md:py-6">
        <ChatInterface />
      </div>
    );
  }
  
  // Desktop - full layout
  return (
    <div className="container py-6 md:py-8">
      <ChatInterface />
    </div>
  );
};

export default ResponsiveChatLayout;
