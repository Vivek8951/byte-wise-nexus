
import React, { createContext, useContext, useState } from 'react';
import { ChatMessage } from '../types';
import { useToast } from "@/components/ui/use-toast";

interface ChatbotContextType {
  messages: ChatMessage[];
  sendMessage: (content: string) => void;
  isLoading: boolean;
  isOpen: boolean;
  toggleChatbot: () => void;
  clearChat: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export function ChatbotProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI learning assistant. How can I help you with your computer science studies today?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const toggleChatbot = () => {
    setIsOpen(prev => !prev);
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Chat history has been cleared. How can I help you now?',
        timestamp: new Date().toISOString(),
      },
    ]);
    toast({
      title: "Chat cleared",
      description: "Your chat history has been cleared",
    });
  };

  const sendMessage = async (content: string) => {
    if (content.trim() === '') return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Simulate API call delay (in a real app, this would call OpenAI API)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a mock response
    let responseText = '';
    let imageUrl;
    
    if (content.toLowerCase().includes('diagram') || 
        content.toLowerCase().includes('graph') || 
        content.toLowerCase().includes('picture') ||
        content.toLowerCase().includes('image')) {
      responseText = "I've generated an image based on your request. In a real implementation, this would be created using the OpenAI Image Generation API.";
      imageUrl = '/placeholder.svg';
    } else if (content.toLowerCase().includes('algorithm')) {
      responseText = "Algorithms are step-by-step procedures for solving problems. Common algorithms include sorting algorithms like Quick Sort and Merge Sort, search algorithms like Binary Search, and graph algorithms like Dijkstra's algorithm for finding shortest paths.";
    } else if (content.toLowerCase().includes('database')) {
      responseText = "Databases store and organize data. The two main types are SQL (relational) databases like MySQL and PostgreSQL, and NoSQL databases like MongoDB and Redis. Each type has specific use cases and advantages.";
    } else {
      responseText = "That's an interesting question about computer science. To give you a more specific answer, could you provide more details or clarify what aspect you're interested in?";
    }
    
    const botMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responseText,
      timestamp: new Date().toISOString(),
      imageUrl,
    };
    
    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  return (
    <ChatbotContext.Provider value={{ messages, sendMessage, isLoading, isOpen, toggleChatbot, clearChat }}>
      {children}
    </ChatbotContext.Provider>
  );
}

export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
}
