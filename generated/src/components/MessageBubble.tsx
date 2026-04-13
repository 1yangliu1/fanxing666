import { Brain, Copy, RefreshCw, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';
import { cn } from '../lib/utils';
import { useState } from 'react';

interface MessageBubbleProps {
  message: Message;
  onRegenerate?: () => void;
  isLast?: boolean;
}

export function MessageBubble({ message, onRegenerate, isLast }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("flex gap-3 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300 group", isUser ? "user" : "assistant")}>
      <div className={cn(
        "w-7 h-7 rounded-lg flex items-center justify-center text-[13px] shrink-0 mt-0.5",
        isUser ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-900"
      )}>
        {isUser ? <User className="w-4 h-4" /> : "✦"}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-neutral-500 mb-1">
          {isUser ? "你" : "繁星AI"}
        </div>
        
        {message.thinking && (
          <details className="bg-neutral-50 border-l-2 border-blue-500 rounded-r-md px-3.5 py-2.5 mb-2.5 text-[13px] text-neutral-500 leading-relaxed group/thinking">
            <summary className="cursor-pointer font-semibold text-neutral-500 text-xs select-none hover:text-neutral-900 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" /> 思考过程
            </summary>
            <div className="mt-2 whitespace-pre-wrap break-words max-h-[300px] overflow-y-auto scrollbar-thin">
              {message.thinking}
            </div>
          </details>
        )}
        
        <div className={cn(
          "text-sm leading-relaxed text-neutral-900 break-words",
          isUser ? "bg-neutral-50 px-4 py-3 rounded-xl rounded-tr-sm inline-block max-w-full" : "py-1"
        )}>
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <div className="prose prose-sm prose-neutral max-w-none prose-pre:bg-neutral-50 prose-pre:border prose-pre:border-neutral-100 prose-pre:text-neutral-900">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        
        {!isUser && (
          <div className="flex gap-0.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="px-2 py-1 border-none bg-transparent rounded cursor-pointer text-[11px] text-neutral-400 transition-all flex items-center gap-1 hover:bg-neutral-100 hover:text-neutral-900"
            >
              <Copy className="w-3 h-3" /> {copied ? "已复制" : "复制"}
            </button>
            {isLast && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="px-2 py-1 border-none bg-transparent rounded cursor-pointer text-[11px] text-neutral-400 transition-all flex items-center gap-1 hover:bg-neutral-100 hover:text-neutral-900"
              >
                <RefreshCw className="w-3 h-3" /> 重新生成
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
