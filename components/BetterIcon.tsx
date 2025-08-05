import React from "react";

// A better way to illustrate with icons
// Pass any SVG icon as children (recommended width/height : w-6 h-6)
// By default, it's using your primary color for styling
const BetterIcon = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-14 h-14 inline-flex items-center justify-center rounded-full bg-timeback-bg text-timeback-primary shadow-2xl hover:shadow-2xl transition-all duration-200 transform hover:scale-110 border border-timeback-primary font-cal">
      {children}
    </div>
  );
};

export default BetterIcon;
