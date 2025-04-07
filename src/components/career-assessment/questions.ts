
export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  category: string;
  options: Option[];
  tier: 'class10' | 'class12';
  type: 'single' | 'multiple' | 'text'; // Added type property for different question types
}

export const questions: Question[] = [
  // Tier 1: Class 10 Assessment - Stream Selector
  {
    id: 1,
    text: "Which subjects do you enjoy the most?",
    category: "interests",
    options: [
      { id: "a", text: "Mathematics" },
      { id: "b", text: "Physics" },
      { id: "c", text: "Chemistry" },
      { id: "d", text: "Biology" },
      { id: "e", text: "Computer Science" },
      { id: "f", text: "History" },
      { id: "g", text: "Geography" },
      { id: "h", text: "Political Science" },
      { id: "i", text: "Economics" },
      { id: "j", text: "Languages & Literature" },
      { id: "k", text: "Art & Design" },
      { id: "l", text: "Music" },
      { id: "m", text: "Physical Education" },
      { id: "n", text: "Other" }
    ],
    tier: "class10",
    type: "multiple"
  },
  {
    id: 2,
    text: "Are you interested in how the human body works?",
    category: "interests",
    options: [
      { id: "a", text: "Very interested, I read about biology and health often" },
      { id: "b", text: "Somewhat interested in human biology and health" },
      { id: "c", text: "Only interested in specific aspects of human biology" },
      { id: "d", text: "Not particularly interested in biology or health sciences" }
    ],
    tier: "class10",
    type: "single"
  },
  {
    id: 3,
    text: "What are your hobbies or interests?",
    category: "interests",
    options: [
      { id: "a", text: "Reading/Writing" },
      { id: "b", text: "Sports/Fitness" },
      { id: "c", text: "Art/Drawing/Painting" },
      { id: "d", text: "Music/Playing instruments" },
      { id: "e", text: "Programming/Coding" },
      { id: "f", text: "Building/Making things" },
      { id: "g", text: "Debating/Public speaking" },
      { id: "h", text: "Social media/Content creation" },
      { id: "i", text: "Gaming" },
      { id: "j", text: "Community service/Volunteering" },
      { id: "k", text: "Cooking/Baking" },
      { id: "l", text: "Nature/Gardening" },
      { id: "m", text: "Other" }
    ],
    tier: "class10",
    type: "multiple"
  },
  {
    id: 4,
    text: "Additional interests (please specify)",
    category: "interests",
    options: [],
    tier: "class10",
    type: "text"
  },
  {
    id: 5,
    text: "How do you prefer to learn new information?",
    category: "learning_style",
    options: [
      { id: "a", text: "Reading books and articles" },
      { id: "b", text: "Watching videos or demonstrations" },
      { id: "c", text: "Hands-on practice and experiments" },
      { id: "d", text: "Listening to lectures or audiobooks" },
      { id: "e", text: "Group discussions and collaboration" },
      { id: "f", text: "Teaching others what I've learned" }
    ],
    tier: "class10",
    type: "multiple"
  },
  {
    id: 6,
    text: "What kind of books or articles do you prefer reading?",
    category: "interests",
    options: [
      { id: "a", text: "Science fiction/Fantasy" },
      { id: "b", text: "Mystery/Thriller" },
      { id: "c", text: "Biography/History" },
      { id: "d", text: "Science/Technology" },
      { id: "e", text: "Business/Finance" },
      { id: "f", text: "Self-help/Psychology" },
      { id: "g", text: "Comics/Graphic novels" },
      { id: "h", text: "Poetry/Literature" },
      { id: "i", text: "News/Current affairs" },
      { id: "j", text: "I don't enjoy reading" },
      { id: "k", text: "Other" }
    ],
    tier: "class10",
    type: "multiple"
  },
  
  // Tier 2: Class 12 Assessment - Degree & Career Path Finder
  {
    id: 7,
    text: "What stream did you study in 11th and 12th?",
    category: "background",
    options: [
      { id: "a", text: "Science (PCM - Physics, Chemistry, Math)" },
      { id: "b", text: "Science (PCB - Physics, Chemistry, Biology)" },
      { id: "c", text: "Science (PCMB - Physics, Chemistry, Math, Biology)" },
      { id: "d", text: "Commerce with Math" },
      { id: "e", text: "Commerce without Math" },
      { id: "f", text: "Arts/Humanities" },
      { id: "g", text: "Vocational" },
      { id: "h", text: "Other" }
    ],
    tier: "class12",
    type: "single"
  },
  {
    id: 8,
    text: "Are you currently preparing for any competitive exam?",
    category: "preparation",
    options: [
      { id: "a", text: "JEE (Engineering)" },
      { id: "b", text: "NEET (Medical)" },
      { id: "c", text: "CLAT (Law)" },
      { id: "d", text: "CUET/Other University Entrance Exams" },
      { id: "e", text: "CA Foundation" },
      { id: "f", text: "NDA" },
      { id: "g", text: "Design Entrance (NIFT/NID/UCEED)" },
      { id: "h", text: "State-level Engineering/Medical Exams" },
      { id: "i", text: "Not preparing for any specific exam" },
      { id: "j", text: "Other" }
    ],
    tier: "class12",
    type: "multiple"
  },
  {
    id: 9,
    text: "What are your hobbies or interests?",
    category: "interests",
    options: [
      { id: "a", text: "Reading/Writing" },
      { id: "b", text: "Sports/Fitness" },
      { id: "c", text: "Art/Drawing/Painting" },
      { id: "d", text: "Music/Playing instruments" },
      { id: "e", text: "Programming/Coding" },
      { id: "f", text: "Building/Making things" },
      { id: "g", text: "Debating/Public speaking" },
      { id: "h", text: "Social media/Content creation" },
      { id: "i", text: "Gaming" },
      { id: "j", text: "Community service/Volunteering" },
      { id: "k", text: "Cooking/Baking" },
      { id: "l", text: "Nature/Gardening" },
      { id: "m", text: "Other" }
    ],
    tier: "class12",
    type: "multiple"
  },
  {
    id: 10,
    text: "Additional interests (please specify)",
    category: "interests",
    options: [],
    tier: "class12",
    type: "text"
  },
  {
    id: 11,
    text: "What type of work environment do you prefer?",
    category: "preferences",
    options: [
      { id: "a", text: "Corporate/Private sector" },
      { id: "b", text: "Government/Public sector" },
      { id: "c", text: "Research/Academic environment" },
      { id: "d", text: "Healthcare/Hospital setting" },
      { id: "e", text: "Freelance/Self-employed" },
      { id: "f", text: "Startup/Entrepreneurial setting" },
      { id: "g", text: "Non-profit/NGO" },
      { id: "h", text: "Field work/Outdoor environment" },
      { id: "i", text: "Creative studio/Agency" },
      { id: "j", text: "Remote/Work from home" }
    ],
    tier: "class12",
    type: "multiple"
  },
  {
    id: 12,
    text: "What are your location preferences for study/work?",
    category: "preferences",
    options: [
      { id: "a", text: "Major metro cities (Delhi, Mumbai, Bangalore, etc.)" },
      { id: "b", text: "Tier 2 cities (Pune, Jaipur, Lucknow, etc.)" },
      { id: "c", text: "Smaller towns" },
      { id: "d", text: "Rural areas" },
      { id: "e", text: "Abroad/International" },
      { id: "f", text: "No specific preference - flexible with location" },
      { id: "g", text: "Other" }
    ],
    tier: "class12",
    type: "multiple"
  }
];
