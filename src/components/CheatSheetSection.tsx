import React, { useEffect, useRef, useState } from "react";
import CodeBlock from "./CodeBlock";

interface CodeExample {
  title: string;
  code: string;
}

interface CheatSheetSectionProps {
  title: string;
  codeExamples: CodeExample[];
  className?: string;
}

const CheatSheetSection: React.FC<CheatSheetSectionProps> = ({
  title,
  codeExamples,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`mb-2 ${className} ${
        isVisible ? "animate-fade-up" : "opacity-0"
      }`}
      style={{ animationDelay: "0.2s" }}
    >
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-2">{title}</h2>
      </div>
      <div className="code-grid stagger-fade-in">
        {codeExamples.map((example, index) => (
          <CodeBlock key={index} title={example.title} code={example.code} />
        ))}
      </div>
    </section>
  );
};

export default CheatSheetSection;
