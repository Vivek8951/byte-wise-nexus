
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface VideoAnalysisChatbotProps {
  videoId: string;
  transcript?: string;
  summary?: string;
}

export function VideoAnalysisChatbot({ videoId, transcript, summary }: VideoAnalysisChatbotProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    
    try {
      // Here you would normally call an API to get AI responses about the video
      // Using the videoId, transcript, and summary to provide context
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a simple response based on the summary or transcript
      let aiResponse = "I'm analyzing the video content...";
      
      if (summary) {
        aiResponse = `Based on this video's content: ${summary.substring(0, 150)}... What else would you like to know?`;
      } else if (transcript) {
        aiResponse = `I've analyzed the video transcript. How can I help you understand this content better?`;
      }
      
      // Add AI response to chat
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: "Failed to get response from AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-4 mb-6 border shadow-sm">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="text-lg font-medium">Ask AI about this video</div>
          
          {/* Introduction message */}
          {messages.length === 0 && (
            <div className="bg-muted/50 p-3 rounded-md text-sm">
              <p>Ask questions about this video content and get AI-powered answers.</p>
              {summary && (
                <p className="mt-2 text-muted-foreground text-xs">
                  <strong>Video Summary:</strong> {summary.length > 200 ? `${summary.substring(0, 200)}...` : summary}
                </p>
              )}
            </div>
          )}
          
          {/* Chat messages */}
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {messages.map((message, index) => (
              <div 
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Input area */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Ask about the video content..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
