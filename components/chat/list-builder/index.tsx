'use client'
import React, { useMemo } from 'react'
import { useChatStore } from '@/store/chatStore'
import { motion } from 'framer-motion'
import { ColumnDef } from '@tanstack/react-table'
import { AddColumnProvider } from '@/context/newColumn'
import ChatDataTable from './ChatDataTable'
import { generateColumns } from './columns'

interface ListBuilderProps {
  listData: any[]
  title: string
}

export default function ListBuilder({ listData, title }: ListBuilderProps) {
  const { isStreaming, closeListPanel, activeListItemCount } = useChatStore()
  const columns = generateColumns(listData || [])
  console.log(listData)
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
          <ChatDataTable
            data={listData}
            columns={columns as ColumnDef<unknown>[]}
            isLoading={isStreaming}
            hasMoreData={false}
            loadMoreData={() => {}}
            titleName={title}
            closeTabPanel={closeListPanel}
            defaultPinnedColumns={['select', 'rowNumber', 'name']}
          />
        </AddColumnProvider>
      </div>
    </motion.div>
  )
}
