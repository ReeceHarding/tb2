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
    question: "How can students really learn 2x the material in just 2 hours daily?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>The data from Alpha School proves it: students complete entire grade levels in 80 days instead of the traditional 180 days. Spring 2024 MAP results show students averaging 99th percentile scores.</p>
        <p>This works because personalized software eliminates classroom inefficiencies: no teaching to the middle, no waiting for others, no busy work. Every minute is focused 1-on-1 learning at exactly the right level.</p>
        <p>Results speak for themselves: The average student learns 6x faster. Top performers reach 12x speed. Even 7 boys who were 2 years behind caught up in just 6 months, advancing 13.8x faster than traditional school.</p>
      </div>
    ),
  },
  {
    question: "What about socialization and life skills?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>This is TimeBack&apos;s greatest advantage. With academics done in 2 hours, students have 4 hours daily for real life skills development - leadership, teamwork, public speaking, financial literacy, and entrepreneurship.</p>
        <p>Compare this to traditional schools where students sit silently in rows for 6 hours. TimeBack students engage in sports teams, workshops, and hands-on activities. They build deep friendships through shared interests.</p>
        <p>Data shows over 90% of students say they LOVE school. They&apos;re developing the critical life skills employers want while excelling academically.</p>
      </div>
    ),
  },
  {
    question: "How does learning work without teachers?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>We replaced the teacher-in-front-of-classroom model with personalized software delivering true 1-on-1 instruction - what Bloom&apos;s research proved most effective 40 years ago.</p>
        <p>The adaptive software identifies exactly what your child knows and doesn&apos;t know, then fixes learning gaps immediately. It&apos;s infinitely patient and adjusts difficulty in real time to maintain optimal learning speed.</p>
        <p>Human Guides provide motivation and emotional support - what humans do best. Example: An 8th grader performing at 5th grade level caught up completely in one year. Traditional classrooms could never provide this level of personalization.</p>
      </div>
    ),
  },
  {
    question: "Is this right for my child?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>TimeBack works beautifully for 80-90% of children. It&apos;s especially transformative for:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Advanced students who are bored in traditional school (often jump 3-4 grade levels)</li>
          <li>Students who&apos;ve fallen behind (like the 7 boys who caught up 2 years in 6 months)</li>
          <li>Children who learn at a different pace than the classroom average</li>
          <li>Kids pursuing serious interests (sports, arts, entrepreneurship)</li>
        </ul>
        <p>The key requirement? Parents who believe their children are capable of more than traditional schools allow. With 10 years of proven results at Alpha School, we know what works.</p>
      </div>
    ),
  },
  {
    question: "What are the actual results?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>Spring 2024 MAP test data from Alpha School:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Students average 99th percentile across all subjects</li>
          <li>Average student learns 6x faster (top 20% reach 12x)</li>
          <li>Students complete 2 grade levels in one year</li>
          <li>High schoolers average 1470+ SAT scores</li>
          <li>Graduates accepted to Stanford, Vanderbilt, USC</li>
          <li>Over 90% of students say they LOVE school</li>
        </ul>
        <p>These aren&apos;t cherry-picked stories. This is our average across 10 years and thousands of students. The data proves children are capable of far more than traditional schools allow.</p>
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
          <p className="inline-block font-semibold text-timeback-primary mb-4 font-cal">Personalized Learning & Homeschool Questions Answered</p>
          <h2 className="font-extrabold text-3xl md:text-5xl tracking-tight mb-6 bg-gradient-to-r from-timeback-primary via-timeback-primary to-timeback-primary bg-clip-text text-transparent font-cal">
            Everything you need to know about 2x learning in 2 hours daily
          </h2>
          <p className="text-lg md:text-xl text-timeback-primary max-w-2xl leading-relaxed font-cal">
            Discover how TimeBack helps students achieve 99th percentile results with proven adaptive technology
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
