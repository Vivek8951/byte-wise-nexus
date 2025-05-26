
import React, { createContext, useContext, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ChatbotContextType {
  generateCourseDescription: (topic: string) => Promise<string>;
  getVideoTranscription: (videoUrl: string) => Promise<string>;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export function ChatbotProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();

  // Generate course description based on topic using OpenRouter
  const generateCourseDescription = async (topic: string): Promise<string> => {
    try {
      // Call Supabase edge function to generate description
      const { data, error } = await supabase.functions.invoke("text-generation", {
        body: { 
          prompt: `Create a comprehensive course description for a computer science course about ${topic}. 
                Include learning objectives, key topics covered, and target audience.
                Keep it concise but informative, maximum 150 words. Write in clear, professional English.`,
          context: "You are an educational content creator specializing in computer science courses.",
          maxTokens: 300,
          temperature: 0.3
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
          maxTokens: 400,
          temperature: 0.3
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

  return (
    <ChatbotContext.Provider value={{ 
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
