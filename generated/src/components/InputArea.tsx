import { ArrowUp, Square } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { cn } from '../lib/utils';

interface InputAreaProps {
  input: string;
  setInput: (val: string) => void;
  onSend: () => void;
  onStop: () => void;
  isGenerating: boolean;
}

export function InputArea({ input, setInput, onSend, onStop, isGenerating }: InputAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + 'px';
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="px-6 pb-6 shrink-0">
      <div className="max-w-[780px] mx-auto relative">
        <div className="flex items-end border border-neutral-200 rounded-2xl bg-white transition-all shadow-sm focus-within:border-neutral-900 focus-within:ring-2 focus-within:ring-neutral-900/5">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="输入消息..."
            className="flex-1 border-none outline-none py-3.5 px-4 text-sm resize-none bg-transparent text-neutral-900 max-h-[140px] leading-relaxed placeholder:text-neutral-400"
          />
          {isGenerating ? (
            <button
              onClick={onStop}
              className="m-2 w-9 h-9 border-none bg-red-500 text-white rounded-lg cursor-pointer flex items-center justify-center transition-all hover:bg-red-600 shrink-0"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              onClick={onSend}
              disabled={!input.trim()}
              className="m-2 w-9 h-9 border-none bg-neutral-900 text-white rounded-lg cursor-pointer flex items-center justify-center transition-all hover:bg-neutral-800 disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed shrink-0"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="text-center text-[11px] text-neutral-400 mt-2">
          Enter 发送 · Shift+Enter 换行
        </div>
      </div>
    </div>
  );
}
