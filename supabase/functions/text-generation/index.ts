
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Hugging Face API Key
const HUGGING_FACE_API_KEY = Deno.env.get('HUGGING_FACE_API_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Validate API key
    if (!HUGGING_FACE_API_KEY) {
      throw new Error("Hugging Face API key not found");
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
    
    // Construct input based on provided parameters
    let fullPrompt = "";
    
    if (context) {
      fullPrompt += `${context}\n\n`;
    }
    
    if (previousMessages && Array.isArray(previousMessages) && previousMessages.length > 0) {
      // Add conversation history
      previousMessages.forEach((msg) => {
        const role = msg.role === 'assistant' ? 'Assistant' : 'User';
        fullPrompt += `${role}: ${msg.content}\n`;
      });
    }
    
    fullPrompt += `User: ${prompt}\nAssistant: `;
    
    console.log("Sending request to Hugging Face API");
    
    // Call Hugging Face API
    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HUGGING_FACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: maxTokens,
          temperature: temperature,
          return_full_text: false
        }
      })
    });
    
    if (!response.ok) {
      console.error("Error response from Hugging Face API:", await response.text());
      throw new Error(`Failed to get response from Hugging Face API: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    // Extract the text response
    const generatedText = responseData[0]?.generated_text;
    
    if (!generatedText) {
      throw new Error("Invalid response from Hugging Face API");
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
