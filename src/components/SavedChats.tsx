
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { Clock, Trash, MessageSquare } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SavedChat {
  id: string;
  created_at: string;
  messages: { content: string; sender: 'user' | 'model' }[];
}

interface SavedChatsProps {
  onLoadChat: (messages: any[]) => void;
}

const SavedChats: React.FC<SavedChatsProps> = ({ onLoadChat }) => {
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSavedChats();
  }, []);

  const fetchSavedChats = async () => {
    try {
      setIsLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      if (!userId) {
        throw new Error("You must be logged in to view saved conversations.");
      }

      const { data, error } = await supabase
        .from('chat_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setSavedChats(data || []);
    } catch (error) {
      console.error("Error fetching saved chats:", error);
      toast({
        title: "Error",
        description: "Failed to load your saved conversations.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  const getPreviewText = (messages: { content: string; sender: string }[]) => {
    // Find the last bot message to show as preview
    const lastBotMessage = [...messages].reverse().find(m => m.sender === 'model');
    if (lastBotMessage) {
      // Return a truncated version of the message
      return lastBotMessage.content.substring(0, 60) + (lastBotMessage.content.length > 60 ? '...' : '');
    }
    return "No preview available";
  };

  const handleLoadChat = (chat: SavedChat) => {
    // Transform the messages to match the format expected by ChatInterface
    const formattedMessages = chat.messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'bot',
      content: msg.content
    }));
    
    onLoadChat(formattedMessages);
    
    toast({
      title: "Chat loaded",
      description: "The saved conversation has been loaded into the chat.",
    });
  };

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('chat_logs')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setSavedChats(prev => prev.filter(chat => chat.id !== id));
      
      toast({
        title: "Chat deleted",
        description: "The conversation has been removed from your saved chats.",
      });
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast({
        title: "Delete failed",
        description: "There was a problem deleting your conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse h-4 w-3/4 bg-gray-200 rounded mb-2 mx-auto"></div>
        <div className="animate-pulse h-4 w-1/2 bg-gray-200 rounded mb-2 mx-auto"></div>
        <div className="animate-pulse h-4 w-2/3 bg-gray-200 rounded mx-auto"></div>
      </div>
    );
  }

  if (savedChats.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>You don't have any saved conversations yet.</p>
        <p className="text-sm">When you save a chat, it will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full">
        {savedChats.map((chat) => (
          <AccordionItem key={chat.id} value={chat.id}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-start justify-between w-full pr-4">
                <div className="text-left">
                  <div className="font-medium">{getPreviewText(chat.messages)}</div>
                  <div className="text-xs text-muted-foreground flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(chat.created_at)}
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                {chat.messages.slice(0, 3).map((message, idx) => (
                  <div key={idx} className={`p-3 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-blue-50 border border-blue-100' 
                      : 'bg-gray-50 border border-gray-100'
                  }`}>
                    <div className="text-xs font-medium mb-1">
                      {message.sender === 'user' ? 'You' : 'AI Counselor'}
                    </div>
                    {message.sender === 'model' ? (
                      <ReactMarkdown className="prose prose-sm max-w-none">
                        {message.content.substring(0, 150) + (message.content.length > 150 ? '...' : '')}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-sm">{message.content.substring(0, 150) + (message.content.length > 150 ? '...' : '')}</p>
                    )}
                  </div>
                ))}
                
                {chat.messages.length > 3 && (
                  <p className="text-sm text-muted-foreground text-center">
                    + {chat.messages.length - 3} more messages
                  </p>
                )}
                
                <div className="flex justify-between pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleLoadChat(chat)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Load Conversation
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default SavedChats;
