import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';
import './MessageRenderer.css';

interface MessageRendererProps {
  content: string;
  role: 'user' | 'assistant';
}

/**
 * Normalize LaTeX delimiters from OpenAI format to remark-math format.
 * OpenAI outputs: \[...\]  \(...\)
 * remark-math needs: $$...$$ $...$
 */
function normalizeLatex(text: string): string {
  // \[...\]  →  $$...$$  (display math, must be on its own line)
  text = text.replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, (_, inner) => `\n$$\n${inner.trim()}\n$$\n`);
  // \(...\)  →  $...$  (inline math)
  text = text.replace(/\\\(\s*([\s\S]*?)\s*\\\)/g, (_, inner) => `$${inner.trim()}$`);
  return text;
}

const MessageRenderer: React.FC<MessageRendererProps> = ({ content, role }) => {
  // User messages: plain text (no markdown rendering)
  if (role === 'user') {
    return <span className="message-renderer message-renderer--user">{content}</span>;
  }

  const normalizedContent = normalizeLatex(content);

  return (
    <div className="message-renderer message-renderer--assistant">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
        components={{
          // Code blocks with syntax highlighting
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            const isInline = !match && !codeString.includes('\n');

            if (isInline) {
              return (
                <code className="message-renderer__inline-code" {...props}>
                  {children}
                </code>
              );
            }

            const language = match ? match[1] : 'text';

            return (
              <div className="message-renderer__code-block">
                <div className="message-renderer__code-header">
                  <span className="message-renderer__code-lang">{language}</span>
                  <button
                    className="message-renderer__code-copy"
                    onClick={() => navigator.clipboard.writeText(codeString)}
                    title="Copy code"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copy
                  </button>
                </div>
                <SyntaxHighlighter
                  style={oneDark}
                  language={language}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    borderRadius: '0 0 8px 8px',
                    fontSize: '13px',
                    lineHeight: '1.5',
                  }}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            );
          },
          // Block-level elements styling
          h1: ({ children }) => <h1 className="message-renderer__h1">{children}</h1>,
          h2: ({ children }) => <h2 className="message-renderer__h2">{children}</h2>,
          h3: ({ children }) => <h3 className="message-renderer__h3">{children}</h3>,
          h4: ({ children }) => <h4 className="message-renderer__h4">{children}</h4>,
          p: ({ children }) => <p className="message-renderer__p">{children}</p>,
          ul: ({ children }) => <ul className="message-renderer__ul">{children}</ul>,
          ol: ({ children }) => <ol className="message-renderer__ol">{children}</ol>,
          li: ({ children }) => <li className="message-renderer__li">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="message-renderer__blockquote">{children}</blockquote>
          ),
          table: ({ children }) => (
            <div className="message-renderer__table-wrapper">
              <table className="message-renderer__table">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="message-renderer__thead">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className="message-renderer__tr">{children}</tr>,
          th: ({ children }) => <th className="message-renderer__th">{children}</th>,
          td: ({ children }) => <td className="message-renderer__td">{children}</td>,
          hr: () => <hr className="message-renderer__hr" />,
          strong: ({ children }) => <strong className="message-renderer__strong">{children}</strong>,
          em: ({ children }) => <em className="message-renderer__em">{children}</em>,
          a: ({ href, children }) => (
            <a
              className="message-renderer__link"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
};

export default MessageRenderer;
