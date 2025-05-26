
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// OpenRouter API Key
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Validate API key
    if (!OPENROUTER_API_KEY) {
      throw new Error("OpenRouter API key not found");
    }
    
    // Parse request body
    const { prompt, context, previousMessages, maxTokens = 500, temperature = 0.3 } = await req.json();
    
    // Validate required fields
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing required field: prompt" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Construct messages for OpenRouter with cleaner context
    const messages = [];
    
    // Add focused system context
    messages.push({
      role: "system",
      content: "You are a helpful educational assistant. Provide clear, accurate, and well-structured responses. Always write in proper English without any garbled text, repetitive words, or unclear content. Focus on being informative and concise."
    });
    
    // Add the current prompt
    messages.push({
      role: "user",
      content: prompt
    });
    
    console.log("Sending request to OpenRouter API");
    
    // Call OpenRouter API with better model and settings
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-app.com",
        "X-Title": "Tech Learn Platform"
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-haiku",
        messages: messages,
        max_tokens: maxTokens,
        temperature: temperature,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response from OpenRouter API:", errorText);
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    console.log("OpenRouter API response received");
    
    // Extract and validate the text response
    const generatedText = responseData.choices?.[0]?.message?.content;
    
    if (!generatedText) {
      console.error("Invalid response structure:", responseData);
      throw new Error("No content received from OpenRouter API");
    }
    
    // Clean and validate the response
    const cleanedText = generatedText.trim();
    
    // Check for garbled text patterns
    const garbledPatterns = [
      /\b(crucial|later|context|ampl|subtle|unconscious|SUB)\b.*\b(crucial|later|context|ampl|subtle|unconscious|SUB)\b/i,
      /(.{1,10}\s+){20,}/,  // Too many short repeated words
      /\b(\w+)\s+\1\s+\1/,  // Word repeated 3+ times
    ];
    
    const isGarbled = garbledPatterns.some(pattern => pattern.test(cleanedText));
    
    if (isGarbled || cleanedText.length < 10) {
      throw new Error("Generated response appears to be garbled or too short");
    }
    
    return new Response(
      JSON.stringify({ generatedText: cleanedText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in text-generation function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unexpected error occurred",
        details: "Please check your OpenRouter API key and try again"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
