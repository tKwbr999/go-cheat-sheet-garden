import React, { useState, useEffect, useRef } from "react";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import hljs from 'highlight.js/lib/core'; // Import highlight.js core
import go from 'highlight.js/lib/languages/go'; // Import Go language definition
// Import highlight.js themes - Ideally, these should be imported globally (e.g., in main.tsx or index.css)
// and managed with Tailwind's dark mode, but importing here for simplicity first.
import 'highlight.js/styles/atom-one-light.css';
import 'highlight.js/styles/atom-one-dark.css';

// Register the Go language
hljs.registerLanguage('go', go);

interface CodeBlockProps {
  title: string;
  code: string;
  description?: string;
  language?: string; // Keep language prop, though hljs might auto-detect
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  title,
  code,
  description,
  language = "go", // Default language hint for hljs
  className = "",
}) => {
  const [hasCopied, setHasCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const codeRef = useRef<HTMLElement>(null); // Ref for the <code> element
  const { toast } = useToast();
  const [themeClass, setThemeClass] = useState('hljs-light'); // State to manage theme class

  // --- highlight.js Highlighting Logic ---
  useEffect(() => {
    // Function to apply highlighting
    const applyHighlight = () => {
      if (codeRef.current) {
        hljs.highlightElement(codeRef.current);
      }
    };

    // Apply highlight when component mounts or code/language changes
    applyHighlight();

    // Determine theme based on dark mode class
    const isDarkMode = document.documentElement.classList.contains('dark');
    setThemeClass(isDarkMode ? 'hljs-dark' : 'hljs-light'); // Use generic classes for switching

    // Optional: Observer for theme changes
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      setThemeClass(isDark ? 'hljs-dark' : 'hljs-light');
      // Re-apply highlighting might be needed if themes drastically change structure
      // applyHighlight(); // Usually not needed if themes only change colors
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect(); // Cleanup observer

  }, [code, language]); // Rerun effect if code or language changes
  // --- End highlight.js Highlighting Logic ---

  // Removed the old highlightCode function

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setHasCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "The code has been copied to your clipboard.",
        duration: 2000,
      });
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast({
        title: "Failed to copy",
        description: "Could not copy code to clipboard.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  // Render code block content, including description if available
  const renderCodeContent = () => (
    // Apply the theme class to the CardContent
    <CardContent className={`code-content relative p-0 font-mono rounded-b-lg overflow-hidden ${themeClass}`}>
      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 text-muted-foreground bg-card/80 hover:text-foreground transition-colors rounded-md z-10 backdrop-blur-sm"
        aria-label="Copy code"
      >
        {hasCopied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      {/* Use <pre><code> structure for highlight.js */}
      <pre className="overflow-x-auto p-4 text-sm"> {/* Added padding here */}
        <code ref={codeRef} className={`language-${language}`}>
          {code.trim()} {/* Trim trailing newline */}
        </code>
      </pre>
      {/* Render description below code if it exists */}
      {description && (
        <div className="px-4 pb-4 pt-2 border-t border-border/50"> {/* Added border */}
          <Separator className="my-3 bg-transparent border-0 h-0" /> {/* Hide separator, use border above */}
          <p className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">
            {description}
          </p>
        </div>
      )}
    </CardContent>
  );


  return (
    <Card className={`relative code-block overflow-hidden ${className}`}>
      {title ? (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-primary text-primary-foreground h-8">
            <CollapsibleTrigger asChild>
                <div className="flex items-center flex-1 cursor-pointer">
                    <CardHeader className="code-title py-2 px-4 flex-1 bg-transparent">
                        {title}
                    </CardHeader>
                    <button className="p-2 hover:bg-transparent bg-transparent rounded-full transition-colors text-primary-foreground/80 hover:text-primary-foreground">
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>
            </CollapsibleTrigger>
          </div>
          {/* Content (inside Collapsible) */}
          <CollapsibleContent className="overflow-hidden transition-all data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
            {renderCodeContent()}
          </CollapsibleContent>
        </Collapsible>
      ) : (
        // Render content directly if no title
        renderCodeContent()
      )}
    </Card>
  );
};

export default CodeBlock;
