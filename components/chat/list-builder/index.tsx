'use client'
import React, { useMemo } from 'react'
import { useChatStore } from '@/store/chatStore'
import { motion } from 'framer-motion'
import { ColumnDef } from '@tanstack/react-table'
import { AddColumnProvider } from '@/context/newColumn'
import ChatDataTable from './ChatDataTable'
import { companyColumns, generateColumns } from './columns'
import { useIsMobile } from '@/hooks/use-mobile'

interface ListBuilderProps {
  listData: any[]
  title: string
  type: 'company' | 'investor'
}

export default function ListBuilder({ listData, title, type }: ListBuilderProps) {
  const isMobile = useIsMobile()
  const { isStreaming, closeListPanel, activeListItemCount, isCopilotOpen } = useChatStore()
  const columns = type === 'company' ? companyColumns : generateColumns(listData || [])
  // console.log(type)
  // console.log(listData)
  return (
    <motion.div
      className="flex flex-col border-l"
      style={{ width: !isCopilotOpen ? '100%' : '65%' }}
      initial={{ opacity: 0, width: 0 }}
      animate={{ opacity: 1, width: !isCopilotOpen ? '100%' : '65%' }}
      exit={{ opacity: 0, width: 0 }}
      // transition={{ type: 'spring', stiffness: 250, damping: 25 }}
      transition={{ duration: 0.1 }}
      layout
    >
      <div className="flex-1 p-3 overflow-auto">
        <AddColumnProvider>
          <ChatDataTable
            data={listData}
            columns={columns as ColumnDef<unknown>[]}
            isLoading={isStreaming}
            hasMoreData={false}
            loadMoreData={() => {}}
            titleName={title}
            defaultPinnedColumns={['select', 'rowNumber', 'name']}
          />
        </AddColumnProvider>
      </div>
    </motion.div>
  )
}
