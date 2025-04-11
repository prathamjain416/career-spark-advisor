
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

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
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { assessmentType, answers } = await req.json();
    
    console.log('Processing assessment request:', { assessmentType, answersCount: answers.length });
    
    if (!answers || answers.length === 0) {
      throw new Error('No answers provided for assessment');
    }

    // Convert the answers into a structured prompt for Gemini
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
    
    Format the response as a JSON object with exactly the structure described above.`;

    try {
      console.log('Sending request to Gemini API');
      
      // Call Gemini AI API with the structured prompt
      const result = await model.generateContent(prompt);
      const aiResponseText = result.response.text();
      console.log('Received response from Gemini:', aiResponseText.substring(0, 100) + '...');
      
      let parsedResponse;
      
      try {
        // Try to extract JSON if the response is wrapped in ```json blocks
        const jsonMatch = aiResponseText.match(/```json\n([\s\S]*?)\n```/) || 
                          aiResponseText.match(/```\n([\s\S]*?)\n```/);
        
        if (jsonMatch && jsonMatch[1]) {
          parsedResponse = JSON.parse(jsonMatch[1]);
          console.log('Successfully parsed JSON from code block');
        } else {
          // Otherwise, try to parse the whole response as JSON
          parsedResponse = JSON.parse(aiResponseText);
          console.log('Successfully parsed JSON from raw response');
        }
        
        console.log('Parsed response structure:', Object.keys(parsedResponse));
        
        return new Response(JSON.stringify(parsedResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (parseError) {
        console.error("Error parsing Gemini response:", parseError);
        console.error("Gemini response text:", aiResponseText);
        
        // Attempt to extract information from text if JSON parsing fails
        console.log("Attempting to extract structured data from text response");
        const extractedData = extractDataFromText(aiResponseText, assessmentType);
        
        if (extractedData) {
          console.log("Successfully extracted structured data from text");
          return new Response(JSON.stringify(extractedData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        throw new Error("Failed to parse Gemini response");
      }
    } catch (geminiError) {
      console.error("Gemini API error:", geminiError);
      
      // Return fallback data
      const fallbackData = getFallbackData(assessmentType);
      return new Response(JSON.stringify(fallbackData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error("Error in generate-assessment function:", error);
    
    // Return fallback data for any error
    let assessmentType = 'class10';
    try {
      if (req.body) {
        const body = await req.json();
        assessmentType = body.assessmentType || 'class10';
      }
    } catch (e) {
      console.error("Error parsing request body:", e);
    }
    
    const fallbackData = getFallbackData(assessmentType);
    return new Response(JSON.stringify(fallbackData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Function to extract data from text response when JSON parsing fails
function extractDataFromText(text, assessmentType) {
  try {
    if (assessmentType === 'class10') {
      // Extract Class 10 information
      const recommendedStreamMatch = text.match(/Recommended Stream:?\s*([^:\n]+)/i);
      const alternateStreamMatch = text.match(/Alternative Stream:?\s*([^:\n]+)/i);
      const coreSubjectsMatch = text.match(/Core Subjects:?\s*([^:\n]+(?:\n[^:\n]+)*)/i);
      const optionalSubjectsMatch = text.match(/Optional Subjects:?\s*([^:\n]+(?:\n[^:\n]+)*)/i);
      
      // Extract board recommendations (this could be multi-line)
      const boardRecsMatch = text.match(/Board Recommendations:?\s*((?:.|\n)*?)(?:\n\n|\n\d|$)/i);
      
      let boardRecommendations = [];
      if (boardRecsMatch && boardRecsMatch[1]) {
        // Split by newlines and/or bullet points and clean up
        boardRecommendations = boardRecsMatch[1]
          .split(/\n|•|-)/)
          .map(item => item.trim())
          .filter(item => item.length > 0);
      }
      
      return {
        recommendedStream: (recommendedStreamMatch && recommendedStreamMatch[1].trim()) || "Science",
        alternateStream: (alternateStreamMatch && alternateStreamMatch[1].trim()) || "Commerce",
        coreSubjects: (coreSubjectsMatch && coreSubjectsMatch[1].trim()) || "Physics, Chemistry, Mathematics, English",
        optionalSubjects: (optionalSubjectsMatch && optionalSubjectsMatch[1].trim()) || "Computer Science or Biology",
        boardRecommendations: boardRecommendations.length > 0 
          ? boardRecommendations 
          : ["CBSE - Good for competitive exam preparation", 
             "ICSE - Strong focus on English and practical learning", 
             "State Board - If you plan to apply for state colleges"]
      };
    } else {
      // Extract Class 12 information
      // This is more complex due to the structured nature of degrees and careers
      // We'll do a simple extraction
      
      const degreesMatch = text.match(/Recommended Undergraduate Degrees:?\s*((?:.|\n)*?)(?:\n\nSuitable|Three Suitable|$)/i);
      const careersMatch = text.match(/(?:Suitable|Three Suitable) Career Paths:?\s*((?:.|\n)*?)(?:\n\nRelevant|Entrance Exams|$)/i);
      const examsMatch = text.match(/(?:Relevant )?Entrance Exams:?\s*([^:\n]+(?:\n[^:\n]+)*)/i);
      const tipsMatch = text.match(/(?:Preparation|Four specific preparation) [Tt]ips:?\s*((?:.|\n)*?)(?:\n\n|$)/i);
      
      // Process degrees - try to split into 3 individual items with descriptions
      let recommendedDegrees = [];
      if (degreesMatch && degreesMatch[1]) {
        const degreeText = degreesMatch[1].trim();
        // Try to identify numbered or bulleted list items
        const degreeItems = degreeText.split(/\n\d+\.|\n-|\n•/).filter(item => item.trim().length > 0);
        
        degreeItems.forEach(item => {
          const parts = item.split(':');
          if (parts.length > 1) {
            recommendedDegrees.push({
              name: parts[0].trim(),
              description: parts[1].trim()
            });
          } else {
            recommendedDegrees.push({
              name: item.split(' - ')[0].trim(),
              description: item.includes(' - ') ? item.split(' - ')[1].trim() : "Strong match for your skills and interests"
            });
          }
        });
      }
      
      // Process careers similarly
      let careerPaths = [];
      if (careersMatch && careersMatch[1]) {
        const careerText = careersMatch[1].trim();
        const careerItems = careerText.split(/\n\d+\.|\n-|\n•/).filter(item => item.trim().length > 0);
        
        careerItems.forEach(item => {
          const parts = item.split(':');
          if (parts.length > 1) {
            careerPaths.push({
              name: parts[0].trim(),
              description: parts[1].trim()
            });
          } else {
            careerPaths.push({
              name: item.split(' - ')[0].trim(),
              description: item.includes(' - ') ? item.split(' - ')[1].trim() : "Good match for your personality and interests"
            });
          }
        });
      }
      
      // Process preparation tips
      let preparationTips = [];
      if (tipsMatch && tipsMatch[1]) {
        preparationTips = tipsMatch[1]
          .split(/\n|•|-)/)
          .map(item => item.trim())
          .filter(item => item.length > 0)
          .slice(0, 4); // Limit to 4 tips
      }
      
      // Ensure we have the expected data or use fallbacks
      if (recommendedDegrees.length === 0) {
        recommendedDegrees = [
          { name: "B.Tech Computer Science", description: "Strong match based on your interests in technology" },
          { name: "B.Sc Data Science", description: "Good option combining technology and analytics" },
          { name: "BCA (Bachelor of Computer Applications)", description: "Alternative option with more flexibility" }
        ];
      }
      
      if (careerPaths.length === 0) {
        careerPaths = [
          { name: "Software Development", description: "Building applications, websites, and systems" },
          { name: "Data Science & Analytics", description: "Analyzing data to derive insights and make predictions" },
          { name: "Cybersecurity", description: "Protecting systems and data from digital attacks" }
        ];
      }
      
      if (preparationTips.length === 0) {
        preparationTips = [
          "Start preparation at least 1-2 years before the exam",
          "Focus on NCERT textbooks and standard reference books",
          "Join a coaching program or use online resources",
          "Practice with previous years' question papers"
        ];
      }
      
      return {
        recommendedDegrees: recommendedDegrees.slice(0, 3), // Limit to 3 degrees
        careerPaths: careerPaths.slice(0, 3), // Limit to 3 career paths
        entranceExams: (examsMatch && examsMatch[1].trim()) || "JEE Main, CUET, MHT-CET (for Maharashtra)",
        preparationTips: preparationTips
      };
    }
  } catch (error) {
    console.error("Error extracting data from text:", error);
    return null;
  }
}

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
