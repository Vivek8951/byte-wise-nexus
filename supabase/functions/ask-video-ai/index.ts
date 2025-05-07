
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

// Hugging Face API Key
const HUGGING_FACE_API_KEY = Deno.env.get('HUGGING_FACE_API_KEY') || '';

// Function to generate AI response based on video transcript using Hugging Face
async function generateVideoAIResponse(question, context, videoId) {
  try {
    // First check if we have a valid API key
    if (!HUGGING_FACE_API_KEY) {
      console.log("No Hugging Face API key, using fallback response");
      return generateFallbackResponse(question, context);
    }
    
    console.log("Generating response with Hugging Face API");
    
    // Construct the prompt for Hugging Face
    const prompt = `
      You are a helpful AI assistant specializing in educational content.
      
      ${context}
      
      Please answer the following question in a helpful, educational manner.
      If the answer cannot be directly found in the transcript, you can provide general knowledge but mention that it's not specifically covered in the video.
      
      Question: "${question}"
      
      Format your answer in a conversational, helpful way, with paragraphs as needed for readability.
    `;
    
    // Call Hugging Face API
    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HUGGING_FACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 800,
          temperature: 0.7,
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
    const textResponse = responseData[0]?.generated_text;
    
    if (!textResponse) {
      throw new Error("Invalid response from Hugging Face API");
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
    return generateFallbackResponse(question, context);
  }
}

// Generate a fallback response based on basic context matching
function generateFallbackResponse(question, context) {
  try {
    // Simple fallback method when API is not available
    const transcript = context.includes("transcript:") 
      ? context.split("transcript:")[1].split("And this summary:")[0].trim()
      : "";
    
    const summary = context.includes("summary:") 
      ? context.split("summary:")[1].trim()
      : "";
    
    // Extract keywords from question
    const questionWords = question.toLowerCase().split(/\W+/).filter(word => 
      word.length > 3 && !['what', 'when', 'where', 'why', 'how', 'the', 'about'].includes(word)
    );
    
    // Find relevant parts of the transcript
    let relevantParts = [];
    let response = "";
    
    if (transcript) {
      // Split transcript into sentences
      const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      // Find sentences matching keywords
      for (const word of questionWords) {
        const matchingSentences = sentences.filter(s => 
          s.toLowerCase().includes(word.toLowerCase())
        );
        relevantParts = [...relevantParts, ...matchingSentences];
      }
    }
    
    // Construct response
    if (relevantParts.length > 0) {
      response = `Based on the video content, I found this information that might help answer your question: "${relevantParts.slice(0, 3).join('. ')}"`;
    } else if (summary) {
      response = `I couldn't find specific information about that in the video. However, the video is about: ${summary}`;
    } else {
      response = `I'm sorry, I don't have enough information in the video transcript to answer your question about "${questionWords.join(', ')}". You might want to watch the full video for more details.`;
    }
    
    return response;
  } catch (error) {
    console.error("Error in fallback response:", error);
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
