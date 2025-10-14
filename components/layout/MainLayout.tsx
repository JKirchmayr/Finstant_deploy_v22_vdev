import React, { ReactNode } from 'react'
import { TopNavbar } from '../NavBar'

export const MainLayout = ({
  children,
  headerChildren = '',
}: {
  children: ReactNode
  headerChildren?: ReactNode
}) => {
  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <TopNavbar>{headerChildren}</TopNavbar>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
