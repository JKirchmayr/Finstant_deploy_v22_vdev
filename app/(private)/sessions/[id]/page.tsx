import { getUserProfile } from '@/actions/auth'
import Chat from '@/components/chat'
import { MainLayout } from '@/components/layout/MainLayout'
import Page from '@/components/layout/Page'
import { getSessionMessages } from '@/services/sessions'
import { redirect } from 'next/navigation'
import React from 'react'

export default async function page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getUserProfile()
  const chat = await getSessionMessages(id, user?.id || '')
  // console.log({ chat })
  if (!chat) {
    return redirect('/copilot')
  }
  return (
    <MainLayout>
      <Page title="Copilot">
        <Chat id={id} isNewSession={false} initialMessages={chat?.messages || []} />
      </Page>
    </MainLayout>
  )
}
