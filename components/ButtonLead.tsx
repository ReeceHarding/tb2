"use client";

import React, { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import apiClient from "@/libs/api";

// This component is used to collect the emails from the landing page
// You'd use this if your product isn't ready yet or you want to collect leads
// For instance: A popup to send a freebie, joining a waitlist, etc.
// It calls the /api/lead/route.js route and store a Lead document in the database
const ButtonLead = ({ extraStyle }: { extraStyle?: string }) => {
  const inputRef = useRef(null);
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();

    setIsLoading(true);
    try {
      await apiClient.post("/lead", { email });

      toast.success("Welcome to Timeback! We'll notify you when enrollment opens.");

      // just remove the focus on the input
      inputRef.current.blur();
      setEmail("");
      setIsDisabled(true);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form
      className={`w-full max-w-xs space-y-3 ${extraStyle ? extraStyle : ""}`}
      onSubmit={handleSubmit}
    >
      <input
        required
        type="email"
        value={email}
        ref={inputRef}
        autoComplete="email"
        placeholder="parent@example.com"
        className="w-full px-4 py-3 font-cal rounded-xl border-2 border-timeback-primary text-timeback-primary placeholder:text-timeback-primary placeholder:opacity-60 bg-white focus:outline-none focus:ring-4 focus:ring-timeback-primary focus:ring-opacity-30 focus:border-timeback-primary transition-all duration-200"
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        className="bg-white text-timeback-primary font-cal rounded-xl px-8 py-4 font-semibold shadow-2xl hover:shadow-2xl transition-all duration-200 hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-timeback-primary focus:ring-opacity-30 w-full disabled:opacity-50 disabled:cursor-not-allowed"
        type="submit"
        disabled={isDisabled}
      >
        Join waitlist
        {isLoading ? (
          <span className="loading loading-spinner loading-xs text-timeback-primary font-cal"></span>
        ) : (
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
        )}
      </button>
    </form>
  );
};

export default ButtonLead;
