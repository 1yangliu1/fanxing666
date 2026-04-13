/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { loadState, saveState } from './lib/storage';
import { Conversation, FuncType, Message } from './types';
import { callGeminiStreamAPI, callGeminiAPI } from './lib/api';
import { cn } from './lib/utils';

export default function App() {
  const [conversations, setConversations] = useState<Record<string, Conversation>>({});
  const [currentFunc, setCurrentFunc] = useState<FuncType>('chat');
  const [currentDramaSubFunc, setCurrentDramaSubFunc] = useState<string>('1.优化剧本');
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [currentModelId, setCurrentModelId] = useState('qwen-plus');
  const [currentModelName, setCurrentModelName] = useState('千问3.6 Plus');
  const [apiKey, setApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState('');
  const [toast, setToast] = useState<{ msg: string; isError: boolean } | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const state = loadState();
    setConversations(state.conversations);
    setCurrentFunc(state.currentFunc);
    
    const validModels = ['qwen-max', 'qwen3.6-plus', 'qwen-turbo'];
    if (validModels.includes(state.currentModelId)) {
      setCurrentModelId(state.currentModelId);
      setCurrentModelName(state.currentModelName);
    } else {
      setCurrentModelId('qwen3.6-plus');
      setCurrentModelName('千问3.6 Plus');
    }
    
    setCurrentConvId(state.currentConvId);
    setApiKey(state.apiKey || '');
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      saveState(conversations, currentFunc, currentConvId, currentModelId, currentModelName, apiKey);
    }
  }, [conversations, currentFunc, currentConvId, currentModelId, currentModelName, apiKey, isInitialized]);

  const showToast = (msg: string, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 2500);
  };

  const generateId = () => 'c_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

  const ensureConversation = (firstMsg: string) => {
    if (!currentConvId) {
      const id = generateId();
      let title = firstMsg.slice(0, 30).replace(/\\n/g, ' ');
      if (firstMsg.length > 30) title += '...';
      
      setConversations((prev) => ({
        ...prev,
        [id]: {
          id,
          func: currentFunc,
          dramaSubFunc: currentFunc === 'drama' ? currentDramaSubFunc : undefined,
          title,
          messages: [],
          created: Date.now(),
        },
      }));
      setCurrentConvId(id);
      return id;
    }
    return currentConvId;
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isGenerating) return;

    const convId = ensureConversation(text);
    setInput('');
    
    setConversations((prev) => {
      const conv = prev[convId];
      return {
        ...prev,
        [convId]: {
          ...conv,
          messages: [...conv.messages, { role: 'user', content: text }],
        },
      };
    });

    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    try {
      // Need to get the latest messages
      const currentMessages = [...(conversations[convId]?.messages || []), { role: 'user', content: text } as Message];
      
      let responseText = '';
      let thinkingText = '';

      try {
        const subFunc = conversations[convId]?.dramaSubFunc || (currentFunc === 'drama' ? currentDramaSubFunc : undefined);
        await callGeminiStreamAPI(
          currentMessages,
          currentFunc,
          currentModelId,
          apiKey,
          subFunc,
          (chunk) => {
            responseText = chunk;
            setConversations((prev) => {
              const conv = prev[convId];
              const msgs = [...conv.messages];
              if (msgs[msgs.length - 1].role === 'assistant') {
                msgs[msgs.length - 1].content = chunk;
              } else {
                msgs.push({ role: 'assistant', content: chunk, thinking: thinkingText });
              }
              return { ...prev, [convId]: { ...conv, messages: msgs } };
            });
          },
          (thinking) => {
            thinkingText = thinking;
            setConversations((prev) => {
              const conv = prev[convId];
              const msgs = [...conv.messages];
              if (msgs[msgs.length - 1].role === 'assistant') {
                msgs[msgs.length - 1].thinking = thinking;
              } else {
                msgs.push({ role: 'assistant', content: '', thinking });
              }
              return { ...prev, [convId]: { ...conv, messages: msgs } };
            });
          },
          abortControllerRef.current.signal
        );
      } catch (streamErr: any) {
        if (streamErr.name === 'AbortError') throw streamErr;
        console.warn('Stream failed, trying non-stream fallback:', streamErr.message);
        
        const subFunc = conversations[convId]?.dramaSubFunc || (currentFunc === 'drama' ? currentDramaSubFunc : undefined);
        const result = await callGeminiAPI(
          currentMessages,
          currentFunc,
          currentModelId,
          apiKey,
          subFunc,
          abortControllerRef.current.signal
        );
        
        setConversations((prev) => {
          const conv = prev[convId];
          const msgs = [...conv.messages];
          if (msgs[msgs.length - 1].role === 'assistant') {
            msgs[msgs.length - 1] = { role: 'assistant', content: result.text, thinking: result.thinking };
          } else {
            msgs.push({ role: 'assistant', content: result.text, thinking: result.thinking });
          }
          return { ...prev, [convId]: { ...conv, messages: msgs } };
        });
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        showToast('已停止生成');
      } else {
        const errMsg = `⚠️ 生成失败：${err.message}\n\n请检查网络连接或稍后重试。`;
        setConversations((prev) => {
          const conv = prev[convId];
          const msgs = [...conv.messages];
          if (msgs[msgs.length - 1].role === 'assistant') {
            msgs[msgs.length - 1].content = errMsg;
          } else {
            msgs.push({ role: 'assistant', content: errMsg });
          }
          return { ...prev, [convId]: { ...conv, messages: msgs } };
        });
        showToast('生成失败，请重试', true);
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleRegenerate = async () => {
    if (!currentConvId || isGenerating) return;
    
    const conv = conversations[currentConvId];
    if (conv.messages.length < 2) return;

    // Remove last assistant message
    setConversations((prev) => {
      const c = prev[currentConvId];
      return {
        ...prev,
        [currentConvId]: {
          ...c,
          messages: c.messages.slice(0, -1),
        },
      };
    });

    // We need to wait for state update before sending, or just pass the sliced messages
    const currentMessages = conv.messages.slice(0, -1);
    
    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    try {
      let responseText = '';
      let thinkingText = '';

      try {
        const subFunc = conv.dramaSubFunc || (currentFunc === 'drama' ? currentDramaSubFunc : undefined);
        await callGeminiStreamAPI(
          currentMessages,
          currentFunc,
          currentModelId,
          apiKey,
          subFunc,
          (chunk) => {
            responseText = chunk;
            setConversations((prev) => {
              const c = prev[currentConvId];
              const msgs = [...c.messages];
              if (msgs[msgs.length - 1].role === 'assistant') {
                msgs[msgs.length - 1].content = chunk;
              } else {
                msgs.push({ role: 'assistant', content: chunk, thinking: thinkingText });
              }
              return { ...prev, [currentConvId]: { ...c, messages: msgs } };
            });
          },
          (thinking) => {
            thinkingText = thinking;
            setConversations((prev) => {
              const c = prev[currentConvId];
              const msgs = [...c.messages];
              if (msgs[msgs.length - 1].role === 'assistant') {
                msgs[msgs.length - 1].thinking = thinking;
              } else {
                msgs.push({ role: 'assistant', content: '', thinking });
              }
              return { ...prev, [currentConvId]: { ...c, messages: msgs } };
            });
          },
          abortControllerRef.current.signal
        );
      } catch (streamErr: any) {
        if (streamErr.name === 'AbortError') throw streamErr;
        
        const subFunc = conv.dramaSubFunc || (currentFunc === 'drama' ? currentDramaSubFunc : undefined);
        const result = await callGeminiAPI(
          currentMessages,
          currentFunc,
          currentModelId,
          apiKey,
          subFunc,
          abortControllerRef.current.signal
        );
        
        setConversations((prev) => {
          const c = prev[currentConvId];
          const msgs = [...c.messages];
          if (msgs[msgs.length - 1].role === 'assistant') {
            msgs[msgs.length - 1] = { role: 'assistant', content: result.text, thinking: result.thinking };
          } else {
            msgs.push({ role: 'assistant', content: result.text, thinking: result.thinking });
          }
          return { ...prev, [currentConvId]: { ...c, messages: msgs } };
        });
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        showToast('重新生成失败', true);
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((prev) => {
      const newConvs = { ...prev };
      delete newConvs[id];
      return newConvs;
    });
    if (currentConvId === id) {
      setCurrentConvId(null);
    }
  };

  const createNewChat = () => {
    setCurrentConvId(null);
    setSidebarOpen(false);
  };

  const handleFuncChange = (func: FuncType) => {
    if (func === currentFunc && !currentConvId) return;
    setCurrentFunc(func);
    setCurrentConvId(null);
    setSidebarOpen(false);
  };

  if (!isInitialized) return null;

  const currentMessages = currentConvId ? conversations[currentConvId]?.messages || [] : [];

  return (
    <div className="flex h-screen w-full max-w-[1600px] mx-auto bg-neutral-50 text-neutral-900 font-sans overflow-hidden">
      <Sidebar
        currentFunc={currentFunc}
        setCurrentFunc={handleFuncChange}
        conversations={conversations}
        currentConvId={currentConvId}
        setCurrentConvId={setCurrentConvId}
        deleteConversation={deleteConversation}
        createNewChat={createNewChat}
        currentModelId={currentModelId}
        setCurrentModelId={setCurrentModelId}
        currentModelName={currentModelName}
        setCurrentModelName={setCurrentModelName}
        apiKey={apiKey}
        setApiKey={setApiKey}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <ChatArea
        currentFunc={currentFunc}
        currentDramaSubFunc={currentDramaSubFunc}
        setCurrentDramaSubFunc={setCurrentDramaSubFunc}
        messages={currentMessages}
        input={input}
        setInput={setInput}
        onSend={() => handleSend()}
        onStop={handleStop}
        isGenerating={isGenerating}
        onRegenerate={handleRegenerate}
        quickSend={(text) => handleSend(text)}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Toast */}
      <div
        className={cn(
          "fixed top-5 right-5 px-4 py-2.5 rounded-md text-[13px] text-white shadow-lg transition-all duration-300 z-[1000] max-w-[300px] pointer-events-none",
          toast ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0",
          toast?.isError ? "bg-red-500" : "bg-neutral-900"
        )}
      >
        {toast?.msg}
      </div>
    </div>
  );
}
