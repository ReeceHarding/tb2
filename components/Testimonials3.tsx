"use client";

import React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { animationVariants, createStaggerVariants } from "@/libs/animations";
import { VideoModal } from "./Modal";
import VideoTestimonials from "@/components/VideoTestimonials";



// Video testimonial component with YouTube integration (no images)
const VideoTestimonial = ({ 
  name, 
  quote, 
  videoUrl,
  sourceLink,
  role
}: { 
  name: string; 
  quote: string; 
  videoUrl?: string;
  sourceLink?: string;
  role?: string;
}) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const handlePlayClick = () => {
    if (videoUrl) {
      setIsVideoModalOpen(true);
    } else {
      console.warn(`[VideoTestimonial] No video URL provided for ${name}`);
    }
  };

  const handleSourceClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (sourceLink && sourceLink.includes('youtube.com')) {
      setIsVideoModalOpen(true);
    } else if (sourceLink) {
      window.open(sourceLink, '_blank', 'noopener,noreferrer');
    }
  };

  const content = (
    <figure className="relative h-full w-full max-w-[550px] p-6 rounded-xl border border-timeback-primary bg-white cursor-pointer hover:shadow-2xl transition-shadow duration-200">
      <blockquote className="relative">
        <div className="text-base xl:text-sm text-timeback-primary font-cal">
          <div className="space-y-2">
            <p>{quote}</p>
          </div>
        </div>
      </blockquote>
      <figcaption className="relative flex items-center justify-start gap-4 pt-4 mt-4 border-t border-timeback-primary/20">
        <div className="overflow-hidden rounded-full bg-timeback-bg shrink-0">
          <span className="w-10 h-10 rounded-full flex justify-center items-center text-lg font-medium bg-timeback-bg font-cal">
            {name.charAt(0)}
          </span>
        </div>
        <div className="w-full flex items-end justify-between gap-2">
          <div>
            <div className="text-sm font-medium text-timeback-primary font-cal">{name}</div>
            {role && (
              <div className="mt-0.5 text-sm text-timeback-primary/60 font-cal">{role}</div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {videoUrl && (
              <button 
                onClick={handlePlayClick}
                className="text-timeback-primary/40 hover:text-timeback-primary/60 transition-colors" 
                type="button" 
                title="Play video"
                aria-label="Play video testimonial"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            )}
            {sourceLink && (
              <div className="shrink-0">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 text-timeback-primary/40 hover:text-timeback-primary/60 transition-colors font-cal" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </figcaption>
    </figure>
  );

  return (
    <>
      <motion.li 
        className="break-inside-avoid max-md:flex justify-center"
        variants={animationVariants.fadeInUp}
        whileInView="animate"
        initial="initial"
        viewport={{ once: true, margin: "-50px" }}
      >
        {sourceLink ? (
          <a 
            href={sourceLink} 
            onClick={handleSourceClick}
            className="block w-full"
            aria-label={`View original testimonial from ${name}`}
            title="Click to view original source"
          >
            {content}
          </a>
        ) : (
          content
        )}
      </motion.li>

      {/* Video Modal */}
      {videoUrl && (
        <VideoModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoUrl={videoUrl}
          title={`${name} - Testimonial`}
        />
      )}
    </>
  );
};

// Text testimonial (no images - follows template exactly)
const TestimonialWithHighlight = ({
  name,
  text,
  highlight,
  role,
  sourceLink
}: {
  name: string;
  text: string;
  highlight?: string;
  role?: string;
  sourceLink?: string;
}) => {
  const content = (
    <figure className={`relative h-full w-full max-w-[550px] p-6 rounded-xl border border-timeback-primary bg-white ${sourceLink ? "cursor-pointer hover:shadow-2xl transition-shadow duration-200" : ""}`}>
      <blockquote className="relative">
        <div className="text-base xl:text-sm text-timeback-primary font-cal">
          <div className="space-y-2">
            {highlight ? (
              <p>
                <span className="bg-timeback-primary text-white px-0.5 font-cal">
                  {highlight}
                </span> {text}
              </p>
            ) : (
              <p>{text}</p>
            )}
          </div>
        </div>
      </blockquote>
      <figcaption className="relative flex items-center justify-start gap-4 pt-4 mt-4 border-t border-timeback-primary/20">
        <div className="overflow-hidden rounded-full bg-timeback-bg shrink-0">
          <span className="w-10 h-10 rounded-full flex justify-center items-center text-lg font-medium bg-timeback-bg font-cal">
            {name.charAt(0)}
          </span>
        </div>
        <div className="w-full flex items-end justify-between gap-2">
          <div>
            <div className="text-sm font-medium text-timeback-primary font-cal">{name}</div>
            {role && (
              <div className="mt-0.5 text-sm text-timeback-primary/60 font-cal">{role}</div>
            )}
          </div>
          {sourceLink && (
            <div className="shrink-0">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 text-timeback-primary/40 hover:text-timeback-primary/60 transition-colors font-cal" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          )}
        </div>
      </figcaption>
    </figure>
  );

  return (
    <motion.li 
      className="break-inside-avoid max-md:flex justify-center"
      variants={animationVariants.fadeInUp}
      whileInView="animate"
      initial="initial"
      viewport={{ once: true, margin: "-50px" }}
    >
      {sourceLink ? (
        <a 
          href={sourceLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full"
          aria-label={`View original testimonial from ${name}`}
          title="Click to view original source"
        >
          {content}
        </a>
      ) : (
        content
      )}
    </motion.li>
  );
};

// Simple text testimonial
const SimpleTestimonial = ({
  name,
  text,
  role,
  theme = "light",
  sourceLink
}: {
  name: string;
  text: string;
  role?: string;
  theme?: "light" | "dark";
  sourceLink?: string;
}) => {
  const content = (
    <figure 
              className={`relative h-full w-full max-w-[550px] p-6 rounded-xl border border-timeback-primary/20 ${
        theme === "dark" ? "bg-[#2d1e1a]" : "bg-white"
      } ${sourceLink ? "cursor-pointer hover:shadow-2xl transition-shadow duration-200" : ""}`}
    >
      <blockquote className="relative">
        <div className="text-base xl:text-sm text-timeback-primary font-cal">{text}</div>
      </blockquote>
      <figcaption className="relative flex items-center justify-start gap-4 pt-4 mt-4 border-t border-timeback-primary/20">
        <div className="overflow-hidden rounded-full bg-timeback-bg shrink-0">
          <span className="w-10 h-10 rounded-full flex justify-center items-center text-lg font-medium bg-timeback-bg font-cal">
            {name.charAt(0)}
          </span>
        </div>
        <div className="w-full flex items-end justify-between gap-2">
          <div>
            <div className="text-sm font-medium text-timeback-primary font-cal">{name}</div>
            {role && (
              <div className="mt-0.5 text-sm text-timeback-primary/60 font-cal">{role}</div>
            )}
          </div>
          {sourceLink && (
            <div className="shrink-0">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 text-timeback-primary/40 hover:text-timeback-primary/60 transition-colors font-cal" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          )}
        </div>
      </figcaption>
    </figure>
  );

  return (
    <motion.li 
      className="break-inside-avoid max-md:flex justify-center"
      variants={animationVariants.fadeInUp}
      whileInView="animate"
      initial="initial"
      viewport={{ once: true, margin: "-50px" }}
    >
      {sourceLink ? (
        <a 
          href={sourceLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full"
          aria-label={`View original testimonial from ${name}`}
          title="Click to view original source"
        >
          {content}
        </a>
      ) : (
        content
      )}
    </motion.li>
  );
};

const Testimonials3 = () => {
  // Animation variants for staggered content reveal
  const containerVariants = createStaggerVariants(0.1, 0.2);
  
  return (
    <section id="testimonials">
      <div className="py-24 px-4 max-w-7xl mx-auto">
        <motion.div 
          className="flex flex-col text-center w-full mb-20 font-cal"
          variants={animationVariants.fadeInUp}
          whileInView="animate"
          initial="initial"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="mb-8">
            <h2 className="sm:text-5xl text-4xl font-extrabold text-timeback-primary font-cal">
              Real Homeschool Families Using AI-Powered Personalized Learning
            </h2>
          </div>
          <p className="lg:w-2/3 mx-auto leading-relaxed text-base text-timeback-primary/80 font-cal">
            See how families transformed their children&apos;s education with TimeBack&apos;s AI tutoring system - achieving 99th percentile results in just 2 hours daily!
          </p>
        </motion.div>

        {/* Student Video Testimonials Section */}
        <motion.div 
          className="mb-16"
          variants={animationVariants.fadeInUp}
          whileInView="animate"
          initial="initial"
          viewport={{ once: true, margin: "-100px" }}
        >

          <VideoTestimonials 
            featuredOnly={true}
            limit={6}
            className="mb-8"
          />
        </motion.div>

        {/* Additional Testimonials from Press & Parents */}
        <motion.div 
          className="text-center mb-8"
          variants={animationVariants.fadeInUp}
          whileInView="animate"
          initial="initial"
          viewport={{ once: true, margin: "-100px" }}
        >
          <h3 className="text-2xl font-bold text-timeback-primary mb-4 font-cal">
            AI Tutoring Success Stories: What Homeschool Parents & Educators Are Saying
          </h3>
          <p className="text-timeback-primary/70 font-cal">
            Real testimonials about personalized learning transformation and academic achievement
          </p>
        </motion.div>

        <motion.ul
          role="list"
          className="max-w-7xl mx-auto md:columns-2 lg:columns-3 xl:columns-4 space-y-4 md:space-y-6 md:gap-6"
          variants={containerVariants}
          whileInView="animate"
          initial="initial"
          viewport={{ once: true, margin: "-50px" }}
        >
          {/* MacKenzie Price - Alpha School Co-founder - Fox News */}
          <SimpleTestimonial
            name="MacKenzie Price (Co-founder, Alpha School)"
            text="Our students are learning faster. They're learning way better. In fact, our classes are in the top 2% in the country."
            sourceLink="https://www.foxnews.com/us/ai-running-classroom-texas-school-students-say-its-awesome"
          />





          {/* Samantha Stinson - Parent NBC Interview */}
          <SimpleTestimonial
            name="Samantha Stinson (Parent)"
            text="I think artificial intelligence is kind of the future whether we like it or not. I think it's really personalized in that way. What's really incredible about artificial intelligence coming into the educational system is that it finally enables us to provide one-to-one personalized learning."
            sourceLink="https://www.nbcdfw.com/news/local/plano-ai-powered-school/3892529/"
          />











          {/* Anonymous Parent - Brownsville Campus Video */}
          <VideoTestimonial
            name="Anonymous Parent (Parent)"
            quote="The best experience that we have ever had in education. Kids who previously dreaded or made excuses to avoid school are now motivated and never want to miss a day."
            videoUrl="https://www.youtube.com/watch?v=Da9pAmD2CxQ"
            sourceLink="https://www.youtube.com/watch?v=Da9pAmD2CxQ"
          />

          {/* Anonymous Mother - Brownsville Campus */}
          <TestimonialWithHighlight
            name="Anonymous Mother (Parent)"
            text="I went through the local system myself, wanted something better for my daughter."
            highlight="A third-grader who is doing fifth-grade math"
            sourceLink="https://www.youtube.com/watch?v=Da9pAmD2CxQ"
          />

          {/* Anonymous Father - Parent Dashboard Video */}
          <VideoTestimonial
            name="Anonymous Father (Parent)"
            quote="Parents appreciate the detailed data and transparency provided through dashboards and MAP scores, which helps them stay connected to their children's daily progress and have more meaningful conversations about schoolwork."
            videoUrl="https://www.youtube.com/watch?v=yr4827hBhuI"
            sourceLink="https://www.youtube.com/watch?v=yr4827hBhuI"
          />



          {/* Christy Griswold - Texas Sports Academy Parent */}
          <TestimonialWithHighlight
            name="Christy Griswold (Parent)"
            text="They are only supposed to do two hours, but he brings home his laptop and I wake up every morning to him working on his laptop."
            highlight="We came to Texas Sports Academy because he is just an active kid and sitting in a traditional classroom we just saw him struggle"
            sourceLink="https://www.kxan.com/news/new-sports-academy-opens-in-lake-travis/"
          />

          {/* Jamal Gross - Texas Sports Academy Leader */}
          <TestimonialWithHighlight
            name="Jamal Gross (Chief Ambassador, Texas Sports Academy)"
            text="If we make learning more efficient, if we go from six hours of classroom work and shrink it down to a fraction of that, all the while not sacrificing academic achievement, but if anything enhancing it, then you get more hours to do life skills."
            highlight="Two-hour learning has been around for a decade now"
            sourceLink="https://www.kxan.com/news/new-sports-academy-opens-in-lake-travis/"
          />







          {/* Navin Kabra - Author Review */}
          <TestimonialWithHighlight
            name="Navin Kabra (Author)"
            text="Since they started in October my children have been marching through and mastering material roughly three times faster than their age-matched peers (and their own speed prior to the program)."
            sourceLink="https://futureiq.substack.com/p/understanding-alpha-school-can-we"
          />

          {/* MacKenzie Price - Forbes About Graduates */}
          <SimpleTestimonial
            name="MacKenzie Price (Founder, Alpha School)"
            text="Alpha graduates report feeling as well, if not better, prepared than their peers in college. They also note that they find it frustrating to spend hours sitting through traditional lectures when they have been conditioned to learn far more efficiently."
            sourceLink="https://www.forbes.com/sites/rayravaglia/2025/02/10/alpha-school-using-ai-to-unleash-students-and-transform-teaching/"
          />





          {/* Anonymous Parent - Called School a Miracle */}
          <VideoTestimonial
            name="Anonymous Parent (Parent)"
            quote="Called the school a 'miracle' for their energetic child."
            videoUrl="https://www.youtube.com/watch?v=Da9pAmD2CxQ"
            sourceLink="https://www.youtube.com/watch?v=Da9pAmD2CxQ"
          />

          {/* Anonymous Father - About Guides Support */}
          <VideoTestimonial
            name="Anonymous Father (Parent)"
            quote="They see the school's 'guides' as a 'super secret sauce,' providing crucial emotional and motivational support rather than just direct academic instruction. The parents feel the guides are personally invested in every student, fostering a belief in their own problem-solving abilities and encouraging them to become self-driven learners."
            videoUrl="https://www.youtube.com/watch?v=yr4827hBhuI"
            sourceLink="https://www.youtube.com/watch?v=yr4827hBhuI"
          />

          {/* Anonymous Father - About Dashboard Connection */}
          <VideoTestimonial
            name="Anonymous Father (Parent)"
            quote="One father values the dashboard for allowing him to see his son's daily lessons, which fosters a connection he wouldn't otherwise have."
            videoUrl="https://www.youtube.com/watch?v=yr4827hBhuI"
            sourceLink="https://www.youtube.com/watch?v=yr4827hBhuI"
          />
        </motion.ul>
      </div>
    </section>
  );
};

export default Testimonials3;
