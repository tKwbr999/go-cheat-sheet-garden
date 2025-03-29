import React, { useState, useEffect } from "react";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'; // Import SyntaxHighlighter
import { oneLight, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Import styles

interface CodeBlockProps {
  title: string;
  code: string;
  description?: string;
  language?: string;
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  title,
  code,
  description,
  language = "go", // Default to 'go'
  className = "",
}) => {
  const [hasCopied, setHasCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [currentStyle, setCurrentStyle] = useState(oneLight); // Default to light style
  const { toast } = useToast();

  // --- Style selection based on theme ---
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setCurrentStyle(isDarkMode ? vscDarkPlus : oneLight);

    // Optional: Add observer for theme changes if using a theme provider like next-themes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setCurrentStyle(isDark ? vscDarkPlus : oneLight);
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect(); // Cleanup observer on unmount
  }, []);
  // --- End Style selection ---

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
    <CardContent className="code-content relative p-0 font-mono rounded-b-lg overflow-hidden"> {/* Adjusted padding */}
      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 text-muted-foreground bg-card/80 hover:text-foreground transition-colors rounded-md z-10 backdrop-blur-sm" // Added background for visibility
        aria-label="Copy code"
      >
        {hasCopied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      {/* Use SyntaxHighlighter */}
      <SyntaxHighlighter
        language={language}
        style={currentStyle}
        customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }} // Reset margin/padding, make background transparent
        wrapLongLines={false} // Optional: prevent line wrapping
        showLineNumbers={false} // Optional: hide line numbers
      >
        {code.trim()} {/* Trim trailing newline if any */}
      </SyntaxHighlighter>
      {/* Render description below code if it exists */}
      {description && (
        <div className="px-4 pb-4 pt-2"> {/* Add padding for description */}
          <Separator className="my-3 bg-border/50" />
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
