import { cn } from '@/lib/utils'
import { Copy, Download } from 'lucide-react'
import Link from 'next/link'
import React, { memo, ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface NonMemoizedMarkdownProps {
  children: ReactNode
}

const NonMemoizedMarkdown = ({ children }: NonMemoizedMarkdownProps) => {
  const components = {
    code({ node, inline, className, children, ...props }: any) {
      ;<code
        className={cn(
          className,
          'whitespace-pre-wrap break-words text-[13px] font-normal',
          'bg-zinc-100 dark:bg-zinc-800',
          'py-0.5 px-1 mx-1 rounded'
        )}
        {...props}
      >
        {children}
      </code>
    },
    table({ node, children, ...props }: any) {
      return (
        <div className="overflow-x-auto my-4">
          <table
            className="min-w-full border-collapse border border-gray-300 dark:border-gray-700"
            {...props}
          >
            {children}
          </table>
        </div>
      )
    },
    thead({ node, children, ...props }: any) {
      return (
        <thead className="bg-gray-100 dark:bg-gray-800" {...props}>
          {children}
        </thead>
      )
    },
    tbody({ node, children, ...props }: any) {
      return <tbody {...props}>{children}</tbody>
    },
    tr({ node, children, ...props }: any) {
      return (
        <tr className="border-b border-gray-300 dark:border-gray-700" {...props}>
          {children}
        </tr>
      )
    },
    th({ node, children, ...props }: any) {
      return (
        <th className="px-2 py-1.5 text-left text-sm font-semibold border" {...props}>
          {children}
        </th>
      )
    },
    td({ node, children, ...props }: any) {
      return (
        <td className="px-2 py-1.5 text-sm border" {...props}>
          {children}
        </td>
      )
    },
    ol({ node, children, ...props }: any) {
      return (
        <ol className="list-decimal list-outside ml-4 text-sm" {...props}>
          {children}
        </ol>
      )
    },
    li({ node, children, ...props }: any) {
      return (
        <li className="py-1 text-sm leading-6" {...props}>
          {children}
        </li>
      )
    },
    ul({ node, children, ...props }: any) {
      return (
        <ul className="list-decimal list-outside ml-4 text-sm" {...props}>
          {children}
        </ul>
      )
    },
    strong({ node, children, ...props }: any) {
      return (
        <span className="font-semibold text-sm" {...props}>
          {children}
        </span>
      )
    },
    a({ node, children, ...props }: any) {
      return (
        <Link
          className="text-blue-500 hover:underline text-sm"
          target="_blank"
          rel="noreferrer"
          {...props}
        >
          {children}
        </Link>
      )
    },
    h1({ node, children, ...props }: any) {
      return (
        <h1 className="text-2xl font-semibold mb-2" {...props}>
          {children}
        </h1>
      )
    },
    h2({ node, children, ...props }: any) {
      return (
        <h2 className="text-xl font-semibold mb-2" {...props}>
          {children}
        </h2>
      )
    },
    h3({ node, children, ...props }: any) {
      return (
        <h3 className="text-[16px] font-semibold mb-2" {...props}>
          {children}
        </h3>
      )
    },
    h4({ node, children, ...props }: any) {
      return (
        <h4 className="text-sm font-semibold mb-2" {...props}>
          {children}
        </h4>
      )
    },
    h5({ node, children, ...props }: any) {
      return (
        <h5 className="text-sm font-semibold mb-2" {...props}>
          {children}
        </h5>
      )
    },
    h6({ node, children, ...props }: any) {
      return (
        <h6 className="text-xs font-semibold mb-2" {...props}>
          {children}
        </h6>
      )
    },
    p({ node, children, ...props }: any) {
      return (
        <p className="text-sm leading-6" {...props}>
          {children}
        </p>
      )
    },
  }

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components as any}>
      {children as any}
    </ReactMarkdown>
  )
}

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps: NonMemoizedMarkdownProps, nextProps: NonMemoizedMarkdownProps) =>
    prevProps.children === nextProps.children
)
