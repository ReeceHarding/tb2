import { redirect } from "next/navigation";
import { getSEOTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: "Find Your Perfect Homeschool Curriculum | TimeBack Learning Assessment",
  description: "Discover how TimeBack's AI-powered personalized learning can help your child achieve 99th percentile performance. Take our free assessment to see how 2-hour school days transform education.",
  keywords: [
    "homeschool assessment",
    "learning evaluation", 
    "student placement test",
    "personalized learning quiz",
    "AI tutoring assessment",
    "homeschool curriculum finder",
    "educational assessment",
    "learning style quiz"
  ],
  canonicalUrlRelative: "/quiz",
});

export const dynamic = "force-dynamic";

// Quiz page now redirects to the new personalized experience
export default async function QuizPage() {
  // Automatic redirect to the new personalized page
  redirect("/personalized");
}