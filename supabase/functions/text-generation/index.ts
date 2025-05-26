
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
    
    // Construct messages for OpenRouter
    const messages = [];
    
    if (context) {
      messages.push({
        role: "system",
        content: context
      });
    }
    
    if (previousMessages && Array.isArray(previousMessages) && previousMessages.length > 0) {
      messages.push(...previousMessages);
    }
    
    messages.push({
      role: "user",
      content: prompt
    });
    
    console.log("Sending request to OpenRouter API");
    
    // Call OpenRouter API
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
        temperature: temperature
      })
    });
    
    if (!response.ok) {
      console.error("Error response from OpenRouter API:", await response.text());
      throw new Error(`Failed to get response from OpenRouter API: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    // Extract the text response
    const generatedText = responseData.choices?.[0]?.message?.content;
    
    if (!generatedText) {
      throw new Error("Invalid response from OpenRouter API");
    }
    
    return new Response(
      JSON.stringify({ generatedText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in text-generation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
