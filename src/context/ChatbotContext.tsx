
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
          prompt: `Write a professional course description for "${topic}". Include learning objectives, key topics, and target audience. Keep it between 100-200 words. Write in clear, professional English without any garbled text.`,
          context: "You are an educational content creator specializing in computer science courses. Provide clear, coherent descriptions without repetitive words.",
          maxTokens: 400,
          temperature: 0.3
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data.generatedText || `Master ${topic} with this comprehensive course covering fundamental concepts, practical applications, and real-world projects. Learn industry-standard practices and gain hands-on experience through guided exercises and expert instruction.`;
    } catch (error) {
      console.error("Error generating course description:", error);
      toast({
        title: "Error",
        description: "Failed to generate course description. Using fallback content.",
        variant: "destructive"
      });
      return `Master ${topic} with this comprehensive course covering fundamental concepts, practical applications, and real-world projects. Learn industry-standard practices and gain hands-on experience through guided exercises and expert instruction.`;
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
      
      return data.generatedText || "This educational video covers key concepts and practical applications in computer science.";
    } catch (error) {
      console.error("Error analyzing video:", error);
      toast({
        title: "Error",
        description: "Failed to analyze video content. Please try again.",
        variant: "destructive"
      });
      return "This educational video covers key concepts and practical applications in computer science.";
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
