import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Linkedin, Calendar, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const id = (await params).slug
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  try {
    const res = await fetch(`${baseUrl}/api/profile/investor_profile/${id}`, { cache: 'no-store' })
    const resdata = await res.json()
    const profile = resdata.data
    if (!profile) {
      return {
        title: 'Investor Not Found | Finstant',
        description: `No investor found for ID ${id}`,
      }
    }
    return {
      title: `${profile.investor_name || 'Investor'} | Finstant`,
      description:
        profile.investor_linkedin_description ||
        profile.investors_LLM_description ||
        'Investor profile on Finstant.',
      openGraph: {
        title: `${profile.investor_name || 'Investor'} | Finstant`,
        description:
          profile.investor_linkedin_description ||
          profile.investors_LLM_description ||
          'Investor profile on Finstant.',
        images: [profile.investor_linkedin_logo || 'https://placehold.co/50x50.png'],
      },
    }
  } catch {
    return {
      title: 'Investor Profile | Finstant',
      description: 'Investor profile on Finstant.',
    }
  }
}

export default async function InvestorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const id = (await params).slug
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const res = await fetch(`${baseUrl}/api/profile/investor_profile/${id}`, { cache: 'no-store' })
  const resdata = await res.json()
  const profile = resdata.data

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10">
        <h1 className="text-2xl font-bold mb-4">Investor Not Found</h1>
        <p className="text-gray-600">
          We couldn't find an investor with the id: <span className="font-mono">{id}</span>
        </p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header Section */}
      <div className="p-8 bg-gradient-to-r from-slate-50 to-gray-50 border-b">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 relative flex-shrink-0">
            <Image
              src={profile.investor_linkedin_logo || 'https://placehold.co/50x50.png'}
              alt={`${profile.investor_name} Logo`}
              fill
              className="rounded-xl object-cover border shadow-sm"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-words">
              {profile.investor_name || '-'}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <span>🏢</span>
                <span className="truncate">
                  {profile.investor_linkedin_city ?? '-'}, {profile.investor_LLM_country ?? '-'}
                </span>
              </div>
              <div className="flex gap-2">
                {profile.investor_website && (
                  <Link
                    href={profile.investor_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="">Website</span>
                  </Link>
                )}
                {profile.investor_linekdin_url && (
                  <Link
                    href={profile.investor_linekdin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span className="">LinkedIn</span>
                  </Link>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.investor_type && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  {profile.investor_type}
                  {profile.investor_asset_classes && ` • ${profile.investor_asset_classes}`}
                </Badge>
              )}
              {profile.strategy && <Badge variant="secondary">{profile.strategy}</Badge>}
              {profile.industry && <Badge variant="secondary">{profile.industry}</Badge>}
            </div>
          </div>
        </div>
      </div>
      {/* Content Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 space-y-8">
          {/* Overview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Description */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">About</h2>
              <p className="text-gray-700 leading-relaxed">
                {profile.investor_linkedin_description || profile.investors_LLM_description || '-'}
              </p>
            </div>
            {/* Key Information */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">Key Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Founded</span>
                  </div>
                  <p className="font-medium">
                    {profile.investor_linkedin_founded ?? 'Not Available'}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Employees</span>
                  </div>
                  <p className="font-medium">
                    {profile.investor_linkedin_employees ?? 'Not Available'}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Type</span>
                  </div>
                  <p className="font-medium">{profile.investor_type || '-'}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Asset Classes</span>
                  </div>
                  <p className="font-medium">{profile.investor_asset_classes || '-'}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Investment Criteria */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Investment Criteria</h2>
            <p className="text-gray-700 leading-relaxed">
              {profile.investor_investment_criteria_description ||
                'No investment criteria provided.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
