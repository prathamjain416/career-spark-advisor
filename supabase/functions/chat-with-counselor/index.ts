
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "https://esm.sh/openai@4.20.1";

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
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')
    });

    const { prompt, context } = await req.json();

    // Build the messages array for the API call
    const messages = [
      {
        role: "system",
        content: `You are an expert career counselor for high school and college students in India. 
        Provide specific, actionable guidance about education, careers, entrance exams, and academic paths.
        Keep responses concise (maximum 3-4 paragraphs) but informative, focusing on practical advice for Indian students.
        Include specific entrance exam names, college options in India, and career paths available in the Indian context when relevant.
        Always provide comprehensive and thorough responses to ensure the user gets valuable guidance.`
      }
    ];

    // Add conversation context if provided
    if (context && Array.isArray(context)) {
      messages.push(...context);
    }

    // Add the current user prompt
    messages.push({
      role: "user",
      content: prompt
    });

    console.log("Sending to OpenAI:", messages);

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 600,  // Increased token limit for more detailed responses
    });

    console.log("Received response from OpenAI");
    const aiResponseText = response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";

    return new Response(JSON.stringify({ message: aiResponseText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message, message: "I'm sorry, I encountered an error processing your request. Please try again later." }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
