import { Menu } from 'lucide-react';
import { FuncType, Message } from '../types';
import { MessageBubble } from './MessageBubble';
import { WelcomeScreen } from './WelcomeScreen';
import { InputArea } from './InputArea';
import { useEffect, useRef } from 'react';

interface ChatAreaProps {
  currentFunc: FuncType;
  currentDramaSubFunc: string;
  setCurrentDramaSubFunc: (val: string) => void;
  messages: Message[];
  input: string;
  setInput: (val: string) => void;
  onSend: () => void;
  onStop: () => void;
  isGenerating: boolean;
  onRegenerate: () => void;
  quickSend: (text: string) => void;
  setSidebarOpen: (open: boolean) => void;
}

export function ChatArea({
  currentFunc,
  currentDramaSubFunc,
  setCurrentDramaSubFunc,
  messages,
  input,
  setInput,
  onSend,
  onStop,
  isGenerating,
  onRegenerate,
  quickSend,
  setSidebarOpen,
}: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  const titles = {
    chat: { title: 'AI 对话', subtitle: '通用智能助手，随时为您解答' },
    drama: { title: '短剧 Agent', subtitle: '动态漫剧本创作工作流' },
    seedance: { title: 'Seedance 转换', subtitle: '将剧本转换为Seedance视频提示词' },
  };

  return (
    <main className="flex-1 flex flex-col bg-white min-w-0 h-full">
      <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1 -ml-1 border-none bg-transparent text-neutral-900 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="text-[15px] font-semibold text-neutral-900">
              {titles[currentFunc].title}
            </div>
            <div className="text-xs text-neutral-400 mt-0.5">
              {titles[currentFunc].subtitle}
            </div>
          </div>
        </div>
        
        {currentFunc === 'drama' && messages.length === 0 && (
          <div className="flex bg-neutral-100 p-1 rounded-lg">
            {['1.优化剧本', '2.剧本续写', '3.小说改剧本', '4.原创剧本'].map((opt) => (
              <button
                key={opt}
                onClick={() => setCurrentDramaSubFunc(opt)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  currentDramaSubFunc === opt
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {opt.substring(2)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-[780px] mx-auto px-6 pt-6 pb-24">
          {messages.length === 0 ? (
            <WelcomeScreen 
              currentFunc={currentFunc} 
              quickSend={quickSend} 
              currentDramaSubFunc={currentDramaSubFunc}
              setCurrentDramaSubFunc={setCurrentDramaSubFunc}
            />
          ) : (
            <>
              {messages.map((msg, idx) => (
                <MessageBubble
                  key={idx}
                  message={msg}
                  isLast={idx === messages.length - 1}
                  onRegenerate={onRegenerate}
                />
              ))}
              {isGenerating && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-3 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300 assistant">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] shrink-0 mt-0.5 bg-neutral-100 text-neutral-900">
                    ✦
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-neutral-500 mb-1">繁星AI</div>
                    <div className="py-1">
                      <div className="flex gap-1 py-2">
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <InputArea
        input={input}
        setInput={setInput}
        onSend={onSend}
        onStop={onStop}
        isGenerating={isGenerating}
      />
    </main>
  );
}
