
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
      return generateFallbackResponse(prompt, corsHeaders);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create a chat session
    const chat = model.startChat({
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600
      },
      history: [
        {
          role: "user",
          parts: [{ text: "You are an expert career counselor for high school and college students in India. Provide specific, actionable guidance about education, careers, entrance exams, and academic paths. Keep responses concise (maximum 3-4 paragraphs) but informative, focusing on practical advice for Indian students." }]
        },
        {
          role: "model",
          parts: [{ text: "I understand my role as an expert career counselor for Indian students. I'll provide concise, specific, and actionable guidance on education paths, careers, entrance exams, and academic choices relevant to the Indian context. My responses will be informative yet compact (3-4 paragraphs maximum), focusing on practical advice that students can implement. I'm ready to help with any career-related questions you have." }]
        }
      ]
    });

    // Add conversation context if provided
    if (context && Array.isArray(context)) {
      for (const msg of context) {
        if (msg.role === 'user') {
          await chat.sendMessage({ role: "user", parts: [{ text: msg.content }] });
        }
      }
    }

    console.log("Sending to Gemini prompt:", prompt);

    // Send the current user message and get response
    const result = await chat.sendMessage(prompt);
    const aiResponseText = result.response.text() || "I'm sorry, I couldn't generate a response.";

    console.log("Received from Gemini:", aiResponseText);

    return new Response(JSON.stringify({ message: aiResponseText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error:", error);
    return generateFallbackResponse(prompt, corsHeaders);
  }
});

// Function to generate fallback responses when Gemini API is unavailable
function generateFallbackResponse(prompt, corsHeaders) {
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
