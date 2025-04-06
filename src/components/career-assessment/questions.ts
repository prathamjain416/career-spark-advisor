
export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  category: string;
  options: Option[];
}

export const questions: Question[] = [
  {
    id: 1,
    text: "Which of these activities do you enjoy the most?",
    category: "interests",
    options: [
      { id: "a", text: "Solving mathematical problems" },
      { id: "b", text: "Creating art or designs" },
      { id: "c", text: "Helping others with their problems" },
      { id: "d", text: "Building or fixing things" }
    ]
  },
  {
    id: 2,
    text: "In a group project, which role do you prefer to take?",
    category: "personality",
    options: [
      { id: "a", text: "The leader who organizes everyone" },
      { id: "b", text: "The creative one who comes up with ideas" },
      { id: "c", text: "The supportive one who helps others" },
      { id: "d", text: "The analytical one who solves problems" }
    ]
  },
  {
    id: 3,
    text: "Which subject do you find most interesting?",
    category: "interests",
    options: [
      { id: "a", text: "Science (Physics, Chemistry, Biology)" },
      { id: "b", text: "Humanities (History, Literature, Languages)" },
      { id: "c", text: "Mathematics and Computing" },
      { id: "d", text: "Arts and Design" }
    ]
  },
  {
    id: 4,
    text: "How do you prefer to solve problems?",
    category: "personality",
    options: [
      { id: "a", text: "Analyze data and find patterns" },
      { id: "b", text: "Brainstorm creative solutions" },
      { id: "c", text: "Discuss with others to find consensus" },
      { id: "d", text: "Follow established procedures and methods" }
    ]
  },
  {
    id: 5,
    text: "What type of work environment do you prefer?",
    category: "preferences",
    options: [
      { id: "a", text: "Structured with clear guidelines" },
      { id: "b", text: "Flexible and changing" },
      { id: "c", text: "Collaborative with lots of teamwork" },
      { id: "d", text: "Independent where I can work alone" }
    ]
  }
];
