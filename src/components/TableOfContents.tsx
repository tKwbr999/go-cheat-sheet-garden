import React, { useState, useEffect, useRef } from "react";
// bundled-cheatsheet-data のインポートを削除
// import bundledCheatSheetData from "@/data/bundled-cheatsheet-data";
import { cn } from "@/lib/utils";

// Index.tsx で定義した型と同じものをインポートまたは定義
interface SectionManifestItem {
  id: string;
  title: string;
}

interface TableOfContentsProps {
  sections: SectionManifestItem[]; // sections プロパティを追加
  className?: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({
  sections,
  className,
}) => {
  // props から sections を受け取る
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  // bundledCheatSheetData からの生成を削除
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionRefs = useRef<Map<string, HTMLElement | null>>(new Map());

  useEffect(() => {
    // Clear previous refs when sections change
    sectionRefs.current.clear();
    // props から渡された sections を使用
    sections.forEach((section) => {
      // Ensure elements are mounted before trying to get them
      const element = document.getElementById(section.id);
      if (element) {
        sectionRefs.current.set(section.id, element);
      }
    });

    // Disconnect previous observer if exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observerCallback: IntersectionObserverCallback = (entries) => {
      let topMostVisibleSectionId: string | null = null;
      let minTop = Infinity;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const top = entry.boundingClientRect.top;
          // Consider only sections starting at or below the top margin boundary
          // and find the one closest to the top edge (smallest non-negative top)
          if (top >= 0 && top < minTop) {
            minTop = top;
            topMostVisibleSectionId = entry.target.id;
          }
        }
      });

      // If no section is considered "topmost visible" (e.g., all are above the threshold or fully below)
      // Keep the last active ID or potentially find the last one scrolled past upwards.
      // For simplicity now, only update if a new topmost is found.
      if (topMostVisibleSectionId) {
        setActiveSectionId(topMostVisibleSectionId);
      }
      // Optional: Add logic here if you want to clear activeSectionId when scrolling above the first section
      // or keep the last active one when scrolling past the last section.
    };

    observerRef.current = new IntersectionObserver(observerCallback, {
      // Adjust rootMargin: top margin defines the "activation line"
      // Negative top margin means the line is inside the viewport from the top.
      // Large negative bottom margin means elements are considered "out" when far below.
      rootMargin: "-10% 0px -80% 0px", // Example: Activate when section top is 10% from viewport top
      threshold: 0, // Trigger as soon as the boundary is crossed
    });

    const currentObserver = observerRef.current; // Capture observer instance

    // Observe elements directly after observer is created
    // props から渡された sections を使用
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        sectionRefs.current.set(section.id, element); // Update ref map just in case
        currentObserver.observe(element);
      }
    });

    return () => {
      // clearTimeout(timeoutId); // setTimeout removed
      if (currentObserver) {
        currentObserver.disconnect();
      }
    };
  }, [sections]); // 依存配列を props の sections に変更

  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Calculate scroll position to account for sticky header height (adjust '5rem' as needed)
      const headerOffset = 80; // Example offset value in pixels, adjust based on your header's actual height
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSectionId(sectionId);
    }
  };

  return (
    <nav
      className={cn(
        "sticky h-[calc(100vh-5rem)] overflow-y-auto pt-0 pr-4 pb-4 pl-4 border-r hidden lg:block w-64", // feat/64 のクラス名を採用
        className
      )}
    >
      {/* Changed border-l to border-r */}
      <h3 className="text-lg font-semibold mb-4 text-foreground">
        {" "}
        {/* feat/64 のクラス名を採用 */}
        Table of Contents
      </h3>{" "}
      {/* Ensure text color contrast */}
      <ul className="space-y-2">
        {/* props から渡された sections を使用 */}
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleScrollToSection(section.id);
              }}
              className={cn(
                "block text-sm hover:text-primary transition-colors duration-200 py-1 px-2 rounded-md", // feat/64 のクラス名を採用
                activeSectionId === section.id
                  ? "text-primary bg-primary/10 font-medium" // feat/64 のクラス名を採用
                  : "text-muted-foreground hover:text-foreground" // feat/64 のクラス名を採用
              )}
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TableOfContents;
