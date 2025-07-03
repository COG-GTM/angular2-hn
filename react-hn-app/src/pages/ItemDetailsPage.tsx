import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { hackerNewsApi } from '../services/hackerNewsApi'
import { ArrowLeft, ExternalLink } from 'lucide-react'

export default function ItemDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const itemId = parseInt(id || '0', 10)

  const { data: story, isLoading, error } = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => hackerNewsApi.fetchItemContent(itemId),
    enabled: !!itemId,
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

  if (error || !story) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-600 text-center">
          Could not load story. Please try again.
        </div>
      </div>
    )
  }

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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {story.url ? (
              <a
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-orange-600 flex items-center space-x-2"
              >
                <span>{story.title}</span>
                <ExternalLink size={20} />
              </a>
            ) : (
              story.title
            )}
          </h1>

          <div className="text-gray-600 mb-4">
            {story.points} points by{' '}
            <Link
              to={`/user/${story.user}`}
              className="text-orange-600 hover:text-orange-700"
            >
              {story.user}
            </Link>{' '}
            {story.time_ago}
            {story.url && (
              <span className="ml-2">
                ({story.domain})
              </span>
            )}
          </div>

          {story.comments && story.comments.length > 0 && (
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-4">
                {story.comments_count} Comments
              </h2>
              <div className="space-y-4">
                {story.comments.map((comment) => (
                  <div key={comment.id} className="border-l-2 border-gray-200 pl-4">
                    <div className="text-sm text-gray-600 mb-2">
                      <Link
                        to={`/user/${comment.user}`}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        {comment.user}
                      </Link>{' '}
                      {comment.time_ago}
                    </div>
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: comment.content }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
