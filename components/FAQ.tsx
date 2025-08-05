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
    question: "How can kids really learn 2x faster?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>This approach is based on 40+ years of learning science research, particularly Benjamin Bloom&#39;s 2 Sigma Problem, which found that students with 1:1 tutoring perform two standard deviations better than traditional classroom students.</p>
        <p>Traditional classrooms can&#39;t provide 1:1 tutoring or true mastery-based learning. Our AI tutors can. When children get personalized instruction at their exact level and master each concept before moving on, they naturally learn much faster.</p>
        <p>Our MAP test scores prove it: children average in the top 1-2% nationally across all subjects. These are standardized tests taken by millions—the results are real and verified.</p>
      </div>
    ),
  },
  {
    question: "But what about socialization without traditional classrooms?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>Timeback children are actually MORE social than traditional school students, not less.</p>
        <p>Think about it—in traditional school, kids sit quietly in rows for 6+ hours. With Timeback, they finish academics by lunch and spend 4+ hours in group activities: sports teams, drama clubs, robotics, debate, and real collaborative projects.</p>
        <p>Instead of rushed 20-minute recesses, they have genuine time to build deep friendships through shared interests. Parents consistently report their kids are happier and have stronger social skills than before.</p>
      </div>
    ),
  },
  {
    question: "How does it work without teachers?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>We don&#39;t have traditional teachers lecturing at the front of a classroom—we have something better: Guides who mentor and motivate.</p>
        <p>Each child works with an AI tutor that provides personalized 1:1 instruction, instantly identifying and addressing learning gaps. The AI never gets frustrated, never judges, and adapts perfectly to each child&#39;s pace.</p>
        <p>Our human Guides focus on what humans do best: inspiring, encouraging, and helping students develop as whole people. They&#39;re there for emotional support, motivation, and ensuring every child becomes a confident, self-driven learner.</p>
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
          <li>90% of children say they LOVE school (compared to national average of 20%)</li>
        </ul>
        <p>These aren&apos;t cherry-picked success stories. This is our average. Every child deserves to reach their full potential—Timeback just makes it possible.</p>
      </div>
    ),
  },
  {
    question: "How do I know if my child is actually learning?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>You&apos;ll have more visibility into your child&apos;s education than ever before. Our parent dashboard shows:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Real-time progress in every subject</li>
          <li>Exact grade level placement (many parents discover their &quot;on-track&quot; child is actually behind)</li>
          <li>Daily learning efficiency metrics</li>
          <li>MAP test results three times per year</li>
          <li>Time spent on each subject and concept mastery rates</li>
        </ul>
        <p>No more wondering what &quot;B+&quot; actually means. You&apos;ll see exactly what your child knows, where they&apos;re excelling, and where they need support—updated daily.</p>
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
          <p className="sm:text-4xl text-3xl font-extrabold text-timeback-primary font-cal">
            Everything you need to know about AI-powered personalized learning and homeschool curriculum.
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
