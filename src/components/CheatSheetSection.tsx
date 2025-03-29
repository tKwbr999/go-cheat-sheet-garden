import React, { useEffect, useRef, useState } from "react";
import CodeBlock from "./CodeBlock";
import type { CheatSheetSection as SectionData, CodeExample } from "@/data/types";
import { Skeleton } from "@/components/ui/skeleton";

interface CheatSheetSectionProps {
  sectionData: SectionData & { id: string }; // 完全なデータを受け取る
  className?: string;
}

const CheatSheetSection: React.FC<CheatSheetSectionProps> = ({
  sectionData, // Props からデータを受け取る
  className = "",
}) => {
  const { id: sectionId, title, codeExamples } = sectionData; // データからIDとタイトルを取得

  // isVisible と visibleCards はアニメーション用
  const [isVisible, setIsVisible] = useState(false);
  const [visibleCards, setVisibleCards] = useState<boolean[]>(new Array(codeExamples.length).fill(false));
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>(new Array(codeExamples.length).fill(null));

  // isLoading や error、キャッシュ関連の state は不要

  // セクション全体のアニメーション用
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { root: null, rootMargin: "0px", threshold: 0.1 }
    );
    observer.observe(sectionRef.current);
    const currentRef = sectionRef.current;
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  // カード個別のアニメーション用
  useEffect(() => {
    // isVisible に依存して監視を開始
    if (!isVisible) return;

    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = cardRefs.current.findIndex((ref) => ref === entry.target);
          if (index !== -1 && entry.isIntersecting) {
            setVisibleCards((prev) => {
              if (prev[index]) return prev;
              const newState = [...prev];
              newState[index] = true;
              return newState;
            });
            cardObserver.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.3 }
    );

    // ref が設定されるのを待つ (シンプルな遅延)
    const timeoutId = setTimeout(() => {
        cardRefs.current.forEach((ref) => {
          if (ref) cardObserver.observe(ref);
        });
    }, 100);

    const currentCardRefs = [...cardRefs.current];
    return () => {
      clearTimeout(timeoutId);
      currentCardRefs.forEach((ref) => {
        if (ref) cardObserver.unobserve(ref);
      });
    };
  }, [isVisible]); // isVisible にのみ依存

  return (
    <section
      id={sectionId} // id 属性は維持
      ref={sectionRef}
      className={`mb-6 ${className} transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      // minHeight は不要になる (データが最初からあるため)
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">{title}</h2>
      </div>
      <div className="code-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* データは常に存在するので、ローディングやエラー表示は不要 */}
        {codeExamples.length > 0 ? (
          codeExamples.map((example, index) => (
            <div
              key={example.title + index}
              ref={(el) => (cardRefs.current[index] = el)}
              className={`transition-opacity duration-500 ${
                visibleCards[index] ? "opacity-100" : "opacity-0"
              }`}
              style={{ transitionDelay: `${0.05 * index}s` }}
            >
              <CodeBlock
                title={example.title}
                code={example.code}
                description={example.description}
              />
            </div>
          ))
        ) : (
           <div className="col-span-full text-muted-foreground">
             <p>No code examples available for this section.</p>
           </div>
        )}
      </div>
    </section>
  );
};

export default CheatSheetSection;
