import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Default Gemini API key from user
const DEFAULT_GEMINI_API_KEY = "AIzaSyAQXlW-S2tsxU5tfa6DBqnrxGC_lM_vJsk";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, context, videoId } = await req.json();
    
    if (!question) {
      return new Response(
        JSON.stringify({ error: "Missing question" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Use environment variable or default to provided key
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || DEFAULT_GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error("Gemini API key not found");
    }
    
    // Updated to use the v1 endpoint
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiApiKey}`;
    
    const prompt = `
      You are an educational assistant helping a student understand a video.
      
      ${context}
      
      Student question: "${question}"
      
      Provide a helpful, accurate, and concise response based on the video content.
      If the question is not related to the video content, politely explain that you can only answer questions about this specific video.
    `;
    
    console.log("Sending request to Gemini API");
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });
    
    if (!response.ok) {
      console.error("Error response from Gemini API:", await response.text());
      throw new Error(`Failed to get response from Gemini API: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    console.log("Received response from Gemini API");
    
    const textResponse = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      throw new Error("Invalid response from Gemini API");
    }
    
    return new Response(
      JSON.stringify({ response: textResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ask-video-ai function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
