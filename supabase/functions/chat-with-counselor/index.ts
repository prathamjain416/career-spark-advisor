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
          parts: [{ text: "You are an expert career counselor for high school and college students in India. Provide specific, actionable guidance about education, careers, entrance exams, and academic paths. Keep responses concise (maximum 3-4 paragraphs) but informative, focusing on practical advice for Indian students. Structure your responses using Markdown for headings, bullet points, and emphasis when appropriate." }]
        },
        {
          role: "model",
          parts: [{ text: "I understand my role as an expert career counselor for Indian students. I'll provide concise, specific, and actionable guidance on education paths, careers, entrance exams, and academic choices relevant to the Indian context. My responses will be informative yet compact (3-4 paragraphs maximum), focusing on practical advice that students can implement. I'll use Markdown formatting to structure my responses with headings, bullet points, and emphasis when appropriate. I'm ready to help with any career-related questions you have." }]
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
  
  // Array of pre-defined career guidance responses in Markdown format
  const fallbackResponses = [
    `## Engineering Pathways

Based on your assessment responses, here's a detailed analysis:

### Best Fit: Computer Science Engineering
- **Why This Path?** Your analytical thinking and problem-solving skills make you well-suited for this field
- **Core Skills Required:** Programming, Algorithms, Mathematics, Logical Thinking
- **Future Opportunities:**
  - Software Development
  - Artificial Intelligence
  - Cybersecurity
  - Data Science
- **Growth Potential:** High demand with 15-20% annual growth in tech sector
- **Salary Range:** ₹6-15 LPA for freshers, up to ₹30-50 LPA with experience

### Alternative Options:
1. **Electronics Engineering**
   - Focus on hardware and embedded systems
   - Good for those interested in IoT and robotics
   
2. **Mechanical Engineering**
   - Traditional engineering with diverse applications
   - Strong in manufacturing and automotive sectors

### Preparation Strategy:
- Start with NCERT Physics, Chemistry, and Mathematics
- Focus on JEE Main and Advanced preparation
- Build programming skills through online courses
- Participate in coding competitions

### Top Colleges:
- IITs (through JEE Advanced)
- NITs (through JEE Main)
- BITS Pilani (through BITSAT)
- IIITs (through JEE Main)`,

    `## Medical Career Path

Based on your assessment responses, here's a detailed analysis:

### Best Fit: MBBS (Bachelor of Medicine, Bachelor of Surgery)
- **Why This Path?** Your interest in biology and helping others aligns well with this field
- **Core Skills Required:** Biology, Chemistry, Patience, Communication
- **Future Opportunities:**
  - Clinical Practice
  - Medical Research
  - Public Health
  - Specialization in various fields
- **Growth Potential:** Steady demand with increasing healthcare needs
- **Salary Range:** ₹8-12 LPA for freshers, up to ₹20-50 LPA with specialization

### Alternative Options:
1. **BDS (Dental Surgery)**
   - Focus on oral health and dental care
   - Shorter duration than MBBS
   
2. **BAMS/BHMS (Ayurveda/Homeopathy)**
   - Alternative medicine paths
   - Growing acceptance in healthcare

### Preparation Strategy:
- Focus on NCERT Biology and Chemistry
- Prepare for NEET thoroughly
- Develop strong communication skills
- Gain exposure through hospital visits

### Top Colleges:
- AIIMS (through NEET)
- Top Government Medical Colleges
- Christian Medical College, Vellore
- Armed Forces Medical College`,

    `## Commerce & Business Path

Based on your assessment responses, here's a detailed analysis:

### Best Fit: Chartered Accountancy (CA)
- **Why This Path?** Your analytical and numerical skills make you suitable for this field
- **Core Skills Required:** Accounting, Taxation, Business Laws, Analysis
- **Future Opportunities:**
  - Corporate Finance
  - Taxation
  - Audit and Assurance
  - Financial Consulting
- **Growth Potential:** High demand in corporate sector
- **Salary Range:** ₹6-10 LPA for freshers, up to ₹20-40 LPA with experience

### Alternative Options:
1. **Company Secretary (CS)**
   - Focus on corporate laws and governance
   - Growing importance in corporate sector
   
2. **BBA/MBA**
   - General management path
   - Diverse career opportunities

### Preparation Strategy:
- Focus on Mathematics and Economics
- Develop strong analytical skills
- Stay updated with business news
- Build communication skills

### Top Colleges:
- ICAI for CA
- ICSI for CS
- Top B-Schools for MBA
- Delhi University for B.Com`,

    `## Arts & Humanities Path

Based on your assessment responses, here's a detailed analysis:

### Best Fit: Psychology
- **Why This Path?** Your interest in human behavior and helping others
- **Core Skills Required:** Communication, Empathy, Research, Analysis
- **Future Opportunities:**
  - Clinical Psychology
  - Counseling
  - Human Resources
  - Research
- **Growth Potential:** Increasing awareness of mental health
- **Salary Range:** ₹4-8 LPA for freshers, up to ₹15-25 LPA with experience

### Alternative Options:
1. **Mass Communication**
   - Focus on media and journalism
   - Creative and dynamic field
   
2. **Social Work**
   - Community development focus
   - NGO and social sector opportunities

### Preparation Strategy:
- Focus on English and Social Sciences
- Develop strong writing skills
- Build communication abilities
- Gain practical experience through internships

### Top Colleges:
- Delhi University
- Tata Institute of Social Sciences
- Christ University
- Jamia Millia Islamia`
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
