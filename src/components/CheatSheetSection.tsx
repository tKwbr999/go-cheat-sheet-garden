
import React, { useEffect, useRef, useState } from 'react';
import CodeBlock from './CodeBlock';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  className = ""
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
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
        rootMargin: '0px',
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
      className={`mb-16 ${className} ${isVisible ? 'animate-fade-up' : 'opacity-0'}`} 
      style={{ animationDelay: '0.2s' }}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <div className="flex items-center justify-between">
          <h2 className="section-title mb-0">{title}</h2>
          <CollapsibleTrigger asChild>
            <button className="p-2 hover:bg-muted rounded-full transition-colors">
              {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="mt-4">
          <div className="code-grid stagger-fade-in">
            {codeExamples.map((example, index) => (
              <CodeBlock
                key={index}
                title={example.title}
                code={example.code}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
};

export default CheatSheetSection;
