import React from 'react'
import { SavedListPage } from './data'
import { Metadata } from 'next'
import { MainLayout } from '@/components/layout/MainLayout'

export const metadata: Metadata = {
  title: 'Saved Lists',
  description: 'View and manage your saved lists.',
}

export default function page() {
  return (
    <MainLayout>
      <SavedListPage />
    </MainLayout>
  )
}
