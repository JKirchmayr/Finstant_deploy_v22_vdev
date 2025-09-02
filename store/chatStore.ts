import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { Role, Source } from '@/components/chat/chat.types'

export type ChatMessage = {
  id: string
  role: Role
  content: string
  createdAt: Date
  data?: any
}

type ChatStore = {
  messages: ChatMessage[]
  input: string
  isStreaming: boolean
  setIsStreaming: (isStreaming: boolean) => void
  setInput: (input: string) => void
  markdown: string
  setMarkdown: (markdown: string) => void
  markdownSources: Source[]
  setMarkdownSources: (sources: Source[]) => void
  isCanvasOpen: boolean
  setIsCanvasOpen: (isCanvasOpen: boolean) => void
  isListPanelOpen: boolean
  setIsListPanelOpen: (isListOpen: boolean) => void
  sourcesOpen: boolean
  setSourcesOpen: (sourcesOpen: boolean) => void
  listProfileData: null
  setListProfileData: (data: any) => void
  isListProfileOpen: boolean
  setIsListProfileOpen: (isListProfileOpen: boolean) => void
  append: ({
    id,
    role,
    content,
  }: {
    id?: string
    role: ChatMessage['role']
    content: string
    data?: any
    sources?: Source[]
    createdAt?: any
  }) => void
  updateMessage: (id: string, content: string, sources: Source[]) => void
  updateListData: (id: string, data: any) => void
  clearMessages: () => void
  inlineCards: ChatMessage[]
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  markdown: '',
  markdownSources: [],
  isCanvasOpen: false,
  isStreaming: false,
  isListPanelOpen: false,
  listProfileData: null,
  setListProfileData: data => set({ listProfileData: data }),
  isListProfileOpen: false,
  setIsListProfileOpen: isListProfileOpen => set({ isListProfileOpen }),
  setIsStreaming: isStreaming => set({ isStreaming }),
  setMarkdownSources: sources => set({ markdownSources: sources }),
  setMarkdown: markdown => set({ markdown }),
  setIsCanvasOpen: isCanvasOpen => set({ isCanvasOpen }),
  setIsListPanelOpen: open => set({ isListPanelOpen: open }),
  sourcesOpen: false,
  setSourcesOpen: sourcesOpen => set({ sourcesOpen }),
  input: '',
  setInput: input => set({ input }),
  append: ({ id = uuidv4(), role, content, data, createdAt = new Date() }) =>
    set(state => ({
      messages: [...state.messages, { id, role, content, createdAt, data }],
    })),
  updateMessage: (id: string, content: string, sources: Source[]) =>
    set(state => ({
      messages: state.messages.map(message =>
        message.id === id ? { ...message, content, sources } : message
      ),
    })),
  updateListData: (id: string, list: any) =>
    set(state => ({
      messages: state.messages.map(message =>
        message.id === id ? { ...message, data: { ...message.data, list } } : message
      ),
    })),
  clearMessages: () => set({ messages: [] }),
  get inlineCards() {
    return get().messages.filter(message => message.role === 'inline_card')
  },
}))
