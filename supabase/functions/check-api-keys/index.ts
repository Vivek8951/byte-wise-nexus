
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Available API keys
const HUGGING_FACE_API_KEY = Deno.env.get('HUGGING_FACE_API_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { keyType } = await req.json();
    
    switch (keyType) {
      case "huggingface":
        const isValid = !!HUGGING_FACE_API_KEY;
        
        // If we have an API key, verify it works
        if (isValid) {
          try {
            // Make a simple request to validate the API key
            const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${HUGGING_FACE_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                inputs: "Hello, are you online?",
                parameters: {
                  max_new_tokens: 10,
                  return_full_text: false
                }
              })
            });
            
            return new Response(
              JSON.stringify({ 
                isValid: response.ok,
                message: response.ok ? "API key is valid" : "Invalid API key"
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          } catch (error) {
            return new Response(
              JSON.stringify({ 
                isValid: false,
                message: "Failed to validate API key"
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
        
        return new Response(
          JSON.stringify({ 
            isValid,
            message: isValid ? "API key is set" : "API key is not set"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
        
      default:
        return new Response(
          JSON.stringify({ error: "Invalid key type" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in check-api-keys function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
