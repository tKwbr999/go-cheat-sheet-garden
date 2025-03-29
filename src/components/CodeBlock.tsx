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
import { codeToHtml } from "shiki"; // Import only codeToHtml

interface CodeBlockProps {
  title: string;
  code: string;
  description?: string;
  language?: string; // Keep language prop
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
  const [highlightedCodeHtml, setHighlightedCodeHtml] = useState<string>(""); // State for highlighted HTML
  const { toast } = useToast();

  // --- Shiki Highlighting Logic ---
  useEffect(() => {
    let isMounted = true; // Flag to prevent state update on unmounted component

    const highlight = async () => {
      try {
        // Determine the theme based on the current document class (requires theme provider setup)
        const currentTheme = document.documentElement.classList.contains('dark')
          ? 'github-dark'
          : 'github-light';

        // Use codeToHtml directly if highlighter instance is already configured with themes
        const html = await codeToHtml(code, {
          lang: language,
          theme: currentTheme,
          // Or provide themes directly if not using getHighlighter for preloading
          // themes: { light: 'github-light', dark: 'github-dark' },
        });


        if (isMounted) {
          setHighlightedCodeHtml(html);
        }
      } catch (error) {
        console.error("Shiki highlighting failed:", error);
        // Fallback: display raw code if highlighting fails
        if (isMounted) {
          // Basic preformatted text as fallback
          setHighlightedCodeHtml(`<pre><code>${escapeHtml(code)}</code></pre>`);
        }
      }
    };

    highlight();

    // Cleanup function to set isMounted to false when the component unmounts
    return () => {
      isMounted = false;
    };
  }, [code, language]); // Re-run effect if code or language changes

  // Helper function to escape HTML for fallback
  const escapeHtml = (unsafe: string) => {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;") // Corrected replacement
         .replace(/>/g, "&gt;") // Corrected replacement
         .replace(/"/g, "&quot;") // Corrected replacement
         .replace(/'/g, "&#039;");
 }
  // --- End Shiki Highlighting Logic ---

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
    <CardContent className="code-content relative pt-2 pb-4 px-4 font-mono rounded-b-lg">
      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md z-20" // Increased z-index
        aria-label="Copy code"
      >
        {hasCopied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      {/* Shiki renders its own <pre> tag, so we use a div wrapper */}
      <div
        className="shiki-code-container overflow-x-auto text-sm" // Added class for potential styling
        dangerouslySetInnerHTML={{ __html: highlightedCodeHtml }}
      />
      {/* Render description below code if it exists */}
      {description && (
        <>
          <Separator className="my-3 bg-border/50" />
          <p className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">
            {description}
          </p>
        </>
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
