'use client'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useChatStore } from '@/store/chatStore'
import { AnimatePresence, motion } from 'framer-motion'
import { ColumnDef } from '@tanstack/react-table'
import { AddColumnProvider } from '@/context/newColumn'
import ChatDataTable from './ChatDataTable'
import { CompanyData } from '../chat.types'
import { companiesListColumns } from './columns'

interface MainChatProps {
  listData: CompanyData[]
}

export default function ListBuilder({ listData }: MainChatProps) {
  const { isStreaming, setIsListPanelOpen } = useChatStore()

  return (
    <motion.div
      className="flex flex-col border-l shadow-xl bg-white"
      style={{ width: '65%' }}
      initial={{ opacity: 0, width: 0 }}
      animate={{ opacity: 1, width: '65%' }}
      exit={{ opacity: 0, width: 0 }}
      transition={{ type: 'spring', stiffness: 250, damping: 25 }}
      layout
    >
      <div className="flex-1 p-2 overflow-auto">
        <AddColumnProvider>
          <ChatDataTable<CompanyData>
            data={listData}
            columns={companiesListColumns as ColumnDef<CompanyData>[]}
            isLoading={isStreaming}
            hasMoreData={false}
            loadMoreData={() => {}}
            titleName="Pet food companies in France"
            togglePanel={() => {}}
            closeTabPanel={() => setIsListPanelOpen(false)}
          />
        </AddColumnProvider>
      </div>
    </motion.div>
  )
}
