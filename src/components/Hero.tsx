
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Award, Compass } from "lucide-react";

const Hero = () => {
  return (
    <section className="py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-blue-50">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-4">
            <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800 mb-4">
              AI-Powered Career Guidance
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
              Discover Your <span className="gradient-text">Perfect Career</span> Path
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl">
              Personalized career guidance powered by AI. Find the perfect educational path, 
              prepare for entrance exams, and plan your future with confidence.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" className="gap-1.5">
                Start Assessment
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
                Chat with AI Counselor
              </Button>
            </div>
          </div>
          <div className="mx-auto max-w-[520px] lg:mx-0 lg:pr-8">
            <div className="aspect-video overflow-hidden rounded-xl bg-white shadow-lg">
              <div className="p-6 grid gap-4">
                <div className="flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Personalized Assessments</h3>
                    <p className="text-sm text-muted-foreground">Discover your strengths and interests</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <Compass className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Career Suggestions</h3>
                    <p className="text-sm text-muted-foreground">Get tailored career recommendations</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                    <Award className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Exam Guidance</h3>
                    <p className="text-sm text-muted-foreground">Prepare for entrance exams effectively</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
