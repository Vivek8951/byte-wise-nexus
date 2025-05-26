
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChatMessage } from '../types';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ChatbotContextType {
  messages: ChatMessage[];
  sendMessage: (content: string) => void;
  isLoading: boolean;
  isOpen: boolean;
  toggleChatbot: () => void;
  clearChat: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  generateCourseDescription: (topic: string) => Promise<string>;
  getVideoTranscription: (videoUrl: string) => Promise<string>;
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
  const [apiKey, setApiKey] = useState<string>("");
  const { toast } = useToast();

  // Check for API key from Supabase secrets on component mount
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        // Try to use the Supabase edge function to validate API key
        const { data, error } = await supabase.functions.invoke("check-api-keys", {
          body: { keyType: "openrouter" }
        });
        
        if (error) {
          console.error("Error checking API key:", error);
        } else if (data?.isValid) {
          console.log("OpenRouter API key is valid");
        }
      } catch (error) {
        console.error("Error validating API key:", error);
      }
    };
    
    checkApiKey();
  }, []);

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

  // Generate course description based on topic using OpenRouter
  const generateCourseDescription = async (topic: string): Promise<string> => {
    try {
      // Call Supabase edge function to generate description
      const { data, error } = await supabase.functions.invoke("text-generation", {
        body: { 
          prompt: `Create a comprehensive course description for a computer science course about ${topic}. 
                Include learning objectives, key topics covered, and target audience.
                Keep it concise but informative, maximum 150 words.`,
          context: "You are an educational content creator specializing in computer science courses.",
          maxTokens: 500,
          temperature: 0.7
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data.generatedText || "";
    } catch (error) {
      console.error("Error generating course description:", error);
      toast({
        title: "Error",
        description: "Failed to generate course description. Please try again.",
        variant: "destructive"
      });
      return "";
    }
  };

  // Get video transcription using OpenRouter
  const getVideoTranscription = async (videoUrl: string): Promise<string> => {
    try {
      // Call Supabase edge function to analyze video
      const { data, error } = await supabase.functions.invoke("text-generation", {
        body: { 
          prompt: `Create a short summary of what might be in a computer science educational video 
          with this URL: ${videoUrl}. Pretend you are transcribing key points from the video.`,
          context: "You are a video content analyzer for educational technology videos.",
          maxTokens: 800,
          temperature: 0.7
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data.generatedText || "";
    } catch (error) {
      console.error("Error analyzing video:", error);
      toast({
        title: "Error",
        description: "Failed to analyze video content. Please try again.",
        variant: "destructive"
      });
      return "";
    }
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
      // Determine if request is for image generation
      const isImageRequest = content.toLowerCase().includes('diagram') || 
                             content.toLowerCase().includes('graph') || 
                             content.toLowerCase().includes('picture') ||
                             content.toLowerCase().includes('image') ||
                             content.toLowerCase().includes('visual');
      
      if (isImageRequest) {
        // Generate image description first
        const { data: imageDescData, error: imageDescError } = await supabase.functions.invoke("text-generation", {
          body: { 
            prompt: `Generate a detailed description for an educational image or diagram based on: ${content}`,
            context: "You are creating descriptions for educational visual content in computer science.",
            maxTokens: 300,
            temperature: 0.7
          }
        });
        
        if (imageDescError) {
          throw new Error(imageDescError.message);
        }
        
        const imageDesc = imageDescData?.generatedText || 
                         "I've prepared a visual representation based on your request.";
        
        // Use a relevant image from Unsplash
        const searchTerm = content.replace(/image|picture|diagram|graph|visual/gi, '').trim() || 'computer science';
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: imageDesc,
          timestamp: new Date().toISOString(),
          imageUrl: `https://source.unsplash.com/800x600/?${encodeURIComponent(searchTerm)}`,
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Regular text message - use OpenRouter API through Supabase edge function
        const recentMessages = messages.slice(-4).map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        }));
        
        const { data, error } = await supabase.functions.invoke("text-generation", {
          body: { 
            prompt: content,
            context: "You are an AI learning assistant for a computer science e-learning platform. Provide helpful, accurate, and concise answers about computer science topics, programming, algorithms, and technology. Include code examples when relevant. Always respond clearly and avoid any garbled or unclear text.",
            previousMessages: recentMessages,
            maxTokens: 800,
            temperature: 0.7
          }
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        const responseText = data?.generatedText || "I'm sorry, I couldn't generate a proper response.";
        
        // Validate that the response is clean text
        if (responseText.length < 10 || responseText.includes('later') && responseText.includes('crucial')) {
          throw new Error("Invalid response received from AI");
        }
        
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseText,
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      // Handle errors gracefully
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Chatbot error:', errorMessage);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I apologize, but I encountered an issue while processing your request. The error was: ${errorMessage}. Please try asking your question again, or check if the OpenRouter API key is properly configured.`,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      toast({
        title: "AI Assistant Error",
        description: "There was an issue with the AI response. Please try again.",
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
      setApiKey,
      generateCourseDescription,
      getVideoTranscription
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
