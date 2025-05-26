
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY') || '';

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
      throw new Error("OpenRouter API key not found");
    }
    
    const { title } = await req.json();
    
    if (!title) {
      return new Response(
        JSON.stringify({ error: "Title is required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`Generating course details for: "${title}"`);
    
    const prompt = `Generate a detailed description for a technical course titled "${title}". Also provide:
1. A category for the course (e.g., Web Development, Data Science, Programming, Cybersecurity, etc.)
2. A suggested duration for the course (e.g., "8 weeks")
3. A difficulty level (beginner, intermediate, or advanced)
4. A fictional instructor name who would be qualified to teach this course
5. 3 video lesson titles that would be included in this course

Format the response as JSON with these keys:
description (string), category (string), duration (string), level (string), instructor (string), and videos (array of strings).`;

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
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that generates course details in JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7
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
    
    // Try to extract JSON from the response
    try {
      // Look for JSON pattern in the text
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      let courseDetails;
      
      if (jsonMatch) {
        courseDetails = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: Parse the response as plain text
        const lines = generatedText.split('\n').filter(line => line.trim());
        
        // Extract what we can
        const description = lines.find(line => 
          !line.toLowerCase().startsWith('category') && 
          !line.toLowerCase().startsWith('duration') && 
          !line.toLowerCase().startsWith('level') && 
          !line.toLowerCase().startsWith('instructor') && 
          !line.toLowerCase().startsWith('video')
        ) || `Comprehensive course on ${title}`;
        
        const categoryLine = lines.find(line => line.toLowerCase().includes('category')) || '';
        const category = categoryLine.split(':')[1]?.trim() || 'Programming';
        
        const durationLine = lines.find(line => line.toLowerCase().includes('duration')) || '';
        const duration = durationLine.split(':')[1]?.trim() || '8 weeks';
        
        const levelLine = lines.find(line => line.toLowerCase().includes('level')) || '';
        const level = levelLine.split(':')[1]?.trim() || 'beginner';
        
        const instructorLine = lines.find(line => line.toLowerCase().includes('instructor')) || '';
        const instructor = instructorLine.split(':')[1]?.trim() || 'John Smith';
        
        const videoLines = lines.filter(line => line.toLowerCase().includes('video') || line.match(/^\d+\.\s/));
        const videos = videoLines.map(line => {
          const parts = line.split(':');
          return parts.length > 1 ? parts[1].trim() : line.replace(/^\d+\.\s/, '').trim();
        }).filter(Boolean);
        
        courseDetails = {
          description,
          category,
          duration,
          level: level.toLowerCase().includes('begin') ? 'beginner' : 
                 level.toLowerCase().includes('adv') ? 'advanced' : 'intermediate',
          instructor,
          videos: videos.length ? videos : [`Introduction to ${title}`, `${title} Advanced Techniques`, `${title} Projects`]
        };
      }
      
      return new Response(
        JSON.stringify({ success: true, courseDetails }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("Error parsing AI response:", error);
      console.log("Raw response:", generatedText);
      
      // Return a fallback response
      return new Response(
        JSON.stringify({
          success: true,
          courseDetails: {
            description: `Learn everything about ${title} with this comprehensive course.`,
            category: "Programming",
            duration: "8 weeks",
            level: "intermediate",
            instructor: "John Smith",
            videos: [`Introduction to ${title}`, `${title} Advanced Techniques`, `${title} Projects`]
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Error in generate-course-details function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
