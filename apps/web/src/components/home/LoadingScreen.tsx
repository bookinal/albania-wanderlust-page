import React, { useEffect, useState } from "react";

const LoadingScreen = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  
  const fullText = "BOOKinAL.";

  useEffect(() => {
    // Typing effect
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 120); // 120ms per character

    // Show the loading screen for a short time
    const timer1 = setTimeout(() => {
      setIsFadingOut(true);
    }, 2000); // 2s delay before starting fade out (allows time to finish typing)

    const timer2 = setTimeout(() => {
      setIsVisible(false);
    }, 2500); // 2.5s total (2s delay + 0.5s fade out animation)

    return () => {
      clearInterval(typingInterval);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (!isVisible) return null;

  const baseText = displayedText.replace(".", "");
  const hasDot = displayedText.includes(".");

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        zIndex: 9999,
        opacity: isFadingOut ? 0 : 1,
        transition: "opacity 0.5s ease-in-out",
      }}
    >
      <div
        className="font-black tracking-tight flex items-center"
        style={{
          fontFamily: "inherit",
          fontSize: "clamp(3rem, 5vw, 6rem)", // Responsive large text
          color: "#111115",
        }}
      >
        {baseText}
        {hasDot && <span style={{ color: "#E8192C" }}>.</span>}
        <span className="blinking-cursor" style={{ color: "#E8192C", marginLeft: "2px", fontWeight: "300" }}>|</span>
      </div>

      <style>{`
        .blinking-cursor {
          animation: blink 1s step-start infinite;
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
