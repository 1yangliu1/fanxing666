import { Conversation, FuncType } from '../types';

export function saveState(
  conversations: Record<string, Conversation>,
  currentFunc: FuncType,
  currentConvId: string | null,
  currentModelId: string,
  currentModelName: string,
  apiKey: string
) {
  try {
    localStorage.setItem('fx_convs', JSON.stringify(conversations));
    localStorage.setItem('fx_func', currentFunc);
    localStorage.setItem('fx_conv', currentConvId || '');
    localStorage.setItem('fx_model_id', currentModelId);
    localStorage.setItem('fx_model_name', currentModelName);
    localStorage.setItem('fx_api_key', apiKey);
  } catch (e) {}
}

export function loadState() {
  try {
    const c = localStorage.getItem('fx_convs');
    const conversations: Record<string, Conversation> = c ? JSON.parse(c) : {};
    const func = (localStorage.getItem('fx_func') as FuncType) || 'chat';
    const modelId = localStorage.getItem('fx_model_id') || 'gemini-2.5-flash';
    const modelName = localStorage.getItem('fx_model_name') || 'Gemini 2.5 Flash';
    const convId = localStorage.getItem('fx_conv') || null;
    const apiKey = localStorage.getItem('fx_api_key') || '';

    return {
      conversations,
      currentFunc: func,
      currentModelId: modelId,
      currentModelName: modelName,
      currentConvId: convId && conversations[convId] ? convId : null,
      apiKey,
    };
  } catch (e) {
    return {
      conversations: {},
      currentFunc: 'chat' as FuncType,
      currentModelId: 'gemini-2.5-flash',
      currentModelName: 'Gemini 2.5 Flash',
      currentConvId: null,
      apiKey: '',
    };
  }
}
