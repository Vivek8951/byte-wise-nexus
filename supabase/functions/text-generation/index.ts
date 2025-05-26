
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const OPENROUTER_API_KEY = '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';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    if (!OPENROUTER_API_KEY) {
      console.error("OpenRouter API key not found");
      return new Response(
        JSON.stringify({ 
          error: "OpenRouter API key not configured", 
          details: "Please check your OpenRouter API key in Supabase secrets" 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const { prompt, context, maxTokens = 500, temperature = 0.3 } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log("Sending request to OpenRouter API");
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-app.com",
        "X-Title": "Tech Learn Platform"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: context || "You are a helpful assistant that generates educational content. Provide clear, professional responses without any garbled text or repetitive words."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: temperature,
        top_p: 0.9
      })
    });
    
    console.log("OpenRouter API response received");
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", response.status, errorText);
      
      // Return a fallback response instead of failing completely
      let fallbackText = "";
      if (prompt.toLowerCase().includes("course description")) {
        fallbackText = "This comprehensive course covers essential concepts and practical applications. Students will learn fundamental principles through hands-on exercises, real-world examples, and expert guidance. Perfect for beginners and intermediate learners looking to advance their skills.";
      } else if (prompt.toLowerCase().includes("category")) {
        fallbackText = "Category: Programming\nInstructor: Dr. Sarah Johnson\nDuration: 8 weeks\nLevel: intermediate";
      } else {
        fallbackText = "Educational content focusing on practical learning and skill development.";
      }
      
      return new Response(
        JSON.stringify({ generatedText: fallbackText, fallback: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const responseData = await response.json();
    const generatedText = responseData.choices?.[0]?.message?.content;
    
    if (!generatedText || generatedText.trim().length < 10) {
      console.error("Generated response appears to be garbled or too short:", generatedText);
      
      // Provide fallback content based on prompt type
      let fallbackText = "";
      if (prompt.toLowerCase().includes("course description")) {
        fallbackText = "This comprehensive course provides in-depth coverage of key concepts and practical applications. Students will engage with hands-on exercises, real-world case studies, and expert instruction to build essential skills for their career advancement.";
      } else if (prompt.toLowerCase().includes("category")) {
        fallbackText = "Category: Computer Science\nInstructor: Prof. Michael Chen\nDuration: 10 weeks\nLevel: intermediate";
      } else {
        fallbackText = "High-quality educational content designed to enhance learning and skill development.";
      }
      
      return new Response(
        JSON.stringify({ generatedText: fallbackText, fallback: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ generatedText: generatedText.trim() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in text-generation function:", error);
    
    // Provide fallback response even in case of errors
    const fallbackText = "This course provides comprehensive learning opportunities with practical applications and expert guidance. Students will develop essential skills through structured lessons and hands-on practice.";
    
    return new Response(
      JSON.stringify({ generatedText: fallbackText, fallback: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
