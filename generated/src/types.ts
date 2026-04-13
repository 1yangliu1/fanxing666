export type FuncType = 'chat' | 'drama' | 'seedance';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
}

export interface Conversation {
  id: string;
  func: FuncType;
  dramaSubFunc?: string;
  title: string;
  messages: Message[];
  created: number;
}

export interface ModelOption {
  id: string;
  name: string;
  badge?: string;
}
