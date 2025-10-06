import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { EntityData, Message, Role, Source } from '@/components/chat/chat.types'
import { type } from 'os'

type ChatStore = {
  messages: Message[]
  input: string
  isStreaming: boolean
  setMessages: (messages: Message[]) => void
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
  activeProfile: {
    name: string | null
    type: 'company' | 'investor' | 'list' | null | 'transaction' | 'people'
    website: string | null
    logo: string | null
    city: string | null
    country: string | null
    isLoading?: boolean
  }
  setActiveProfile: (
    name: string | null,
    type: 'company' | 'investor' | 'transaction' | 'people',
    website: string | null,
    logo: string | null,
    city: string | null,
    country: string | null,
    isLoading?: (isLoading: boolean) => void
  ) => void
  isSearching: 'idle' | 'web' | 'searching' | 'streaming'
  setIsSearching: (isWebSearching: 'idle' | 'web' | 'searching' | 'streaming') => void

  deleteRows: (rowsToDelete: any[]) => void
  activeListMessageId: string | null
  activeList: {
    title: string
    type: 'company' | 'investor' | 'transaction' | 'people'
  }
  setActiveList: (title: string, type: 'company' | 'investor' | 'transaction' | 'people') => void
  activeListData: string[]
  setActiveListData: (data: string[]) => void
  activeListItemCount: number
  openListPanel: (
    id: string,
    title: string,
    data: string[],
    itemCount: number,
    type: 'company' | 'investor' | 'transaction' | 'people'
  ) => void
  closeListPanel: () => void
  streamListData: (data: string[]) => void
  listProfileData: null
  setListProfileData: (data: any) => void
  isListProfileOpen: boolean
  setIsListProfileOpen: (isListProfileOpen: boolean) => void
  //new for
  isCompanyPopupOpen: boolean
  popupCompany: EntityData | null
  openListItemPopup: (company: EntityData) => void
  closeCompanyPopup: () => void
  isCopilotOpen: boolean
  setIsCopilotOpen: (isCopilotOpen: boolean) => void

  append: ({
    id,
    role,
    content,
  }: {
    id?: string
    role: Message['role']
    content: string
    data?: any
    sources?: Source[]
    createdAt?: any
  }) => void
  updateMessage: (id: string, content: string, sources: Source[]) => void
  updateListData: (id: string, data: any) => void
  clearMessages: () => void
  inlineCards: Message[]
  isReading: boolean
  setIsReading: (isReading: boolean) => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  markdown: '',
  markdownSources: [],
  isCanvasOpen: false,
  isSearching: 'idle',
  isStreaming: false,
  isListPanelOpen: false,
  listProfileData: null,
  isCompanyPopupOpen: false,
  popupCompany: null,
  activeList: {
    title: '',
    type: 'company',
  },
  activeListData: [],
  activeListItemCount: 0,
  isCopilotOpen: true,
  isReading: false,
  setMessages: messages => set({ messages }),
  setIsReading: isReading => set({ isReading }),
  setIsCopilotOpen: isCopilotOpen => set({ isCopilotOpen }),
  openListItemPopup: company =>
    set({
      popupCompany: company,
      isCompanyPopupOpen: true,
    }),
  closeCompanyPopup: () =>
    set({
      isCompanyPopupOpen: false,
      popupCompany: null,
    }),
  setListProfileData: data => set({ listProfileData: data }),
  setActiveList: (title, type) => set({ activeList: { title, type } }),
  isListProfileOpen: false,
  setIsListProfileOpen: isListProfileOpen => set({ isListProfileOpen }),
  setActiveListData: data => set({ activeListData: data }),
  setIsStreaming: isStreaming => set({ isStreaming }),
  setMarkdownSources: sources => set({ markdownSources: sources }),
  setMarkdown: markdown => set({ markdown }),
  activeProfile: {
    name: null,
    type: null,
    website: null,
    logo: null,
    city: null,
    country: null,
  },
  setActiveProfile: (name, type, website, logo, city, country) =>
    set({ activeProfile: { name, type, website, logo, city, country } }),
  setIsSearching: isSearching => set({ isSearching }),
  setIsCanvasOpen: isCanvasOpen =>
    set(state => ({
      isCanvasOpen: isCanvasOpen,
      isListPanelOpen: isCanvasOpen ? false : state.isListPanelOpen,
    })),
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
  activeListMessageId: null,
  openListPanel: (id, title, data, itemCount, type) =>
    set({
      activeListMessageId: id,
      activeList: {
        title,
        type,
      },
      activeListData: data,
      activeListItemCount: itemCount,
      isListPanelOpen: true,
      isCanvasOpen: false,
      isCompanyPopupOpen: false,
    }),
  streamListData: data => set({ activeListData: data }),

  closeListPanel: () =>
    set({
      isListPanelOpen: false,
      isCompanyPopupOpen: false,
      activeListData: [],
      activeList: {
        title: '',
        type: 'company',
      },
      activeListItemCount: 0,
      activeListMessageId: null,
    }),
  deleteRows: rowsToDelete =>
    set(state => {
      const namesToDelete = new Set(rowsToDelete.map((row: any) => row.item_id))
      const updatedActiveList = state.activeListData.filter(
        (row: any) => !namesToDelete.has(row?.item_id)
      )
      const updatedMessages = state.messages.map(message => {
        if (message.id === state.activeListMessageId) {
          const updatedInternalList = message.data.list.filter(
            (item: any) => !namesToDelete.has(item.item_id)
          )

          return { ...message, data: { ...message.data, list: updatedInternalList } }
        }
        return message
      })

      return {
        activeListData: updatedActiveList,
        messages: updatedMessages,
      }
    }),
}))
