import { useState } from 'react';
import { MessageSquare, Film, Languages, Plus, ChevronUp, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Conversation, FuncType } from '../types';
import { MODELS } from '../constants';

interface SidebarProps {
  currentFunc: FuncType;
  setCurrentFunc: (func: FuncType) => void;
  conversations: Record<string, Conversation>;
  currentConvId: string | null;
  setCurrentConvId: (id: string | null) => void;
  deleteConversation: (id: string, e: React.MouseEvent) => void;
  createNewChat: () => void;
  currentModelId: string;
  setCurrentModelId: (id: string) => void;
  currentModelName: string;
  setCurrentModelName: (name: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({
  currentFunc,
  setCurrentFunc,
  conversations,
  currentConvId,
  setCurrentConvId,
  deleteConversation,
  createNewChat,
  currentModelId,
  setCurrentModelId,
  currentModelName,
  setCurrentModelName,
  apiKey,
  setApiKey,
  isOpen,
  setIsOpen,
}: SidebarProps) {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  const funcConvs = Object.entries(conversations)
    .filter(([, c]) => c.func === currentFunc && c.messages.length > 0)
    .sort((a, b) => b[1].created - a[1].created);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const weekAgo = today - 7 * 86400000;

  const groups = { today: [] as any[], yesterday: [] as any[], week: [] as any[], older: [] as any[] };
  funcConvs.forEach(([id, c]) => {
    if (c.created >= today) groups.today.push([id, c]);
    else if (c.created >= yesterday) groups.yesterday.push([id, c]);
    else if (c.created >= weekAgo) groups.week.push([id, c]);
    else groups.older.push([id, c]);
  });

  const renderGroup = (label: string, items: any[]) => {
    if (items.length === 0) return null;
    return (
      <div key={label}>
        <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-2 pt-2 pb-1">
          {label}
        </div>
        {items.map(([id, c]) => (
          <div
            key={id}
            onClick={() => {
              setCurrentConvId(id);
              setIsOpen(false);
            }}
            className={cn(
              "group flex items-center gap-2 px-2.5 py-2 rounded-md cursor-pointer transition-all text-[13px] relative",
              currentConvId === id ? "bg-neutral-100 text-neutral-900 font-medium" : "text-neutral-500 hover:bg-neutral-100"
            )}
          >
            {currentFunc === 'chat' && <MessageSquare className="w-3 h-3 opacity-50 shrink-0" />}
            {currentFunc === 'drama' && <Film className="w-3 h-3 opacity-50 shrink-0" />}
            {currentFunc === 'seedance' && <Languages className="w-3 h-3 opacity-50 shrink-0" />}
            <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{c.title}</span>
            <span
              onClick={(e) => deleteConversation(id, e)}
              className="opacity-0 group-hover:opacity-100 text-[11px] text-neutral-400 cursor-pointer p-1 rounded transition-all hover:text-red-500 hover:bg-red-50"
            >
              <X className="w-3 h-3" />
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-neutral-200 flex flex-col shrink-0 transition-transform duration-300 ease-in-out shadow-xl md:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-5 border-b border-neutral-100">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center text-white text-sm">
              ✦
            </div>
            <div className="text-lg font-bold text-neutral-900 tracking-tight">
              繁星AI<span className="text-neutral-500 font-normal text-[13px] ml-1">创作助手</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setCurrentFunc('chat')}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-md cursor-pointer transition-all border-none text-[13px] font-medium text-left w-full",
                currentFunc === 'chat' ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100"
              )}
            >
              <div className={cn("w-7 h-7 rounded-md flex items-center justify-center shrink-0", currentFunc === 'chat' ? "bg-white/20 text-white" : "bg-blue-50 text-blue-500")}>
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              AI 对话
            </button>
            <button
              onClick={() => setCurrentFunc('drama')}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-md cursor-pointer transition-all border-none text-[13px] font-medium text-left w-full",
                currentFunc === 'drama' ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100"
              )}
            >
              <div className={cn("w-7 h-7 rounded-md flex items-center justify-center shrink-0", currentFunc === 'drama' ? "bg-white/20 text-white" : "bg-orange-50 text-orange-400")}>
                <Film className="w-3.5 h-3.5" />
              </div>
              短剧 Agent
            </button>
            <button
              onClick={() => setCurrentFunc('seedance')}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-md cursor-pointer transition-all border-none text-[13px] font-medium text-left w-full",
                currentFunc === 'seedance' ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100"
              )}
            >
              <div className={cn("w-7 h-7 rounded-md flex items-center justify-center shrink-0", currentFunc === 'seedance' ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-500")}>
                <Languages className="w-3.5 h-3.5" />
              </div>
              Seedance 转换
            </button>
          </div>
        </div>

        <button
          onClick={createNewChat}
          className="mx-5 mt-4 p-2.5 rounded-md border border-dashed border-neutral-200 bg-transparent cursor-pointer text-[13px] text-neutral-500 transition-all flex items-center justify-center gap-1.5 hover:border-neutral-900 hover:text-neutral-900 hover:bg-neutral-50"
        >
          <Plus className="w-3.5 h-3.5" /> 新建对话
        </button>

        <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
          {funcConvs.length === 0 ? (
            <div className="text-center py-10 px-5 text-neutral-400 text-[13px]">
              <MessageSquare className="w-7 h-7 mx-auto mb-2.5 opacity-30" />
              <div>暂无对话记录</div>
            </div>
          ) : (
            <>
              {renderGroup('今天', groups.today)}
              {renderGroup('昨天', groups.yesterday)}
              {renderGroup('近7天', groups.week)}
              {renderGroup('更早', groups.older)}
            </>
          )}
        </div>

        <div className="p-3 px-4 border-t border-neutral-100 flex flex-col gap-2">
          <div className="relative">
            <div
              onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
              className="flex items-center gap-2 p-2 px-2.5 rounded-md bg-neutral-50 cursor-pointer transition-all hover:bg-neutral-100"
            >
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
              <div className="text-xs text-neutral-500 flex-1">{currentModelName}</div>
              <ChevronUp className="w-3 h-3 text-neutral-400 shrink-0" />
            </div>
            
            {modelDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setModelDropdownOpen(false)} />
                <div className="absolute bottom-full left-0 right-0 bg-white border border-neutral-200 rounded-md shadow-lg mb-1 z-50 overflow-hidden max-h-[320px] overflow-y-auto">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    通义千问 (Qwen)
                  </div>
                  {MODELS.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setCurrentModelId(m.id);
                        setCurrentModelName(m.name);
                        setModelDropdownOpen(false);
                      }}
                      className={cn(
                        "px-3 py-2 text-xs cursor-pointer transition-all flex items-center justify-between",
                        currentModelId === m.id ? "bg-neutral-100 font-semibold text-neutral-900" : "text-neutral-500 hover:bg-neutral-50"
                      )}
                    >
                      <span>{m.name}</span>
                      {m.badge && (
                        <span className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded-sm font-medium",
                          currentModelId === m.id ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-400"
                        )}>
                          {m.badge}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
