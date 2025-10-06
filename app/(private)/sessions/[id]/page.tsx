import Chat from '@/components/chat'
import Page from '@/components/layout/Page'
import React from 'react'

export default async function page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <Page title="Copilot">
      <Chat id={id} />
    </Page>
  )
}
