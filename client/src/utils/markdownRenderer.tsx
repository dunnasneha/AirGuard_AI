import React from 'react';

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return (
        <strong key={idx} className="font-bold">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      return (
        <em key={idx} className="italic opacity-90">
          {token.slice(1, -1)}
        </em>
      );
    }
    return <React.Fragment key={idx}>{token}</React.Fragment>;
  });
}

/**
 * Renders constrained Markdown (### headings, lists, bold/italic) purely via React elements
 * without raw HTML injection to keep AI responses XSS-safe.
 */
export function renderFormattedMessage(content: string): React.ReactNode {
  const lines = content.split('\n');
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={i} className="h-1" />;
        }
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={i} className="font-bold text-sm pt-1">
              {renderInlineMarkdown(trimmed.slice(4))}
            </h3>
          );
        }
        if (trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed)) {
          return (
            <div key={i} className="pl-2 flex items-start space-x-1.5">
              <span className="font-bold opacity-75">•</span>
              <span>{renderInlineMarkdown(trimmed.replace(/^(-\s|\d+\.\s)/, ''))}</span>
            </div>
          );
        }
        return <p key={i}>{renderInlineMarkdown(trimmed)}</p>;
      })}
    </div>
  );
}
