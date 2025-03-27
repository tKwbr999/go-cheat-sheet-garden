import React, { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card"; // Removed unused CardTitle
import { useToast } from "@/hooks/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CodeBlockProps {
  title: string;
  code: string;
  language?: string; // language prop is not currently used for highlighting
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  title,
  code,
  // language = "go", // Mark as unused for now
  className = "",
}) => {
  const [hasCopied, setHasCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(true); // Default to open based on review feedback
  const { toast } = useToast();

  // Simple syntax highlighting - relies on CSS classes defined in index.css
  const highlightCode = (codeLine: string): React.ReactNode => {
    if (!codeLine) return null;

    // Handle comments first
    if (codeLine.trim().startsWith("//")) {
      return <span className="comment">{codeLine}</span>;
    }

    let highlighted = codeLine;
    const stringLiterals: string[] = [];

    // 1. Replace string literals with placeholders
    highlighted = highlighted.replace(/"([^"]*)"/g, (match) => {
      const placeholder = `__STRING_LITERAL_${stringLiterals.length}__`;
      stringLiterals.push(match); // Store the original string literal including quotes
      return placeholder;
    });

    // 2. Apply other highlights (keywords, types, functions, numbers) to the code *without* string literals
    const keywords = ["func", "package", "import", "type", "struct", "interface", "map", "chan", "const", "var", "return", "if", "else", "for", "range", "switch", "case", "default", "go", "defer", "select"];
    keywords.forEach(kw => {
      highlighted = highlighted.replace(new RegExp(`\\b${kw}\\b`, 'g'), `<span class="keyword">${kw}</span>`);
    });
    highlighted = highlighted.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\(/g, '<span class="function">$1</span>('); // Function calls
    highlighted = highlighted.replace(/\b([0-9]+)\b/g, '<span class="number">$1</span>'); // Numbers
    const types = ["string", "int", "int8", "int16", "int32", "int64", "uint", "uint8", "uint16", "uint32", "uint64", "uintptr", "float32", "float64", "complex64", "complex128", "bool", "byte", "rune", "error"];
    types.forEach(t => {
      highlighted = highlighted.replace(new RegExp(`\\b${t}\\b`, 'g'), `<span class="type">${t}</span>`);
    });

    // 3. Restore string literals with highlighting span
    stringLiterals.forEach((literal, index) => {
      const placeholder = `__STRING_LITERAL_${index}__`;
      // Extract content inside quotes for the span
      const content = literal.substring(1, literal.length - 1);
      highlighted = highlighted.replace(placeholder, `<span class="string">"${content}"</span>`);
    });

    return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
  };


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

  const renderCodeContent = () => (
    <CardContent className="code-content relative pt-2 pb-4 px-4 font-mono rounded-b-lg"> {/* Consistent styling, relative is already here */}
      {/* Unified Copy Button - Moved inside CardContent */}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md z-10" /* Style from no-title case */
        aria-label="Copy code"
      >
        {hasCopied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      <div className="relative overflow-x-auto overflow-y-auto">
        <pre className="relative min-w-full text-sm">
          {code.split('\n').map((line, i) => (
            <div key={i} className="code-line group flex">
              <span className="flex-1 pr-8">
                {highlightCode(line)}
              </span>
            </div>
          ))}
        </pre>
      </div>
    </CardContent>
  );

  return (
    <Card className={`relative code-block overflow-hidden ${className}`}> {/* relative was already added */}
      {/* Copy Button removed from here */}

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
        // Render code content directly if no title
        renderCodeContent()
      )}
    </Card>
  );
};

export default CodeBlock;
