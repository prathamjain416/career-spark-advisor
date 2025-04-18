import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
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
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchSavedChats();
  }, []);

  const fetchSavedChats = async () => {
    try {
      setIsLoading(true);
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw sessionError;
      }
      
      const userId = sessionData?.session?.user?.id;
      
      if (!userId) {
        console.log("No user ID found in session");
        setIsLoading(false);
        setSavedChats([]);
        toast({
          title: "Not logged in",
          description: "Please log in to view your saved conversations.",
          variant: "destructive"
        });
        return;
      }

      console.log("Fetching saved chats for user:", userId);
      
      const { data, error } = await supabase
        .from('chat_logs')
        .select('id, created_at, messages')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Database query error:", error);
        throw error;
      }

      console.log("Raw data from DB:", data);

      if (!data || !Array.isArray(data)) {
        console.error("Unexpected data format:", data);
        throw new Error("Unexpected data format returned from database");
      }

      const processedChats = data.map((chat) => {
        let messages = [];
        
        try {
          if (typeof chat.messages === 'string') {
            messages = JSON.parse(chat.messages);
          } else if (Array.isArray(chat.messages)) {
            messages = chat.messages;
          } else if (chat.messages && typeof chat.messages === 'object') {
            const possibleArrays = Object.values(chat.messages).filter(Array.isArray);
            messages = possibleArrays.length > 0 ? possibleArrays[0] : [];
          }
        } catch (e) {
          console.error("Error processing chat messages for ID " + chat.id + ":", e);
          messages = [];
        }

        const validMessages = Array.isArray(messages) 
          ? messages.filter(msg => 
              msg && typeof msg === 'object' && 
              'content' in msg && 'sender' in msg
            )
          : [];
        
        return {
          id: chat.id,
          created_at: chat.created_at,
          messages: validMessages
        };
      });

      console.log("Processed chats:", processedChats);
      setSavedChats(processedChats);
    } catch (error) {
      console.error("Error fetching saved chats:", error);
      toast({
        title: "Error",
        description: "Failed to load your saved conversations. Please try again later.",
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
    const lastBotMessage = [...messages].reverse().find(m => m.sender === 'model');
    if (lastBotMessage) {
      return lastBotMessage.content.substring(0, 60) + (lastBotMessage.content.length > 60 ? '...' : '');
    }
    return "No preview available";
  };

  const handleLoadChat = (chat: SavedChat) => {
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
        console.error("Error deleting chat:", error);
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
    <div className={`space-y-4 ${isMobile ? 'pb-16' : ''}`}>
      <Accordion type="single" collapsible className="w-full">
        {savedChats.map((chat) => (
          <AccordionItem key={chat.id} value={chat.id} className="border rounded-md mb-2">
            <AccordionTrigger className="hover:no-underline px-4">
              <div className="flex items-start justify-between w-full pr-4">
                <div className="text-left">
                  <div className="font-medium text-sm">{getPreviewText(chat.messages)}</div>
                  <div className="text-xs text-muted-foreground flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(chat.created_at)}
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-4">
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
                
                <div className="flex flex-wrap gap-2 justify-between pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleLoadChat(chat)}
                    className="flex-1 min-w-[120px]"
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
