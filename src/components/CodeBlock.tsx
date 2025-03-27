import React, { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CodeBlockProps {
  title: string;
  code: string;
  language?: string;
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  title,
  code,
  language = "go",
  className = "",
}) => {
  const [hasCopied, setHasCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Simple syntax highlighting patterns for Go
  const highlightCode = (code: string): React.ReactNode => {
    if (!code) return null;

    // Process line by line to preserve newlines
    return code.split("\n").map((line, lineIndex) => {
      // Handle comments
      if (line.trim().startsWith("//")) {
        return (
          <div key={lineIndex} className="comment">
            {line}
          </div>
        );
      }

      // Replace keywords, functions, strings, etc. with spans
      let processedLine = line;

      // Keywords
      const keywords = [
        "func",
        "package",
        "import",
        "type",
        "struct",
        "interface",
        "map",
        "chan",
        "const",
        "var",
        "return",
        "if",
        "else",
        "for",
        "range",
        "switch",
        "case",
        "default",
        "go",
        "defer",
        "select",
      ];
      keywords.forEach((keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, "g");
        processedLine = processedLine.replace(regex, `<span>${keyword}</span>`);
      });

      // Strings
      processedLine = processedLine.replace(
        /"([^"]*)"/g,
        '<span class="string">"$1"</span>'
      );

      // Function calls
      processedLine = processedLine.replace(
        /\b([a-zA-Z0-9_]+)\(/g,
        '<span class="function">$1</span>('
      );

      // Return with the processed line using dangerouslySetInnerHTML
      return (
        <div
          key={lineIndex}
          dangerouslySetInnerHTML={{ __html: processedLine }}
        />
      );
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setHasCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "The code has been copied to your clipboard.",
      duration: 2000,
    });
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <Card className={`code-block ${className}`}>
      {title && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between">
              <CardHeader className="code-title pb-3 mb-0 flex-1 bg-transparent">
                {title}
              </CardHeader>
              <button className="p-2 hover:bg-transparent bg-transparent rounded-full transition-colors mr-2">
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="code-content relative pt-0 font-mono rounded-lg shadow-inner">
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-900 transition-colors rounded-md z-10"
                aria-label="Copy code"
              >
                {hasCopied ? <Check size={14} /> : <Copy size={14} />}
              </button>
              <div className="relative overflow-x-auto">
                <pre className="relative min-w-full">
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
          </CollapsibleContent>
        </Collapsible>
      )}
      {!title && (
        <CardContent className="code-content relative pt-0 font-mono rounded-lg shadow-inner p-4">
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-200 transition-colors bg-zinc-500/50 rounded-md"
            aria-label="Copy code"
          >
            {hasCopied ? <Check size={16} /> : <Copy size={16} />}
          </button>
          <pre className="pr-8 text-gray-200">{highlightCode(code)}</pre>
        </CardContent>
      )}
    </Card>
  );
};

export default CodeBlock;
