'use client'

import React, { useMemo } from 'react'
import { useChatStore } from '@/store/chatStore'
import { motion } from 'framer-motion'
import { ColumnDef } from '@tanstack/react-table'
import { AddColumnProvider } from '@/context/newColumn'
import ChatDataTable from './ChatDataTable'
import { generateColumns } from './columns' // UPDATE: Only import generateColumns
import { useIsMobile } from '@/hooks/use-mobile'

interface ListBuilderProps {
  listData: any[]
  title: string
  type: 'company' | 'investor' | 'transaction' | 'people'
}

export default function ListBuilder({ listData, title, type }: ListBuilderProps) {
  const isMobile = useIsMobile()
  const { isStreaming, isCopilotOpen, activeList } = useChatStore()
  // console.log(listData)
  // console.log(activeList.isLoading)
  const columns = () => generateColumns(listData, type)

  return (
    <motion.div
      className="absolute right-0 top-0 z-30 flex h-full w-full flex-col border-l bg-background md:relative md:w-[65%]"
      style={{ width: isMobile ? '100%' : !isCopilotOpen ? '100%' : '65%' }}
      initial={{ opacity: 0, x: 0 }}
      animate={{ opacity: 1 }}
      exit={{ x: '100%' }}
      // transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      // exit={{ opacity: 0, width: 0 }}
      // transition={{ duration: 0.1 }}
    >
      <div className="flex-1 overflow-auto pt-3 pb-0 pl-0 pr-0">
        <AddColumnProvider>
          <ChatDataTable
            data={listData}
            columns={columns()}
            isLoading={(isStreaming && listData.length === 0) || (activeList?.isLoading ?? false)}
            titleName={title}
            defaultPinnedColumns={['select', 'rowNumber', 'NAME']}
          />
        </AddColumnProvider>
      </div>
    </motion.div>
  )
}
