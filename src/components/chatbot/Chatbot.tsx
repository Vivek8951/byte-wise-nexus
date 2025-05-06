
import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Image, Mic, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useChatbot } from "@/context/ChatbotContext";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

export function Chatbot() {
  const { messages, sendMessage, isLoading, isOpen, toggleChatbot, clearChat } = useChatbot();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  const handleSendMessage = () => {
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue("");
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  if (!isOpen) {
    return (
      <Button 
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-tech-purple shadow-lg hover:bg-tech-darkblue"
        onClick={toggleChatbot}
      >
        <MessageSquare className="h-6 w-6" />
        <span className="sr-only">Open AI Assistant</span>
      </Button>
    );
  }
  
  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 rounded-lg border bg-background shadow-xl animate-in slide-in-from-bottom-5">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-tech-purple text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h2 className="font-medium">AI Learning Assistant</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-white hover:bg-tech-darkblue" onClick={clearChat}>
            <Mic className="h-4 w-4" />
            <span className="sr-only">Voice Input</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-tech-darkblue" onClick={toggleChatbot}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col h-96 overflow-y-auto p-4 gap-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div 
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user' 
                  ? 'bg-tech-blue text-white' 
                  : 'bg-secondary'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="h-6 w-6">
                    <div className="bg-tech-purple text-white rounded-full flex items-center justify-center h-full w-full text-xs">
                      AI
                    </div>
                  </Avatar>
                  <span className="text-xs font-medium">AI Assistant</span>
                </div>
              )}
              <p className="text-sm">{message.content}</p>
              
              {message.imageUrl && (
                <div className="mt-2">
                  <img 
                    src={message.imageUrl} 
                    alt="AI Generated" 
                    className="rounded-md max-h-40 w-auto"
                  />
                </div>
              )}
              
              <div className="text-xs mt-1 opacity-70">
                {new Date(message.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-secondary">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm">AI is thinking...</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            placeholder="Ask me anything about computer science..."
            className="min-h-10 resize-none"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <div className="flex flex-col gap-2">
            <Button size="icon" onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
            <Button size="icon" variant="outline" disabled={isLoading}>
              <Image className="h-4 w-4" />
              <span className="sr-only">Generate image</span>
            </Button>
          </div>
        </div>
        <div className="mt-2 text-xs text-center text-muted-foreground">
          AI assistant can answer questions, explain concepts, and generate diagrams
        </div>
      </div>
    </div>
  );
}
