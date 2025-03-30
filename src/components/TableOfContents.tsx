import React, { useState, useEffect, useRef } from 'react';
// bundled-cheatsheet-data のインポートを削除
// import bundledCheatSheetData from '@/data/bundled-cheatsheet-data';
import { cn } from '@/lib/utils';

// Index.tsx で定義した型と同じものをインポートまたは定義
// ここでは仮に再定義します
interface SectionManifestItem {
  id: string;
  title: string;
}

interface TableOfContentsProps {
  sections: SectionManifestItem[]; // sections プロパティを追加
  className?: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ sections, className }) => { // props から sections を受け取る
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  // bundledCheatSheetData からの生成を削除
  // const sections = bundledCheatSheetData.map(({ id, title }) => ({ id, title }));
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionRefs = useRef<Map<string, HTMLElement | null>>(new Map());

  useEffect(() => {
    // Clear previous refs when sections change
    sectionRefs.current.clear();
    // props から渡された sections を使用
    sections.forEach(section => {
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
          if (top >= 0 && top < minTop) {
            minTop = top;
            topMostVisibleSectionId = entry.target.id;
          }
        }
      });

      if (topMostVisibleSectionId) {
        setActiveSectionId(topMostVisibleSectionId);
      }
    };

    observerRef.current = new IntersectionObserver(observerCallback, {
      rootMargin: '-10% 0px -80% 0px',
      threshold: 0,
    });

    const currentObserver = observerRef.current;

    // Observe elements after a short delay
    const timeoutId = setTimeout(() => {
        // props から渡された sections を使用
        sections.forEach(section => {
            const element = document.getElementById(section.id);
            if (element) {
                sectionRefs.current.set(section.id, element);
                currentObserver.observe(element);
            }
        });
    }, 100);


    return () => {
      clearTimeout(timeoutId);
      if (currentObserver) {
        currentObserver.disconnect();
      }
    };
  }, [sections]); // 依存配列を props の sections に変更

  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY; // window.scrollY を使用
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({ // window.scrollTo を使用
          top: offsetPosition,
          behavior: 'smooth'
      });
      setActiveSectionId(sectionId);
    }
  };

  return (
    <nav className={cn('sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto p-4 border-r hidden lg:block w-64', className)}>
      <h3 className="text-lg font-semibold mb-4 text-foreground">Table of Contents</h3>
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
                'block text-sm hover:text-primary transition-colors duration-200 py-1 px-2 rounded-md',
                activeSectionId === section.id ? 'text-primary bg-primary/10 font-medium' : 'text-muted-foreground hover:text-foreground'
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