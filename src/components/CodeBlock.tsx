
import React from 'react';

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
  className = "" 
}) => {
  // Simple syntax highlighting patterns for Go
  const highlightCode = (code: string): React.ReactNode => {
    if (!code) return null;
    
    // Process line by line to preserve newlines
    return code.split('\n').map((line, lineIndex) => {
      // Handle comments
      if (line.trim().startsWith('//')) {
        return <div key={lineIndex} className="comment">{line}</div>;
      }
      
      // Replace keywords, functions, strings, etc. with spans
      let processedLine = line;
      
      // Keywords
      const keywords = ['func', 'package', 'import', 'type', 'struct', 'interface', 'map', 'chan', 'const', 'var', 'return', 'if', 'else', 'for', 'range', 'switch', 'case', 'default', 'go', 'defer', 'select'];
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        processedLine = processedLine.replace(regex, `<span class="keyword">${keyword}</span>`);
      });
      
      // Strings
      processedLine = processedLine.replace(/"([^"]*)"/g, '<span class="string">"$1"</span>');
      
      // Function calls
      processedLine = processedLine.replace(/\b([a-zA-Z0-9_]+)\(/g, '<span class="function">$1</span>(');
      
      // Return with the processed line using dangerouslySetInnerHTML
      return (
        <div 
          key={lineIndex} 
          dangerouslySetInnerHTML={{ __html: processedLine }}
        />
      );
    });
  };

  return (
    <div className={`code-block ${className}`}>
      {title && <div className="code-title">{title}</div>}
      <pre className="code-content">
        {highlightCode(code)}
      </pre>
    </div>
  );
};

export default CodeBlock;
