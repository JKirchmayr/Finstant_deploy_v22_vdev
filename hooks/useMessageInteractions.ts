import { useEffect, useState } from 'react'
import { useChatStore } from '@/store/chatStore'
import { useSessionListDetails, useSessionProfileDetails } from '@/queries/sessions'
import { normalizeListData, normalizeListType } from '@/utils/normalizeListData'
import { Message, Source } from '@/components/chat/chat.types'

export const useMessageInteractions = ({
  messages,
  sessionId,
  userId,
}: {
  messages: Message[]
  sessionId: string
  userId: string
}) => {
  const {
    openListPanel,
    setMessages,
    closeListPanel,
    setMarkdown,
    setMarkdownSources,
    setIsCanvasOpen,
  } = useChatStore()

  const [selectedListId, setSelectedListId] = useState('')
  const [loadingMessageId, setLoadingMessageId] = useState('')
  const [listCardId, setListCardId] = useState('')
  const [profileId, setProfileId] = useState('')
  const [type, setType] = useState<'company' | 'investor' | 'transaction' | 'people'>('company')
  const [title, setTitle] = useState('List')

  const {
    data: listDetails,
    isLoading: isListLoading,
    isFetched: isListFetched,
  } = useSessionListDetails(selectedListId, sessionId, userId, { enabled: !!selectedListId })

  useEffect(() => {
    if (isListLoading && loadingMessageId) {
      const msg = messages.find(m => (m as any).message_id === loadingMessageId)
      if (msg) msg.loading = true
    }

    if (isListFetched && listDetails && selectedListId) {
      const rawData = listDetails?.items || []
      const profile = listDetails?.list_details
      const formatted = normalizeListData(rawData, 'company')

      const msg = messages.find(m => (m as any).message_id === loadingMessageId)
      if (msg && msg.data) {
        msg.data.profile = {
          title: profile?.list_title || 'List',
          estimated_list_item_count: formatted?.length || 3,
          type: normalizeListType(profile?.list_type),
        }
        msg.data.list = formatted
        msg.id = loadingMessageId
        msg.loading = false
        // setMessages([...messages])
      }
      if (msg) msg.loading = false
      openListPanel(
        listCardId,
        profile?.list_title || title,
        formatted,
        formatted.length,
        normalizeListType(type)
      )

      setSelectedListId('')
      setLoadingMessageId('')
    }
  }, [isListLoading, isListFetched, listDetails, selectedListId])

  // LIST CARD CLICK
  const handleListCardClick = (
    id: string, // message id
    cardData: any,
    type: 'company' | 'investor' | 'transaction' | 'people',
    list_id?: string,
    message_id?: string
  ) => {
    const title = cardData?.profile?.title || 'List'
    const list = cardData?.list || []
    const itemCount = cardData?.profile?.estimated_list_item_count || list.length

    setType(type)
    setTitle(title)
    setListCardId(id)

    if (!id && list_id) {
      setSelectedListId(list_id)
      setLoadingMessageId(message_id || '')
      return
    }

    openListPanel(id, title, list, itemCount, normalizeListType(type))
  }

  //  PROFILE FETCHING

  const {
    data: profileDetails,
    isLoading: isProfileLoading,
    isFetched: isProfileFetched,
  } = useSessionProfileDetails(profileId, sessionId, userId, { enabled: !!profileId })

  //   console.log(profileDetails)
  const handleProfileClick = (
    id?: string,
    profileId?: string,
    source?: Source[],
    messageId?: string
  ) => {
    if (!id && profileId) {
      setProfileId(profileId)
      setLoadingMessageId(messageId || '')
    } else {
      setMarkdownSources((source || []) as Source[])
    }
    closeListPanel()
    setIsCanvasOpen(true)
  }

  const profile = profileDetails?.profile_details || {}
  const profileSources = profile?.profile_sources
  const profileContent = profile?.profile_content || ''

  useEffect(() => {
    // if (isProfileLoading && loadingMessageId) {
    //   const msg = messages.find(m => (m as any).message_id === loadingMessageId)
    //   if (msg) {
    //     msg.loading = true
    //     setMessages([...messages])
    //   }
    // }

    if (profileId && isProfileFetched && profileContent) {
      setMarkdown(profileContent)

      const msg = messages.find(m => (m as any).message_id === loadingMessageId)
      if (msg) {
        msg.content = profileContent
        msg.id = loadingMessageId
        msg.sources = JSON.parse(profileSources) || []
        msg.loading = false
        setMessages([...messages])
      }

      setMarkdownSources(JSON.parse(profileSources) || [])
      setProfileId('')
      setLoadingMessageId('')
    }
  }, [
    profileId,
    isProfileFetched,
    isProfileLoading,
    profileContent,
    profileSources,
    loadingMessageId,
  ])

  return {
    handleListCardClick,
    handleProfileClick,
    isListLoading,
    isProfileLoading,
    selectedListId,
    loadingMessageId,
  }
}
