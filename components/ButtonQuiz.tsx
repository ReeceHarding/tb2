"use client";

import { useRouter } from "next/navigation";

const ButtonQuiz = ({ extraStyle }: { extraStyle?: string }) => {
  const router = useRouter();

  const handleClick = () => {
    console.log("[ButtonQuiz] Button clicked - navigating to /quiz");
    router.push("/quiz");
  };

  return (
    <button
      className={`bg-white text-timeback-primary font-cal rounded-xl px-8 py-4 font-semibold shadow-2xl hover:shadow-2xl transition-all duration-200 hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-timeback-primary focus:ring-opacity-30 w-full max-w-md mx-auto lg:mx-0 ${extraStyle ? extraStyle : ""}`}
      onClick={handleClick}
    >
      <span className="inline-flex items-center gap-2">
        <span>Take the Quiz</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </button>
  );
};

export default ButtonQuiz;