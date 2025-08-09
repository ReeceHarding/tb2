"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { animationVariants, createStaggerVariants } from "@/libs/animations";
import type { JSX } from "react";

// <FAQ> component is a lsit of <Item> component
// Just import the FAQ & add your FAQ content to the const faqList arrayy below.

interface FAQItemProps {
  question: string;
  answer: JSX.Element;
}

const faqList: FAQItemProps[] = [
  {
    question: "How can students really learn 2x the material in just 2 hours a day?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>It sounds impossible because traditional schools have conditioned us to accept inefficiency. But the data is clear: students complete entire grade levels in ~80 days instead of 180.</p>
        <p>This works because we eliminated everything that wastes time in traditional schools: teaching to the middle, waiting for slower students, busy work, and inefficient group instruction. Every minute is personalized 1:1 learning at exactly the right level.</p>
        <p>Alpha School has proven this for 10 years. Students average 99th percentile on MAP tests. The average student learns at least 6x faster, with top performers nearing 12x. Even students who were 2 years behind caught up in just 6 months.</p>
      </div>
    ),
  },
  {
    question: "What about socialization and life skills?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>This is TimeBack&apos;s greatest advantage - not a weakness. Traditional school kids sit silently in rows for 6+ hours. Our students finish academics by 10am and spend 4 hours developing real life skills.</p>
        <p>They engage in leadership workshops, sports teams, entrepreneurship projects, public speaking, financial literacy, and hands-on activities. They build deep friendships through shared interests, not forced proximity.</p>
        <p>Over 90% of TimeBack students say they LOVE school. They&apos;re developing the life skills employers actually want while traditional students are still doing worksheets.</p>
      </div>
    ),
  },
  {
    question: "How does learning work without teachers?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>We eliminated the broken teacher-in-front-of-classroom model that Bloom&#39;s research proved ineffective 40 years ago. Instead, each child gets their own AI tutor delivering true 1:1 personalized instruction.</p>
        <p>The AI identifies exactly what your child knows and doesn&apos;t know, then fixes learning gaps immediately. It&apos;s infinitely patient, never judges, and adjusts difficulty in real time to maintain optimal learning speed.</p>
        <p>Human Guides provide motivation and emotional support - what humans do best. This is why an 8th grader who was secretly performing at 5th grade level caught up completely in one year. Traditional teachers could never provide this level of personalization.</p>
      </div>
    ),
  },
  {
    question: "Is this right for my child?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>Timeback works beautifully for 80-90% of children. It&apos;s especially transformative for:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Bright kids who are bored and unchallenged in traditional school</li>
          <li>Children who&apos;ve fallen behind and need to catch up</li>
          <li>Children who learn at a different pace than the classroom average</li>
          <li>Kids who want time for serious pursuits (sports, arts, etc.)</li>
        </ul>
        <p>The key requirement? A motivated child and parents who believe their kids are capable of more than the traditional system allows. If you&apos;re reading this, that&apos;s probably you.</p>
      </div>
    ),
  },
  {
    question: "What are the actual results?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>Let the data speak for itself:</p>
        <ul className="list-disc list-inside space-y-1">
                  <li>Average child scores in the 99th percentile on MAP tests</li>
        <li>Children who were 2 years behind caught up in 6 months</li>
          <li>High schoolers average 1470+ on SATs</li>
          <li>Graduates accepted to Stanford, Vanderbilt, USC, and other top universities</li>
          <li>Over 90% of children say they LOVE school</li>
        </ul>
        <p>These aren&apos;t cherry picked success stories. This is our average. Every child deserves to reach their full potential - Timeback just makes it possible.</p>
      </div>
    ),
  },
  {
    question: "How do I know if my child is actually learning?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>You&apos;ll have more visibility into your child&apos;s education than ever before. Our parent dashboard shows:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Real time progress in every subject</li>
          <li>Exact grade level placement (many parents discover their &quot;on-track&quot; child is actually behind)</li>
          <li>Daily learning efficiency metrics</li>
          <li>MAP test results three times per year</li>
          <li>Time spent on each subject and concept mastery rates</li>
        </ul>
        <p>No more wondering what &quot;B+&quot; actually means. You&apos;ll see exactly what your child knows, where they&apos;re excelling, and where they need support - updated daily.</p>
      </div>
    ),
  },
];

const FaqItem = ({ item }: { item: FAQItemProps }) => {
  const accordion = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.li
      variants={animationVariants.fadeInUp}
      whileInView="animate"
      initial="initial"
      viewport={{ once: true, margin: "-50px" }}
    >
      <button
        className="relative flex gap-2 items-center w-full py-5 text-base font-semibold text-left border-t md:text-lg border-timeback-primary/20 font-cal"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
      >
        <span
          className={`flex-1 text-timeback-primary ${isOpen ? "text-timeback-primary" : ""}`}
        >
          {item?.question}
        </span>
        <svg
          className={`flex-shrink-0 w-4 h-4 ml-auto fill-current`}
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center transition duration-200 ease-out ${
              isOpen && "rotate-180"
            }`}
          />
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center rotate-90 transition duration-200 ease-out ${
              isOpen && "rotate-180 hidden"
            }`}
          />
        </svg>
      </button>

      <div
        ref={accordion}
        className={`transition-all duration-300 ease-in-out opacity-80 overflow-hidden`}
        style={
          isOpen
            ? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
            : { maxHeight: 0, opacity: 0 }
        }
      >
        <div className="pb-5 leading-relaxed">{item?.answer}</div>
      </div>
    </motion.li>
  );
};

const FAQ = () => {
  // Animation variants for staggered content reveal
  const containerVariants = createStaggerVariants(0.1, 0.2);
  
  return (
    <section className="bg-timeback-bg" id="faq">
      <div className="py-24 px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
        <motion.div 
          className="flex flex-col text-left basis-1/2 font-cal"
          variants={animationVariants.fadeInLeft}
          whileInView="animate"
          initial="initial"
          viewport={{ once: true, margin: "-100px" }}
        >
          <p className="inline-block font-semibold text-timeback-primary mb-4 font-cal">AI Tutoring & Homeschool Questions Answered</p>
          <h2 className="font-extrabold text-3xl md:text-5xl tracking-tight mb-6 bg-gradient-to-r from-timeback-primary via-timeback-primary to-timeback-primary bg-clip-text text-transparent font-cal">
            Everything you need to know about AI-powered personalized learning
          </h2>
          <p className="text-lg md:text-xl text-timeback-primary max-w-2xl leading-relaxed font-cal">
            Discover how our homeschool curriculum helps children achieve academic excellence
          </p>
        </motion.div>

        <motion.ul 
          className="basis-1/2"
          variants={containerVariants}
          whileInView="animate"
          initial="initial"
          viewport={{ once: true, margin: "-50px" }}
        >
          {faqList.map((item, i) => (
            <FaqItem key={i} item={item} />
          ))}
        </motion.ul>
      </div>
    </section>
  );
};

export default FAQ;
