import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { CompanyData, Role, Source } from '@/components/chat/chat.types'

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
  activeProfileName: string | null
  setActiveProfileName: (name: string | null) => void
  isWebSearching: boolean
  setIsWebSearching: (isWebSearching: boolean) => void

  deleteRows: (rowsToDelete: any[]) => void
  activeListMessageId: string | null
  activeListTitle: string
  activeListData: string[]
  activeListItemCount: number
  openListPanel: (id: string, title: string, data: string[], itemCount: number) => void
  closeListPanel: () => void
  streamListData: (data: string[]) => void
  listProfileData: null
  setListProfileData: (data: any) => void
  isListProfileOpen: boolean
  setIsListProfileOpen: (isListProfileOpen: boolean) => void
  //new for
  isCompanyPopupOpen: boolean
  popupCompany: CompanyData | null
  openListItemPopup: (company: CompanyData) => void
  closeCompanyPopup: () => void

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
  isWebSearching: false,
  isStreaming: false,
  isListPanelOpen: false,
  listProfileData: null,
  isCompanyPopupOpen: false,
  popupCompany: null,
  activeListTitle: '',
  activeListData: [],
  activeListItemCount: 0,
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
  isListProfileOpen: false,
  setIsListProfileOpen: isListProfileOpen => set({ isListProfileOpen }),
  setIsStreaming: isStreaming => set({ isStreaming }),
  setMarkdownSources: sources => set({ markdownSources: sources }),
  setMarkdown: markdown => set({ markdown }),
  activeProfileName: null,
  setActiveProfileName: name => set({ activeProfileName: name }),
  setIsWebSearching: isWebSearching => set({ isWebSearching }),
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
  openListPanel: (id, title, data, itemCount) =>
    set({
      activeListMessageId: id,
      activeListTitle: title,
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
      activeListData: [],
      activeListTitle: '',
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
