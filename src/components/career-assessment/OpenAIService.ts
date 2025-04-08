
import { supabase } from '@/integrations/supabase/client';

export const generateAssessmentResults = async (assessmentType: 'class10' | 'class12', answers: any[]) => {
  try {
    console.log('Sending to OpenAI:', { assessmentType, answers });
    
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
      console.error('Error calling OpenAI service:', error);
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
    
    return data;
  } catch (error) {
    console.error('Error in OpenAI service:', error);
    
    // Return mock data as fallback only if needed
    if (assessmentType === 'class10') {
      return {
        recommendedStream: 'Science',
        alternateStream: 'Commerce',
        coreSubjects: 'Physics, Chemistry, Mathematics, English',
        optionalSubjects: 'Computer Science or Biology',
        boardRecommendations: [
          'CBSE - Good for competitive exam preparation',
          'ICSE - Strong focus on English and practical learning',
          'State Board - If you plan to apply for state colleges'
        ]
      };
    } else {
      return {
        recommendedDegrees: [
          { name: 'B.Tech Computer Science', description: 'Strong match based on your interests in technology' },
          { name: 'B.Sc Data Science', description: 'Good option combining technology and analytics' },
          { name: 'BCA (Bachelor of Computer Applications)', description: 'Alternative option with more flexibility' }
        ],
        careerPaths: [
          { name: 'Software Development', description: 'Building applications, websites, and systems' },
          { name: 'Data Science & Analytics', description: 'Analyzing data to derive insights and make predictions' },
          { name: 'Cybersecurity', description: 'Protecting systems and data from digital attacks' }
        ],
        entranceExams: 'JEE Main, CUET, MHT-CET (for Maharashtra)',
        preparationTips: [
          'Start JEE preparation at least 1-2 years before the exam',
          'Focus on NCERT textbooks and standard reference books',
          'Join a coaching program or use online resources',
          'Practice with previous years\' question papers'
        ]
      };
    }
  }
};
