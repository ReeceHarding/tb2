import { Suspense } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import HowTimebackWorks from "@/components/HowTimebackWorks";
import WithWithout from "@/components/WithWithout";
import FeaturesListicle from "@/components/FeaturesListicle";
import Testimonials3 from "@/components/Testimonials3";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { getSEOTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: "TimeBack - Personalized Learning Software | 99th Percentile in 2 Hours Daily",
  description: "Personalized education software that condenses academics from 6 hours to just 2 hours daily. Students achieve 99th percentile MAP test scores. Proven by Alpha School with 10 years of success. Join thousands of homeschool families.",
  keywords: [
    "personalized learning",
    "adaptive education software",
    "homeschool curriculum", 
    "2 hour school day",
    "99th percentile",
    "MAP test scores",
    "Alpha School",
    "online learning",
    "K-12 education",
    "mastery learning",
    "educational technology",
    "TimeBack"
  ],
  canonicalUrlRelative: "/",
});

export default function Page() {
  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      
      <main>
        {/* Hero - Hook visitors who've never heard of Timeback */}
        <Hero />
        
        {/* Problem - What is Timeback? */}
        <Problem />
        
        {/* How Timeback Works - Six breakthrough innovations */}
        <HowTimebackWorks />
        
        {/* Features - Key benefits of Timeback (Learning Science) */}
        <FeaturesListicle />
        
        {/* WithWithout - Show the transformation (Comparison Table) */}
        <WithWithout />
        
        {/* Testimonials - Real results that seem too good to be true */}
        <Testimonials3 />
        
        {/* FAQ - Address common concerns */}
        <FAQ />
        
        {/* CTA - Join the waitlist */}
        <CTA />
      </main>
      
      <Footer />
    </>
  );
}
