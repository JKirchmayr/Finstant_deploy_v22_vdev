'use client'
import Page from '@/components/layout/Page'
import Chat from '@/components/chat'
import { MainLayout } from '@/components/layout/MainLayout'

export default function CoPilotChat() {
  return (
    <MainLayout>
      <Page title="Copilot">
        <Chat />
      </Page>
    </MainLayout>
  )
}
