
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
  apiKey: string;
  setApiKey: (key: string) => void;
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
  const [apiKey, setApiKey] = useState<string>(() => {
    // Try to load from localStorage if available
    return localStorage.getItem('openai_api_key') || '';
  });
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
    
    try {
      if (!apiKey) {
        throw new Error('Please set your OpenAI API key in the settings');
      }
      
      // Determine if request is for text or image generation
      const isImageRequest = content.toLowerCase().includes('diagram') || 
                            content.toLowerCase().includes('graph') || 
                            content.toLowerCase().includes('picture') ||
                            content.toLowerCase().includes('image');
      
      if (isImageRequest) {
        // Image generation with OpenAI API
        const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: content,
            n: 1,
            size: "1024x1024",
          })
        });
        
        if (!imageResponse.ok) {
          throw new Error('Failed to generate image. Please check your API key and try again.');
        }
        
        const imageData = await imageResponse.json();
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I've generated this image based on your request:",
          timestamp: new Date().toISOString(),
          imageUrl: imageData.data[0].url,
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Text completion with OpenAI API
        const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are an AI learning assistant for a computer science e-learning platform. Provide helpful, accurate, and concise answers about computer science topics. Include code examples when relevant."
              },
              ...messages.map(msg => ({
                role: msg.role,
                content: msg.content
              })),
              { role: "user", content }
            ],
            max_tokens: 500
          })
        });
        
        if (!chatResponse.ok) {
          throw new Error('Failed to get response. Please check your API key and try again.');
        }
        
        const chatData = await chatResponse.json();
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: chatData.choices[0].message.content,
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      // Handle errors
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${errorMessage}`,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      toast({
        title: "AI Assistant Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatbotContext.Provider value={{ 
      messages, 
      sendMessage, 
      isLoading, 
      isOpen, 
      toggleChatbot, 
      clearChat,
      apiKey,
      setApiKey
    }}>
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
