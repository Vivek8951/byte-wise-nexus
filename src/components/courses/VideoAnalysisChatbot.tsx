
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface VideoAnalysisChatbotProps {
  videoId: string;
  transcript: string;
  summary: string;
}

// Rename component to match the export name in index.ts
export function VideoAnalysisChatbot({ videoId, transcript, summary }: VideoAnalysisChatbotProps) {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI assistant for this video. Ask me questions about the content, and I'll try to answer based on the video transcript.",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Context to send to the AI
      const context = `
        Based on this video transcript: "${transcript}"
        
        And this summary: "${summary}"
        
        Please answer the following question from a student.
      `;

      // Call Hugging Face API through Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("ask-video-ai", {
        body: { 
          question: inputValue,
          context: context,
          videoId: videoId
        },
      });

      if (error) {
        console.error("Error from edge function:", error);
        throw new Error(error.message || "Failed to get AI response");
      }

      const aiResponse: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data?.response || "I'm sorry, I couldn't process your question at this time.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I encountered an error while processing your question. Please try again later.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="bg-primary text-primary-foreground p-1 rounded-md">AI</span> Video Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-4 max-h-96 overflow-y-auto p-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="h-6 w-6">
                        <div className="bg-primary text-primary-foreground rounded-full flex items-center justify-center h-full w-full text-xs">
                          AI
                        </div>
                      </Avatar>
                      <span className="text-xs font-medium">Video Assistant</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-secondary">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p className="text-sm">Generating response...</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Textarea
              placeholder="Ask a question about the video..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="min-h-10 resize-none"
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
