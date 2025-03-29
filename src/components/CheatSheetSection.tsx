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
  const [visibleCards, setVisibleCards] = useState<boolean[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // セクションの初期表示時に各カードの可視性状態の配列を初期化
  useEffect(() => {
    setVisibleCards(new Array(codeExamples.length).fill(false));
    cardRefs.current = cardRefs.current.slice(0, codeExamples.length);
  }, [codeExamples.length]);

  useEffect(() => {
    const sectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          sectionObserver.unobserve(entry.target);
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    if (sectionRef.current) {
      sectionObserver.observe(sectionRef.current);
    }

    // カード個別の監視設定
    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = cardRefs.current.findIndex((ref) => ref === entry.target);
          if (index !== -1 && entry.isIntersecting) {
            setVisibleCards((prev) => {
              const newState = [...prev];
              newState[index] = true;
              return newState;
            });
            cardObserver.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.3,
      }
    );

    // 各カード要素を監視対象に追加
    cardRefs.current.forEach((ref) => {
      if (ref) {
        cardObserver.observe(ref);
      }
    });

    return () => {
      if (sectionRef.current) {
        sectionObserver.unobserve(sectionRef.current);
      }
      
      cardRefs.current.forEach((ref) => {
        if (ref) {
          cardObserver.unobserve(ref);
        }
      });
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
      <div className="code-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {codeExamples.map((example, index) => (
          <div
            key={index}
            ref={(el) => (cardRefs.current[index] = el)}
            className={visibleCards[index] ? "animate-fade-up" : "opacity-0"}
            style={{ animationDelay: `${0.1 * (index + 1)}s` }}
          >
            <CodeBlock title={example.title} code={example.code} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default CheatSheetSection;
