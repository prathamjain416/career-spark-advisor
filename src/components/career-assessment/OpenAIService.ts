import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

export const generateAssessmentResults = async (assessmentType: 'class10' | 'class12', answers: any[]) => {
  try {
    console.log('Generating assessment results:', { assessmentType, answers });
    
    // Get current user session first to ensure we have a user
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    
    // Analyze answers to determine the best fit
    const results = analyzeAnswers(assessmentType, answers);
    
    // Store results in localStorage for chat access
    localStorage.setItem('assessmentResults', JSON.stringify(results));
    
    // Save the results to Supabase if user is logged in
    if (userId) {
      try {
        const personalityType = determinePersonalityType(assessmentType, results);
        
        const { error: saveError } = await supabase
          .from('career_assessments')
          .insert({
            user_id: userId,
            result: results,
            personality_type: personalityType,
            skills: assessmentType === 'class12' ? results.recommendedDegrees?.map((d: any) => d.name) : null,
            interests: assessmentType === 'class12' ? results.careerPaths?.map((p: any) => p.name) : null
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
    
    return results;
  } catch (error) {
    console.error('Error in assessment service:', error);
    return getFallbackData(assessmentType);
  }
};

function analyzeAnswers(assessmentType: 'class10' | 'class12', answers: any[]) {
  // Count occurrences of different interests and skills
  const interestCounts: Record<string, number> = {};
  const skillCounts: Record<string, number> = {};
  
  answers.forEach(answer => {
    if (!answer || !answer.answer) return;
    
    let answerText = '';
    
    // Handle different answer formats
    if (typeof answer.answer === 'string') {
      answerText = answer.answer;
    } else if (typeof answer.answer === 'object') {
      if ('answer' in answer.answer) {
        answerText = answer.answer.answer;
        if (answer.answer.otherText) {
          answerText += ' ' + answer.answer.otherText;
        }
      } else if ('answers' in answer.answer) {
        answerText = answer.answer.answers.join(' ');
        if (answer.answer.otherText) {
          answerText += ' ' + answer.answer.otherText;
        }
      }
    } else if (Array.isArray(answer.answer)) {
      answerText = answer.answer.join(' ');
    }
    
    // Convert to lowercase for case-insensitive matching
    answerText = answerText.toLowerCase();
    
    // Count interests and skills
    if (answerText.includes('science') || answerText.includes('math') || answerText.includes('technology')) {
      interestCounts['Science'] = (interestCounts['Science'] || 0) + 1;
      skillCounts['Analytical'] = (skillCounts['Analytical'] || 0) + 1;
    }
    if (answerText.includes('arts') || answerText.includes('creative') || answerText.includes('design')) {
      interestCounts['Arts'] = (interestCounts['Arts'] || 0) + 1;
      skillCounts['Creative'] = (skillCounts['Creative'] || 0) + 1;
    }
    if (answerText.includes('business') || answerText.includes('commerce') || answerText.includes('finance')) {
      interestCounts['Commerce'] = (interestCounts['Commerce'] || 0) + 1;
      skillCounts['Business'] = (skillCounts['Business'] || 0) + 1;
    }
    if (answerText.includes('social') || answerText.includes('humanities') || answerText.includes('psychology')) {
      interestCounts['Humanities'] = (interestCounts['Humanities'] || 0) + 1;
      skillCounts['Social'] = (skillCounts['Social'] || 0) + 1;
    }
  });

  // Determine the primary interest based on counts
  const primaryInterest = Object.entries(interestCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Science';

  if (assessmentType === 'class10') {
    return generateClass10Results(primaryInterest);
  } else {
    return generateClass12Results(primaryInterest);
  }
}

function generateClass10Results(primaryInterest: string) {
  const streamMappings: Record<string, any> = {
    'Science': {
      recommendedStream: 'Science',
      alternateStream: 'Commerce',
      coreSubjects: 'Physics, Chemistry, Mathematics, Biology',
      optionalSubjects: 'Computer Science or Physical Education',
      boardRecommendations: [
        'CBSE - Strong focus on science and mathematics',
        'ICSE - Comprehensive science curriculum',
        'State Board - If you plan to apply for state medical/engineering colleges'
      ]
    },
    'Commerce': {
      recommendedStream: 'Commerce',
      alternateStream: 'Arts',
      coreSubjects: 'Accountancy, Business Studies, Economics, Mathematics',
      optionalSubjects: 'Computer Science or Physical Education',
      boardRecommendations: [
        'CBSE - Well-structured commerce curriculum',
        'ICSE - Strong focus on business studies',
        'State Board - If you plan to apply for state commerce colleges'
      ]
    },
    'Arts': {
      recommendedStream: 'Arts/Humanities',
      alternateStream: 'Commerce',
      coreSubjects: 'History, Political Science, Sociology, English',
      optionalSubjects: 'Psychology or Economics',
      boardRecommendations: [
        'CBSE - Well-rounded curriculum with focus on conceptual understanding',
        'ICSE - Strong focus on English and humanities subjects',
        'State Board - If you plan to apply for state colleges with arts specialization'
      ]
    },
    'Humanities': {
      recommendedStream: 'Arts/Humanities',
      alternateStream: 'Commerce',
      coreSubjects: 'History, Political Science, Sociology, English',
      optionalSubjects: 'Psychology or Economics',
      boardRecommendations: [
        'CBSE - Well-rounded curriculum with focus on conceptual understanding',
        'ICSE - Strong focus on English and humanities subjects',
        'State Board - If you plan to apply for state colleges with arts specialization'
      ]
    }
  };

  return streamMappings[primaryInterest] || streamMappings['Science'];
}

function generateClass12Results(primaryInterest: string) {
  const careerMappings: Record<string, any> = {
    'Science': {
      recommendedDegrees: [
        { name: 'B.Tech in Computer Science', description: 'Learn programming, algorithms, and software development' },
        { name: 'B.Sc in Physics', description: 'Study fundamental principles of physics and research' },
        { name: 'B.Tech in Electronics', description: 'Learn about electronic systems and circuit design' }
      ],
      careerPaths: [
        { name: 'Software Engineering', description: 'Develop and maintain software applications' },
        { name: 'Research Scientist', description: 'Conduct scientific research and experiments' },
        { name: 'Electronics Engineer', description: 'Design and develop electronic systems' }
      ],
      entranceExams: 'JEE Main, JEE Advanced, BITSAT',
      preparationTips: [
        'Focus on strengthening your mathematics and physics concepts',
        'Practice problem-solving regularly',
        'Take mock tests to improve time management',
        'Stay updated with the latest technological trends'
      ]
    },
    'Commerce': {
      recommendedDegrees: [
        { name: 'B.Com (Hons)', description: 'Study accounting, finance, and business management' },
        { name: 'BBA', description: 'Learn business administration and management principles' },
        { name: 'B.Com with CA', description: 'Combine commerce with chartered accountancy preparation' }
      ],
      careerPaths: [
        { name: 'Chartered Accountant', description: 'Handle financial accounting and auditing' },
        { name: 'Financial Analyst', description: 'Analyze financial data and market trends' },
        { name: 'Business Consultant', description: 'Provide business strategy and management advice' }
      ],
      entranceExams: 'CUET, IPMAT, SET',
      preparationTips: [
        'Develop strong mathematical and analytical skills',
        'Stay updated with current business news',
        'Practice logical reasoning and data interpretation',
        'Build communication and presentation skills'
      ]
    },
    'Arts': {
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
    },
    'Humanities': {
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
    }
  };

  return careerMappings[primaryInterest] || careerMappings['Science'];
}

function determinePersonalityType(assessmentType: 'class10' | 'class12', results: any): string {
  if (assessmentType === 'class10') {
    const streamToPersonalityMap: Record<string, string> = {
      'Science': 'analytical',
      'Commerce': 'enterprising',
      'Arts': 'artistic',
      'Humanities': 'social'
    };
    return streamToPersonalityMap[results.recommendedStream] || 'analytical';
  } else {
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
    
    const careerOrDegree = results.recommendedDegrees?.[0]?.name || 'analytical';
    let matchedPersonality = 'analytical';
    
    Object.entries(careerToPersonalityMap).forEach(([career, personality]) => {
      if (careerOrDegree.includes(career)) {
        matchedPersonality = personality;
      }
    });
    
    return matchedPersonality;
  }
}

function getFallbackData(assessmentType: 'class10' | 'class12') {
    if (assessmentType === 'class10') {
    return {
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
    return {
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
  }

// Function to share results with chat
export const shareResultsWithChat = (results: any, assessmentType: 'class10' | 'class12') => {
  try {
    // Format the results as a markdown message
    let resultMessage = `# Assessment Results\n\n`;
    
    if (assessmentType === 'class10') {
      resultMessage += `## Best Stream Option: ${results.recommendedStream}\n\n`;
      resultMessage += `### Core Subjects\n`;
      resultMessage += `- ${results.coreSubjects}\n\n`;
      resultMessage += `### Optional Subjects\n`;
      resultMessage += `- ${results.optionalSubjects}\n\n`;
      resultMessage += `### Alternative Option\n`;
      resultMessage += `- ${results.alternateStream}\n\n`;
      resultMessage += `### Board Recommendations\n`;
      results.boardRecommendations.forEach((rec: string) => {
        resultMessage += `- ${rec}\n`;
      });
    } else {
      resultMessage += `## Recommended Degree Options\n\n`;
      results.recommendedDegrees.forEach((degree: any) => {
        resultMessage += `### ${degree.name}\n`;
        resultMessage += `- ${degree.description}\n\n`;
      });
      
      resultMessage += `## Career Opportunities\n\n`;
      results.careerPaths.forEach((career: any) => {
        resultMessage += `### ${career.name}\n`;
        resultMessage += `- ${career.description}\n\n`;
      });
      
      resultMessage += `## Entrance Exams\n`;
      resultMessage += `- ${results.entranceExams}\n\n`;
      
      resultMessage += `## Preparation Tips\n`;
      results.preparationTips.forEach((tip: string) => {
        resultMessage += `- ${tip}\n`;
      });
    }
    
    resultMessage += `\nWould you like to know more about any specific aspect of these recommendations?`;
    
    // Get the chat section
    const chatSection = document.getElementById('chat');
    if (!chatSection) return;
    
    // Find the messages container
    const messagesContainer = chatSection.querySelector('.messages-container');
    if (!messagesContainer) return;
    
    // Create a new message element
    const messageElement = document.createElement('div');
    messageElement.className = 'message bot-message';
    messageElement.innerHTML = `
      <div class="message-content">
        <div class="message-text">
          <div class="markdown-content">
            ${resultMessage}
          </div>
        </div>
      </div>
    `;
    
    // Add the message to the container
    messagesContainer.appendChild(messageElement);
    
    // Scroll to the new message
    messageElement.scrollIntoView({ behavior: 'smooth' });
    
  } catch (error) {
    console.error("Error sharing results with chat:", error);
  }
};
