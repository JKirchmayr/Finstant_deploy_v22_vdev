import { clsx, type ClassValue } from 'clsx'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const handleCopyAsTSV = (data: any[]) => {
  if (data.length === 0) return

  const keys = Object.keys(data[0])

  // Prepare tab-separated content
  const tsv = data.map(item => keys.map(key => item[key]).join('\t')).join('\n')
  try {
    navigator.clipboard.writeText(tsv).then(() => {
      toast.success('Data copied to clipboard!')
    })
  } catch (error) {
    toast.error('Error copying Data')
  }
}

export function tryParseJSON(str: string) {
  try {
    return JSON.parse(str)
  } catch (e) {
    return null
  }
}
export function getApiErrorMessage(error: any): string {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    'Something went wrong'
  )
}
