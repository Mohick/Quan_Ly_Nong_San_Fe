"use client";

import React, { useRef } from "react";
import { ChevronDown } from "lucide-react";

const Banner = () => {
  const bannerRef = useRef<HTMLDivElement>(null);

  const scrollToNextSection = () => {
    if (bannerRef.current) {
      const nextElement = bannerRef.current.nextElementSibling;
      if (nextElement) {
        nextElement.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({
          top: window.innerHeight - 80,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <section
      ref={bannerRef}
      className="relative w-full overflow-hidden bg-gray-900 h-[33vh] min-h-[200px] md:h-[calc(100vh-85px)] md:min-h-[500px]"
    >
      <img
        src="/banner.png"
        alt="Banner Nông Sản"
        className="w-full h-full object-cover"
      />

      {/* Scroll Down Hint (Only visible on desktop/md layout) */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center">
        <button
          onClick={scrollToNextSection}
          className="hidden md:flex flex-col items-center text-white/75 hover:text-white transition-colors duration-200 animate-bounce cursor-pointer group/scroll"
        >
          <span className="text-[10px] uppercase font-bold tracking-widest mb-1 opacity-80 group-hover/scroll:opacity-100 transition-opacity">
            Cuộn xuống
          </span>
          <ChevronDown className="w-5 h-5 text-[#13a855]" />
        </button>
      </div>
    </section>
  );
};

export default Banner;
