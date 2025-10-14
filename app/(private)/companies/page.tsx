import React from 'react'
import Data from './data'
import Page from '@/components/layout/Page'
import { MainLayout } from '@/components/layout/MainLayout'
export const metadata = {
  title: 'Companies',
  description: 'List of companies',
}

const page = () => {
  return (
    <MainLayout>
      <Page title="Companies">
        <Data />
      </Page>
    </MainLayout>
  )
}

export default page
