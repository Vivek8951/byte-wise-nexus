
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.2";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = 'https://weiagpwgfmyjdglfpbeu.supabase.co';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Default API key from user
const DEFAULT_GEMINI_API_KEY = "AIzaSyAQXlW-S2tsxU5tfa6DBqnrxGC_lM_vJsk";

// Function to generate AI response based on video transcript
async function generateVideoAIResponse(question: string, context: string, videoId: string): Promise<string> {
  try {
    // Get API key from env or use default
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || DEFAULT_GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      throw new Error("Gemini API key not found");
    }
    
    // Construct the prompt for Gemini
    const prompt = `
      You are a helpful AI assistant specializing in educational content.
      
      ${context}
      
      Please answer the following question in a helpful, educational manner.
      If the answer cannot be directly found in the transcript, you can provide general knowledge but mention that it's not specifically covered in the video.
      
      Question: "${question}"
      
      Format your answer in a conversational, helpful way, with paragraphs as needed for readability.
    `;
    
    // Call Gemini API
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiApiKey}`;
    
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
    
    // Extract the text response
    const textResponse = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      throw new Error("Invalid response from Gemini API");
    }
    
    // Store the interaction in database for future reference (optional)
    await supabase
      .from('video_ai_interactions')
      .insert({
        video_id: videoId,
        question: question,
        response: textResponse,
        created_at: new Date().toISOString()
      })
      .catch(error => {
        console.warn("Failed to log AI interaction:", error);
        // Non-critical error, continue execution
      });
    
    return textResponse;
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "I'm sorry, I couldn't process your question at this time. Please try again later.";
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { question, context, videoId } = await req.json();
    
    if (!question || !context || !videoId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: question, context, and videoId are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    const response = await generateVideoAIResponse(question, context, videoId);
    
    return new Response(
      JSON.stringify({ response }),
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
