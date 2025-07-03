import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { hackerNewsApi } from '../services/hackerNewsApi'
import { ArrowLeft, Calendar, Award } from 'lucide-react'

export default function UserPage() {
  const { id } = useParams<{ id: string }>()

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => hackerNewsApi.fetchUser(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-600 text-center">
          Could not load user profile. Please try again.
        </div>
      </div>
    )
  }

  const createdDate = new Date(user.created * 1000).toLocaleDateString()

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 mb-4"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{user.id}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex items-center space-x-3">
              <Award className="text-orange-500" size={20} />
              <div>
                <div className="text-sm text-gray-600">Karma</div>
                <div className="text-lg font-semibold">{user.karma}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="text-orange-500" size={20} />
              <div>
                <div className="text-sm text-gray-600">Joined</div>
                <div className="text-lg font-semibold">{createdDate}</div>
              </div>
            </div>
          </div>

          {user.about && (
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-3">About</h2>
              <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: user.about }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
