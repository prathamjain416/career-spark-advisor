
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, GraduationCap, Book, TrendingUp, Clock, Award } from "lucide-react";

const careerPaths = [
  {
    id: 1,
    title: "Software Developer",
    category: "Technology",
    description: "Design, develop, and maintain software applications and systems.",
    education: ["B.Tech in Computer Science", "BCA", "B.Sc in Computer Science"],
    entranceExams: ["JEE Main", "CUET", "State Engineering Entrances"],
    skills: ["Programming", "Problem Solving", "Algorithms", "Software Design"],
    outlook: "Excellent growth potential with high demand across industries",
    timeframe: "4-5 years of education + continuous learning",
    salary: "₹5-25 LPA depending on experience and specialization"
  },
  {
    id: 2,
    title: "Data Scientist",
    category: "Technology",
    description: "Analyze and interpret complex data to help organizations make better decisions.",
    education: ["B.Tech + M.Tech", "B.Sc + M.Sc in Statistics/Math", "B.Tech + MBA"],
    entranceExams: ["JEE Main/Advanced", "CUET", "CAT/MAT for MBA"],
    skills: ["Statistics", "Machine Learning", "Programming", "Data Visualization"],
    outlook: "Rapidly growing field with opportunities across multiple sectors",
    timeframe: "5-6 years of education + specialization",
    salary: "₹8-30 LPA depending on experience and industry"
  },
  {
    id: 3,
    title: "Doctor",
    category: "Healthcare",
    description: "Diagnose and treat illnesses, injuries, and other health conditions.",
    education: ["MBBS", "MBBS + MD/MS", "MBBS + DNB"],
    entranceExams: ["NEET UG", "NEET PG", "AIIMS PG"],
    skills: ["Medical Knowledge", "Critical Thinking", "Communication", "Empathy"],
    outlook: "Stable career with consistent demand and public service opportunities",
    timeframe: "5.5 years (MBBS) + 3 years (specialization)",
    salary: "₹8-80 LPA depending on specialization and sector"
  },
  {
    id: 4,
    title: "UX/UI Designer",
    category: "Creative",
    description: "Design user experiences for websites, applications, and products.",
    education: ["Bachelor's in Design", "B.Tech + Certification", "Bachelor's in Any Field + Specialization"],
    entranceExams: ["UCEED", "NID DAT", "CEED"],
    skills: ["Visual Design", "User Research", "Prototyping", "Interaction Design"],
    outlook: "Growing demand with the expansion of digital products and services",
    timeframe: "3-4 years education + portfolio building",
    salary: "₹4-25 LPA depending on experience and company"
  },
  {
    id: 5,
    title: "Management Consultant",
    category: "Business",
    description: "Help organizations improve performance and solve business problems.",
    education: ["Bachelor's + MBA", "Engineering + MBA", "CA + MBA"],
    entranceExams: ["CAT", "XAT", "GMAT"],
    skills: ["Problem Solving", "Business Acumen", "Analytics", "Communication"],
    outlook: "Prestigious career path with high earning potential and diverse experiences",
    timeframe: "5-6 years of education including MBA",
    salary: "₹10-40 LPA depending on firm and experience"
  },
  {
    id: 6,
    title: "Civil Services Officer",
    category: "Government",
    description: "Implement and oversee government policies and programs.",
    education: ["Bachelor's Degree in Any Discipline", "Optional Master's"],
    entranceExams: ["UPSC CSE", "State PCS", "UPSC ESE for Engineering Services"],
    skills: ["Administration", "Leadership", "Public Policy", "Communication"],
    outlook: "Highly respected position with job security and social impact",
    timeframe: "3-4 years education + 1-3 years preparation",
    salary: "₹6-15 LPA plus benefits and allowances"
  }
];

const CareerSuggestions = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedCareer, setSelectedCareer] = useState(careerPaths[0]);

  const categories = ["All", "Technology", "Healthcare", "Creative", "Business", "Government"];
  
  const filteredCareers = activeCategory === "All" 
    ? careerPaths 
    : careerPaths.filter(career => career.category === activeCategory);

  return (
    <section id="careers" className="py-12 bg-white">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Explore Career Paths</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover detailed information about various career options, required education, and exam pathways
          </p>
        </div>
        
        <Tabs defaultValue="All" className="w-full" onValueChange={setActiveCategory}>
          <div className="flex justify-center mb-8">
            <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
              {categories.map(category => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <div className="grid md:grid-cols-12 gap-6">
            <div className="md:col-span-4">
              <div className="grid gap-2 h-[600px] overflow-y-auto pr-2">
                {filteredCareers.map((career) => (
                  <Card 
                    key={career.id} 
                    className={`cursor-pointer transition-all hover:border-blue-300 ${
                      selectedCareer.id === career.id ? 'border-blue-500 bg-blue-50/50' : ''
                    }`}
                    onClick={() => setSelectedCareer(career)}
                  >
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{career.title}</CardTitle>
                        <Badge variant="outline">{career.category}</Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {career.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
            
            <div className="md:col-span-8">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{selectedCareer.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {selectedCareer.description}
                      </CardDescription>
                    </div>
                    <Badge className="bg-blue-500">{selectedCareer.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                      <h3 className="font-medium">Educational Pathway</h3>
                    </div>
                    <ul className="pl-7 list-disc text-muted-foreground space-y-1">
                      {selectedCareer.education.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Book className="h-5 w-5 text-blue-600" />
                      <h3 className="font-medium">Entrance Exams</h3>
                    </div>
                    <ul className="pl-7 list-disc text-muted-foreground space-y-1">
                      {selectedCareer.entranceExams.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-blue-600" />
                      <h3 className="font-medium">Key Skills Required</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedCareer.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 pt-2">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Career Outlook</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{selectedCareer.outlook}</p>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Timeframe</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{selectedCareer.timeframe}</p>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Briefcase className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Salary Range</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{selectedCareer.salary}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    Chat with AI Counselor about {selectedCareer.title}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </Tabs>
      </div>
    </section>
  );
};

export default CareerSuggestions;
