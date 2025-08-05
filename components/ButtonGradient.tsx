"use client";

import React from "react";

const ButtonGradient = ({
  title = "Gradient Button",
  onClick = () => {},
}: {
  title?: string;
  onClick?: () => void;
}) => {
  return (
    <button 
      className="bg-timeback-gradient text-white font-cal rounded-xl px-8 py-4 font-semibold shadow-2xl hover:shadow-2xl transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-timeback-primary focus:ring-opacity-30 animate-shimmer" 
      onClick={onClick}
    >
      {title}
    </button>
  );
};

export default ButtonGradient;
