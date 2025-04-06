
export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  category: string;
  options: Option[];
  tier: 'class10' | 'class12'; // Added tier property
}

export const questions: Question[] = [
  // Tier 1: Class 10 Assessment - Stream Selector
  {
    id: 1,
    text: "Do you enjoy solving mathematical problems?",
    category: "interests",
    options: [
      { id: "a", text: "Very much, I find math interesting and engaging" },
      { id: "b", text: "Somewhat, I can solve them but don't always enjoy it" },
      { id: "c", text: "Not really, I find math challenging" },
      { id: "d", text: "Not at all, I avoid math whenever possible" }
    ],
    tier: "class10"
  },
  {
    id: 2,
    text: "Are you interested in how the human body works?",
    category: "interests",
    options: [
      { id: "a", text: "Very interested, I read about biology often" },
      { id: "b", text: "Somewhat interested in basic human biology" },
      { id: "c", text: "Only interested in specific aspects" },
      { id: "d", text: "Not particularly interested in biology" }
    ],
    tier: "class10"
  },
  {
    id: 3,
    text: "How do you feel about writing essays or debating topics?",
    category: "interests",
    options: [
      { id: "a", text: "I enjoy expressing my thoughts through writing and speaking" },
      { id: "b", text: "I'm comfortable with it but don't seek it out" },
      { id: "c", text: "I can do it when necessary but find it challenging" },
      { id: "d", text: "I avoid writing and public speaking whenever possible" }
    ],
    tier: "class10"
  },
  {
    id: 4,
    text: "Would you enjoy running a business or managing finances?",
    category: "interests",
    options: [
      { id: "a", text: "Very much, I'm already thinking about business ideas" },
      { id: "b", text: "I find the concept interesting but haven't explored it much" },
      { id: "c", text: "I'm not opposed to it but it's not my first choice" },
      { id: "d", text: "Not interested in business or financial management" }
    ],
    tier: "class10"
  },
  {
    id: 5,
    text: "How do you approach solving new problems?",
    category: "personality",
    options: [
      { id: "a", text: "I analyze data and look for patterns systematically" },
      { id: "b", text: "I try creative solutions and think outside the box" },
      { id: "c", text: "I ask others for their input and collaborate" },
      { id: "d", text: "I look for established methods that have worked before" }
    ],
    tier: "class10"
  },
  
  // Tier 2: Class 12 Assessment - Degree & Career Path Finder
  {
    id: 6,
    text: "Are you currently preparing for any competitive exam?",
    category: "preparation",
    options: [
      { id: "a", text: "Yes, JEE (Engineering)" },
      { id: "b", text: "Yes, NEET (Medical)" },
      { id: "c", text: "Yes, CUET or other entrance exams" },
      { id: "d", text: "No, not preparing for any specific exam" }
    ],
    tier: "class12"
  },
  {
    id: 7,
    text: "What type of work environment do you prefer?",
    category: "preferences",
    options: [
      { id: "a", text: "Corporate/private sector" },
      { id: "b", text: "Government/public sector" },
      { id: "c", text: "Research/academic environment" },
      { id: "d", text: "Freelance/entrepreneurial setting" }
    ],
    tier: "class12"
  },
  {
    id: 8,
    text: "Which of these activities do you enjoy the most?",
    category: "skills",
    options: [
      { id: "a", text: "Coding or working with technology" },
      { id: "b", text: "Designing or creative pursuits" },
      { id: "c", text: "Teaching or helping others learn" },
      { id: "d", text: "Managing projects or leading teams" }
    ],
    tier: "class12"
  },
  {
    id: 9,
    text: "What stream did you study in 11th and 12th?",
    category: "background",
    options: [
      { id: "a", text: "Science (PCM/PCB)" },
      { id: "b", text: "Commerce" },
      { id: "c", text: "Arts/Humanities" },
      { id: "d", text: "Vocational" }
    ],
    tier: "class12"
  },
  {
    id: 10,
    text: "How comfortable are you working under pressure or tight deadlines?",
    category: "personality",
    options: [
      { id: "a", text: "Very comfortable, I thrive under pressure" },
      { id: "b", text: "Moderately comfortable, I can manage it" },
      { id: "c", text: "Somewhat uncomfortable, I prefer steady pace" },
      { id: "d", text: "Very uncomfortable, I avoid high-pressure situations" }
    ],
    tier: "class12"
  }
];
