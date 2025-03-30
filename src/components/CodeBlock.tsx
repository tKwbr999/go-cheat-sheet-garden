import React, { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneLight,
  vscDarkPlus,
} from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  title: string; // Will be used as filename/identifier
  code: string;
  description?: string;
  language?: string; // Will be displayed in the header
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  title,
  code,
  description,
  language = "go",
  className = "",
}) => {
  const [hasCopied, setHasCopied] = useState(false);
  // isOpen state removed
  const [currentStyle, setCurrentStyle] = useState(oneLight);
  const { toast } = useToast();

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setCurrentStyle(isDarkMode ? vscDarkPlus : oneLight);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDark = document.documentElement.classList.contains("dark");
          setCurrentStyle(isDark ? vscDarkPlus : oneLight);
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

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

  // renderCodeContent function removed, JSX integrated directly into return

  return (
    <Card className={`code-block overflow-hidden ${className} mb-6`}>
      {" "}
      {/* Added margin-bottom */}
      {/* Header: Display filename/title, language, and copy button */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/40">
        <div className="flex items-center gap-2 overflow-hidden">
          {" "}
          {/* Added overflow-hidden */}
          {/* Display Title (Filename) */}
          <span className="text-sm font-medium text-foreground truncate">
            {title}
          </span>{" "}
          {/* Added truncate */}
        </div>
        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors rounded-md flex-shrink-0" // Added hover:bg-accent, flex-shrink-0
          aria-label="Copy code"
        >
          {hasCopied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      {/* Content: SyntaxHighlighter and Description */}
      <CardContent className="p-0 font-mono">
        {" "}
        {/* Removed rounded-b-lg, overflow-hidden */}
        <SyntaxHighlighter
          language={language}
          style={currentStyle}
          customStyle={{
            margin: 0,
            padding: "1rem", // Keep padding for code
            background: "transparent", // Ensure highlighter background doesn't conflict
            fontSize: "0.875rem", // Consistent font size
            lineHeight: "1.5", // Improve readability
          }}
          wrapLongLines={false} // Keep line wrapping off for code clarity
          // showLineNumbers={false} // Line numbers explicitly not shown per user request
        >
          {code.trim()}
        </SyntaxHighlighter>
        {/* Description Section */}
        {description && (
          <div className="px-4 pb-4 pt-3 border-t bg-background">
            {" "}
            {/* Added bg-background, adjusted padding */}
            <p className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">
              {description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CodeBlock;
