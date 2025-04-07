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

    const { assessmentType, answers } = await req.json();

    // Convert the answers into a structured prompt for the AI
    const prompt = `
    Based on the following career assessment responses, provide tailored educational and career guidance:
    
    Assessment Type: ${assessmentType === 'class10' ? 'Class 10 Stream Selection' : 'Class 12 Career Planning'}
    
    Student Responses:
    ${answers.map(a => `- Question: ${a.question}\n  Answer: ${a.answer}`).join('\n')}
    
    ${assessmentType === 'class10' 
      ? `Please provide the following:
        1. Recommended Stream (Science, Commerce, Arts/Humanities)
        2. Alternative Stream
        3. Core Subjects for the recommended stream
        4. Optional Subjects suggestions
        5. Board Recommendations (CBSE, ICSE, State Board) with brief explanation` 
      : `Please provide the following:
        1. Three Recommended Undergraduate Degrees with brief descriptions
        2. Three Suitable Career Paths with brief descriptions
        3. Relevant Entrance Exams 
        4. Four specific preparation tips for the recommended career path`
    }
    
    Format the response as a JSON object.`;

    try {
      // Call OpenAI API with the structured prompt
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert career counselor for high school students in India. Provide specific, actionable guidance based on the student's assessment responses. Format your response as a valid JSON object with the structure matching what was requested."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
      });

      // Parse the AI response
      const aiResponseText = response.choices[0].message.content || "";
      let parsedResponse;
      
      try {
        // Try to extract JSON if the response is wrapped in ```json blocks
        const jsonMatch = aiResponseText.match(/```json\n([\s\S]*?)\n```/) || 
                          aiResponseText.match(/```\n([\s\S]*?)\n```/);
        
        if (jsonMatch && jsonMatch[1]) {
          parsedResponse = JSON.parse(jsonMatch[1]);
        } else {
          // Otherwise, try to parse the whole response as JSON
          parsedResponse = JSON.parse(aiResponseText);
        }
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        throw new Error("Failed to parse AI response");
      }

      return new Response(JSON.stringify(parsedResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (openAiError) {
      console.error("OpenAI API error:", openAiError);
      
      // Return fallback data
      const fallbackData = getFallbackData(assessmentType);
      return new Response(JSON.stringify(fallbackData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error("Error:", error);
    
    // Return fallback data for any error
    const fallbackData = getFallbackData(req.body ? (await req.json()).assessmentType : 'class10');
    return new Response(JSON.stringify(fallbackData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function getFallbackData(assessmentType: string) {
  if (assessmentType === 'class10') {
    return {
      recommendedStream: "Science",
      alternateStream: "Commerce",
      coreSubjects: "Physics, Chemistry, Mathematics, English",
      optionalSubjects: "Computer Science or Biology",
      boardRecommendations: [
        "CBSE - Good for competitive exam preparation",
        "ICSE - Strong focus on English and practical learning",
        "State Board - If you plan to apply for state colleges"
      ]
    };
  } else {
    return {
      recommendedDegrees: [
        { name: "B.Tech Computer Science", description: "Strong match based on your interests in technology" },
        { name: "B.Sc Data Science", description: "Good option combining technology and analytics" },
        { name: "BCA (Bachelor of Computer Applications)", description: "Alternative option with more flexibility" }
      ],
      careerPaths: [
        { name: "Software Development", description: "Building applications, websites, and systems" },
        { name: "Data Science & Analytics", description: "Analyzing data to derive insights and make predictions" },
        { name: "Cybersecurity", description: "Protecting systems and data from digital attacks" }
      ],
      entranceExams: "JEE Main, CUET, MHT-CET (for Maharashtra)",
      preparationTips: [
        "Start JEE preparation at least 1-2 years before the exam",
        "Focus on NCERT textbooks and standard reference books",
        "Join a coaching program or use online resources",
        "Practice with previous years' question papers"
      ]
    };
  }
}
