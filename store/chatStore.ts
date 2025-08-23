import { create } from "zustand"

export type ChatMessage = {
  role: "user" | "assistant" | "system" | 'company-profile' |'data'|'company_profile_card'
  content: string
  createdAt: Date
}

type ChatStore = {
  messages: ChatMessage[]
  input: string
  setInput: (input: string) => void
  append: ({ role, content }: { role: ChatMessage["role"]; content: string, data?:any  , createdAt?:any}) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  input: "",
  setInput: (input) => set({ input }),
  append: ({ role, content, data }) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { role, content, createdAt: new Date(), data },
      ],
    })),
  clearMessages: () => set({ messages: [] }),
}))
