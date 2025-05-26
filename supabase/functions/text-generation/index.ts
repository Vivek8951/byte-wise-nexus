
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
    const { prompt, context, previousMessages, maxTokens = 800, temperature = 0.7 } = await req.json();
    
    // Validate required fields
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing required field: prompt" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Construct messages for OpenRouter with proper context
    const messages = [];
    
    // Add system context if provided
    if (context) {
      messages.push({
        role: "system",
        content: context
      });
    } else {
      // Default system message for better responses
      messages.push({
        role: "system",
        content: "You are a helpful AI assistant. Provide clear, accurate, and concise responses. Always respond in plain text without any special formatting or garbled text."
      });
    }
    
    // Add previous messages if provided
    if (previousMessages && Array.isArray(previousMessages) && previousMessages.length > 0) {
      // Only take the last few messages to avoid context overflow
      const recentMessages = previousMessages.slice(-5);
      messages.push(...recentMessages);
    }
    
    // Add the current prompt
    messages.push({
      role: "user",
      content: prompt
    });
    
    console.log("Sending request to OpenRouter API with messages:", messages.length);
    
    // Call OpenRouter API with better error handling
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-app.com",
        "X-Title": "Tech Learn Platform"
      },
      body: JSON.stringify({
        model: "microsoft/wizardlm-2-8x22b",
        messages: messages,
        max_tokens: maxTokens,
        temperature: temperature,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0
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
    
    // Clean the response to ensure it's proper text
    const cleanedText = generatedText.trim();
    
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
