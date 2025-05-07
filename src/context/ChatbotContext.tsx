import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChatMessage } from '../types';
import { useToast } from "@/hooks/use-toast";

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

// Default Gemini API key provided by user
const DEFAULT_API_KEY = "AIzaSyAQXlW-S2tsxU5tfa6DBqnrxGC_lM_vJsk";

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
    // Use the default API key or any saved one
    const savedKey = localStorage.getItem('gemini_api_key');
    return savedKey || DEFAULT_API_KEY;
  });
  const { toast } = useToast();

  // Save the API key to localStorage whenever it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('gemini_api_key', apiKey);
    }
  }, [apiKey]);

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

  // Generate course description based on topic
  const generateCourseDescription = async (topic: string): Promise<string> => {
    try {
      const keyToUse = apiKey || DEFAULT_API_KEY;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${keyToUse}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ 
                text: `Create a comprehensive course description for a computer science course about ${topic}. 
                Include learning objectives, key topics covered, and target audience.
                Keep it concise but informative, maximum 150 words.` 
              }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate course description");
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error generating course description:", error);
      toast({
        title: "Error",
        description: "Failed to generate course description. Please check your API key.",
        variant: "destructive"
      });
      return "";
    }
  };

  // Get video transcription
  const getVideoTranscription = async (videoUrl: string): Promise<string> => {
    try {
      const keyToUse = apiKey || DEFAULT_API_KEY;
      
      // This is a placeholder - in a real implementation, you would send the video
      // to a transcription service. For now, we'll use Gemini to generate a placeholder
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${keyToUse}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ 
                text: `Create a short summary of what might be in a computer science educational video 
                with this URL: ${videoUrl}. Pretend you are transcribing key points from the video.` 
              }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          }
        })
      });

      if (!response.ok) {
        throw new Error("Failed to analyze video content");
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error analyzing video:", error);
      toast({
        title: "Error",
        description: "Failed to analyze video content. Please check your API key.",
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
      const keyToUse = apiKey || DEFAULT_API_KEY;
      
      if (!keyToUse) {
        throw new Error('Please set your Gemini API key in the settings');
      }
      
      // Determine if request is for text or image generation
      const isImageRequest = content.toLowerCase().includes('diagram') || 
                            content.toLowerCase().includes('graph') || 
                            content.toLowerCase().includes('picture') ||
                            content.toLowerCase().includes('image');
      
      if (isImageRequest) {
        // Image generation with Gemini API
        try {
          // Gemini doesn't directly generate images, so let's create a descriptive response
          const imageResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${keyToUse}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `Generate a detailed description for an image based on: ${content}`
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.9,
                maxOutputTokens: 500,
              }
            })
          });
          
          if (!imageResponse.ok) {
            throw new Error('Failed to generate image description');
          }
          
          const responseData = await imageResponse.json();
          const imageDesc = responseData.candidates?.[0]?.content?.parts?.[0]?.text || 
                            "I've prepared a visual representation based on your request.";
          
          // Since Gemini doesn't directly generate images, use Unsplash for a relevant image
          const botMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: imageDesc,
            timestamp: new Date().toISOString(),
            imageUrl: `https://source.unsplash.com/random/800x600/?${encodeURIComponent(content)}`,
          };
          
          setMessages(prev => [...prev, botMessage]);
        } catch (error) {
          console.error("Image generation error:", error);
          throw new Error('Failed to generate image response');
        }
      } else {
        // Text completion with Gemini API
        const chatResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${keyToUse}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { 
                    text: "You are an AI learning assistant for a computer science e-learning platform. Provide helpful, accurate, and concise answers about computer science topics. Include code examples when relevant."
                  }
                ]
              },
              ...messages.slice(-5).map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
              })),
              {
                role: "user",
                parts: [{ text: content }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800,
            }
          })
        });
        
        if (!chatResponse.ok) {
          throw new Error('Failed to get response. Please check your API key and try again.');
        }
        
        const chatData = await chatResponse.json();
        const responseText = chatData.candidates?.[0]?.content?.parts?.[0]?.text || 
                           "I'm sorry, I couldn't generate a response.";
        
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseText,
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
