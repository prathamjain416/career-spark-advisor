
import { supabase } from '@/integrations/supabase/client';

export const generateAssessmentResults = async (assessmentType: 'class10' | 'class12', answers: any[]) => {
  try {
    console.log('Sending to OpenAI:', { assessmentType, answers });
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('generate-assessment', {
      body: { assessmentType, answers }
    });
    
    if (error) {
      console.error('Error calling OpenAI service:', error);
      throw new Error(error.message);
    }
    
    console.log('Received assessment results:', data);
    
    // Save the results to Supabase
    try {
      const { error: saveError } = await supabase
        .from('career_assessments')
        .insert({
          result: data,
          personality_type: assessmentType === 'class10' ? data.recommendedStream : data.recommendedDegrees?.[0]?.name,
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
    
    return data;
  } catch (error) {
    console.error('Error in OpenAI service:', error);
    
    // Return mock data as fallback
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
