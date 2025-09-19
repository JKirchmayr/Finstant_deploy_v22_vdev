import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Globe, Calendar, Users, DollarSign, Linkedin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const id = (await params).slug
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  try {
    const res = await fetch(`${baseUrl}/api/profile/company_profile/${id}`, { cache: 'no-store' })
    const resdata = await res.json()
    const profile = resdata.data
    if (!profile) {
      return {
        title: 'Company Not Found | Finstant',
        description: `No company found for ID ${id}`,
      }
    }
    return {
      title: `${profile.company_name || 'Company'} | Finstant`,
      description:
        profile.companies_linkedin_about ||
        profile.companies_LLM_description ||
        'Company profile on Finstant.',
      openGraph: {
        title: `${profile.company_name || 'Company'} | Finstant`,
        description:
          profile.companies_linkedin_about ||
          profile.companies_LLM_description ||
          'Company profile on Finstant.',
        images: [profile.companies_linkedin_logo_url || 'https://placehold.co/50x50.png'],
      },
    }
  } catch {
    return {
      title: 'Company Profile | Finstant',
      description: 'Company profile on Finstant.',
    }
  }
}

export default async function CompanyProfile({ params }: { params: Promise<{ slug: string }> }) {
  const id = (await params).slug
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const res = await fetch(`${baseUrl}/api/profile/company_profile/${id}`, { cache: 'no-store' })
  const resdata = await res.json()
  const profile = resdata.data

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10">
        <h1 className="text-2xl font-bold mb-4">Company Not Found</h1>
        <p className="text-gray-600">
          We couldn't find a company with the id: <span className="font-mono">{id}</span>
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
              src={profile.companies_linkedin_logo_url || 'https://placehold.co/50x50.png'}
              alt={`${profile.company_name} Logo`}
              fill
              className="rounded-xl object-cover border shadow-sm"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-words">
              {profile.company_name || '-'}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span className="truncate">
                  {profile.companies_linkedin_city ?? '-'}, {profile.companies_LLM_country ?? '-'}
                </span>
              </div>
              <div className="flex gap-2">
                {profile.company_website && (
                  <Link
                    href={profile.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="">Website</span>
                  </Link>
                )}
                {profile.linkedin_page && (
                  <Link
                    href={profile.linkedin_page}
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
              {profile.companies_linkedin_industries && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  {profile.companies_linkedin_industries}
                </Badge>
              )}
              {profile.companies_linkedin_company_type && (
                <Badge
                  variant="secondary"
                  className="bg-purple-50 text-purple-700 border-purple-200"
                >
                  {profile.companies_linkedin_company_type}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Content Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 space-y-8">
          {/* Overview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Company Description */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">About</h2>
              <p className="text-gray-700 leading-relaxed">
                {profile.companies_linkedin_about || profile.companies_LLM_description || '-'}
              </p>
            </div>
            {/* Key Metrics */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">Key Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Employees</span>
                  </div>
                  <p className="font-medium">
                    {profile.companies_linkedin_company_size ?? 'Not Available'}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Founded</span>
                  </div>
                  <p className="font-medium">
                    {profile.companies_linkedin_founded ?? 'Not Available'}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>Revenue</span>
                  </div>
                  <p className="font-medium">
                    {profile.companies_revenue_estimate_mEUR
                      ? `€${profile.companies_revenue_estimate_mEUR}M`
                      : 'Not Available'}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>EBITDA</span>
                  </div>
                  <p className="font-medium">
                    {profile.companies_EBITDA_estimate_mEUR
                      ? `€${profile.companies_EBITDA_estimate_mEUR}M`
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
