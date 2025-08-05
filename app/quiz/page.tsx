import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import { QuizProvider } from "@/components/quiz/QuizContext";
import QuizFlow from "@/components/quiz/QuizFlow";
import { Suspense } from "react";
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

// Performance optimized loading component
function QuizPageLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-timeback-bg to-white flex items-center justify-center">
      <div className="text-center font-cal">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-timeback-primary mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-timeback-primary mb-2">Loading Quiz</h2>
        <p className="text-timeback-primary opacity-75">Preparing your personalized experience...</p>
      </div>
    </div>
  );
}

// Quiz page - provides quiz context (authentication optional for school finder)
export default async function QuizPage() {
  let session = null;
  
  try {
    session = await getServerSession(authOptions);
    console.log("[QuizPage] Session data:", session);
  } catch (error) {
    console.log("[QuizPage] Session retrieval failed, continuing without auth:", error);
  }

  // Preload critical resources for smoother experience
  const prefetchResources = () => {
    if (typeof window !== 'undefined') {
      // Preload common API endpoints
      fetch('/api/quiz/save', { method: 'HEAD' }).catch(() => {});
      fetch('/api/schools/search?q=test&limit=1', { method: 'HEAD' }).catch(() => {});
      
      console.log('[QuizPage] Prefetched critical resources for performance');
    }
  };

  return (
    <Suspense fallback={<QuizPageLoader />}>
      <QuizProvider>
        <QuizFlow />
        <script
          dangerouslySetInnerHTML={{
            __html: `(${prefetchResources.toString()})();`
          }}
        />
      </QuizProvider>
    </Suspense>
  );
}