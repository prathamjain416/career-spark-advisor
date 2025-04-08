
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.9.0";

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
    const { prompt, context } = await req.json();
    
    // Check if API key is available
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.log("Invalid or missing Gemini API key. Using fallback response.");
      return generateFallbackResponse(prompt, context, corsHeaders);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prepare the conversation history
    const messages = [
      {
        role: "system",
        parts: [{text: `You are an expert career counselor for high school and college students in India. 
        Provide specific, actionable guidance about education, careers, entrance exams, and academic paths.
        Keep responses concise (maximum 3-4 paragraphs) but informative, focusing on practical advice for Indian students.
        Include specific entrance exam names, college options in India, and career paths available in the Indian context when relevant.
        Always provide comprehensive and thorough responses to ensure the user gets valuable guidance.`}]
      }
    ];

    // Add conversation context if provided
    if (context && Array.isArray(context)) {
      messages.push(...context.map(msg => ({
        role: msg.role,
        parts: [{text: msg.content}]
      })));
    }

    // Add the current user prompt
    messages.push({
      role: "user",
      parts: [{text: prompt}]
    });

    console.log("Sending to Gemini:", messages);

    // Call Gemini API
    const result = await model.generateContent({
      contents: messages,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600
      }
    });

    const aiResponseText = result.response.text() || "I'm sorry, I couldn't generate a response.";

    return new Response(JSON.stringify({ message: aiResponseText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error:", error);
    return generateFallbackResponse(prompt, context, corsHeaders);
  }
});

// Function to generate fallback responses when Gemini API is unavailable
function generateFallbackResponse(prompt, context, corsHeaders) {
  console.log("Generating fallback response for prompt:", prompt);
  
  // Array of pre-defined career guidance responses
  const fallbackResponses = [
    "Based on your interests, engineering might be a great path for you. Top engineering entrance exams in India include JEE Main, JEE Advanced, and BITSAT. I recommend starting preparation at least 1-2 years in advance with NCERT books as your foundation.",
    
    "For medical aspirants, NEET-UG is the primary entrance exam in India. Besides MBBS, you might consider BDS, BAMS, or allied health sciences. For preparation, focus on NCERT textbooks and solve previous years' papers.",
    
    "Commerce offers diverse career paths like CA, CS, CMA, or MBA. For CA, register with ICAI and prepare for foundation exams. For MBA, aim for CAT, XAT, or NMAT after graduation. DU, SRCC, and Christ University offer excellent BCom programs.",
    
    "If you're interested in humanities or social sciences, consider DU, JNU, or Ashoka University. Prepare for CUET for admission to central universities. Career options include civil services (prepare for UPSC), law (take CLAT), journalism, or psychology.",
    
    "For computer science careers, focus on building practical skills alongside your degree. Consider BTech CSE (through JEE), BCA, or BSc Computer Science programs. Develop coding skills through platforms like Coursera, edX, or Codecademy.",
    
    "When choosing a stream after 10th, consider your interests and aptitude rather than peer pressure. Science opens doors to engineering, medicine, and research; Commerce to business, finance, and economics; Arts to law, civil services, and creative fields."
  ];
  
  // Simple keyword matching to attempt to provide relevant responses
  const keywords = {
    "engineer": 0,
    "jee": 0,
    "tech": 0,
    "doctor": 1,
    "medical": 1,
    "neet": 1,
    "commerce": 2,
    "business": 2,
    "accountant": 2,
    "ca": 2,
    "arts": 3,
    "humanities": 3,
    "social": 3,
    "program": 4,
    "coding": 4,
    "computer": 4,
    "software": 4,
    "10th": 5,
    "stream": 5,
    "choose": 5
  };
  
  // Try to match the prompt with keywords
  const promptLower = prompt.toLowerCase();
  let bestMatchIndex = -1;
  let bestMatchScore = 0;
  
  Object.entries(keywords).forEach(([keyword, index]) => {
    if (promptLower.includes(keyword)) {
      const currentScore = countOccurrences(promptLower, keyword);
      if (currentScore > bestMatchScore) {
        bestMatchScore = currentScore;
        bestMatchIndex = index;
      }
    }
  });
  
  // If no match, pick a random response
  if (bestMatchIndex === -1) {
    bestMatchIndex = Math.floor(Math.random() * fallbackResponses.length);
  }
  
  const response = fallbackResponses[bestMatchIndex];
  
  return new Response(JSON.stringify({ message: response }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Helper function to count keyword occurrences
function countOccurrences(text, keyword) {
  const regex = new RegExp(keyword, 'gi');
  return (text.match(regex) || []).length;
}
