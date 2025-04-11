
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

export const generateAssessmentResults = async (assessmentType: 'class10' | 'class12', answers: any[]) => {
  try {
    console.log('Sending to AI service:', { assessmentType, answers });
    
    // Get current user session first to ensure we have a user
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    
    if (!userId) {
      console.log('User not logged in, proceeding without saving results');
    }
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('generate-assessment', {
      body: { assessmentType, answers }
    });
    
    if (error) {
      console.error('Error calling AI service:', error);
      throw new Error(error.message);
    }
    
    console.log('Received assessment results:', data);
    
    // Save the results to Supabase if user is logged in
    if (userId) {
      try {
        // For Class 10, personality_type must be a valid enum value
        // Convert the recommendedStream to a valid personality_type enum
        let personalityType = null;
        
        // Map the stream to a valid personality_type enum value
        if (assessmentType === 'class10') {
          const streamToPersonalityMap: Record<string, string> = {
            'Science': 'analytical',
            'Commerce': 'enterprising',
            'Arts': 'artistic',
            'Humanities': 'social'
          };
          
          personalityType = streamToPersonalityMap[data.recommendedStream] || 'analytical';
        } else {
          // For class12, use the first career path or degree as the personality type
          const careerOrDegree = data.recommendedDegrees?.[0]?.name || 'analytical';
          
          // Map common career paths to personality types
          const careerToPersonalityMap: Record<string, string> = {
            'Computer Science': 'analytical',
            'Engineering': 'analytical',
            'Business': 'enterprising',
            'Finance': 'conventional',
            'Arts': 'artistic',
            'Design': 'artistic',
            'Psychology': 'social',
            'Medical': 'investigative',
            'Law': 'enterprising'
          };
          
          // Find a matching personality type based on keywords in the career/degree name
          let matchedPersonality = 'analytical'; // Default
          Object.entries(careerToPersonalityMap).forEach(([career, personality]) => {
            if (careerOrDegree.includes(career)) {
              matchedPersonality = personality;
            }
          });
          
          personalityType = matchedPersonality;
        }
        
        const { error: saveError } = await supabase
          .from('career_assessments')
          .insert({
            user_id: userId,
            result: data,
            personality_type: personalityType,
            skills: assessmentType === 'class12' ? data.recommendedDegrees?.map((d: any) => d.name) : null,
            interests: assessmentType === 'class12' ? data.careerPaths?.map((p: any) => p.name) : null
          });
        
        if (saveError) {
          console.error('Error saving assessment results:', saveError);
        } else {
          console.log('Assessment results saved to database');
        }
      } catch (saveError) {
        console.error('Error in saving results:', saveError);
      }
    }
    
    // Share results with chat
    shareResultsWithChat(data, assessmentType);
    
    return data;
  } catch (error) {
    console.error('Error in AI service:', error);
    
    // Return mock data as fallback only if needed
    let fallbackData;
    if (assessmentType === 'class10') {
      fallbackData = {
        recommendedStream: 'Arts/Humanities',
        alternateStream: 'Commerce',
        coreSubjects: 'History, Political Science, Sociology, English',
        optionalSubjects: 'Psychology or Economics',
        boardRecommendations: [
          'CBSE - Well-rounded curriculum with focus on conceptual understanding',
          'ICSE - Strong focus on English and humanities subjects',
          'State Board - If you plan to apply for state colleges with arts specialization'
        ]
      };
    } else {
      fallbackData = {
        recommendedDegrees: [
          { name: 'B.A. in Psychology', description: 'Understand human behavior and mental processes' },
          { name: 'B.A. in Mass Communication', description: 'Learn media production and journalism skills' },
          { name: 'B.A. in Economics', description: 'Study market trends and economic theories' }
        ],
        careerPaths: [
          { name: 'Counseling Psychology', description: 'Help people overcome personal challenges' },
          { name: 'Content Creation', description: 'Create engaging content for digital platforms' },
          { name: 'Social Work', description: 'Support communities and individuals in need' }
        ],
        entranceExams: 'CUET, IPUCET, Symbiosis SET',
        preparationTips: [
          'Focus on building a strong portfolio of your work',
          'Develop communication and interpersonal skills',
          'Read widely to build your knowledge base',
          'Participate in relevant volunteer work or internships'
        ]
      };
    }
    
    // Share fallback results with chat
    shareResultsWithChat(fallbackData, assessmentType);
    
    return fallbackData;
  }
};

// Function to share results with chat
function shareResultsWithChat(results: any, assessmentType: 'class10' | 'class12') {
  try {
    const chatSection = document.getElementById('chat');
    
    // Format the results as a message
    let resultSummary = "";
    
    if (assessmentType === 'class10') {
      resultSummary = `Based on my assessment, my recommended stream is ${results.recommendedStream} with core subjects in ${results.coreSubjects}. Can you tell me more about career options related to this stream?`;
    } else {
      const degrees = results.recommendedDegrees?.map((d: any) => d.name).join(', ');
      const careers = results.careerPaths?.map((c: any) => c.name).join(', ');
      resultSummary = `My assessment suggests these degrees: ${degrees} and career paths: ${careers}. Can you provide more information about these options?`;
    }
    
    // Find the input field in the chat section
    const inputField = chatSection?.querySelector('input');
    if (inputField) {
      // Set the value of the input field
      (inputField as HTMLInputElement).value = resultSummary;
      (inputField as HTMLInputElement).focus();
      
      // Automatically trigger the send button (optional)
      const sendButton = chatSection?.querySelector('button[type="submit"]');
      if (sendButton) {
        setTimeout(() => {
          sendButton.click();
        }, 500);
      }
    }
    
    // Scroll to the chat section
    if (chatSection) {
      setTimeout(() => {
        chatSection.scrollIntoView({ behavior: 'smooth' });
      }, 700);
    }
  } catch (error) {
    console.error("Error sharing results with chat:", error);
    // Just scroll to chat as fallback
    const chatSection = document.getElementById('chat');
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
