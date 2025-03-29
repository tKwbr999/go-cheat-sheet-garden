import React, { useState, useEffect, useRef } from 'react';
// bundled-cheatsheet-data から直接インポート
import bundledCheatSheetData from '@/data/bundled-cheatsheet-data';
import { cn } from '@/lib/utils'; // Assuming you have a utility for class names

interface TableOfContentsProps {
  className?: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ className }) => {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  // メタデータのみを抽出
  const sections = bundledCheatSheetData.map(({ id, title }) => ({ id, title }));
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionRefs = useRef<Map<string, HTMLElement | null>>(new Map());

  useEffect(() => {
    // Clear previous refs when sections change (though unlikely in this case)
    sectionRefs.current.clear();
    sections.forEach(section => {
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
      // Find the section closest to the top of the viewport among intersecting ones
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
      rootMargin: '-10% 0px -80% 0px', // Example: Activate when section top is 10% from viewport top
      threshold: 0, // Trigger as soon as the boundary is crossed
    });

    const currentObserver = observerRef.current; // Capture observer instance

    // Observe elements after a short delay to ensure they are in the DOM
    const timeoutId = setTimeout(() => {
        sections.forEach(section => {
            const element = document.getElementById(section.id);
            if (element) {
                sectionRefs.current.set(section.id, element); // Update ref map just in case
                currentObserver.observe(element);
            }
        });
    }, 100); // Delay to ensure DOM elements are ready


    return () => {
      clearTimeout(timeoutId);
      if (currentObserver) {
        currentObserver.disconnect();
      }
    };
  }, [sections]); // Re-run effect if sections data changes

  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Calculate scroll position to account for sticky header height (adjust '5rem' as needed)
      const headerOffset = 80; // Example offset value in pixels, adjust based on your header's actual height
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
      });
      // Manually set active section after click for immediate feedback
      setActiveSectionId(sectionId);
    }
  };

  return (
    <nav className={cn('sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto p-4 border-r hidden lg:block w-64', className)}> {/* Changed border-l to border-r */}
      <h3 className="text-lg font-semibold mb-4 text-foreground">Table of Contents</h3> {/* Ensure text color contrast */}
      <ul className="space-y-2">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleScrollToSection(section.id);
              }}
              className={cn(
                'block text-sm hover:text-primary transition-colors duration-200 py-1 px-2 rounded-md', // Add padding and rounding
                activeSectionId === section.id ? 'text-primary bg-primary/10 font-medium' : 'text-muted-foreground hover:text-foreground' // Adjust active/hover styles
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