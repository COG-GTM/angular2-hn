import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { hackerNewsApi } from '../services/hackerNewsApi'
import { FeedType } from '../types'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'

interface FeedPageProps {
  feedType: FeedType
}

export default function FeedPage({ feedType }: FeedPageProps) {
  const { page } = useParams<{ page: string }>()
  const pageNum = parseInt(page || '1', 10)

  const { data: stories, isLoading, error } = useQuery({
    queryKey: ['feed', feedType, pageNum],
    queryFn: () => hackerNewsApi.fetchFeed(feedType, pageNum),
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-600 text-center">
          Could not load {feedType} stories. Please try again.
        </div>
      </div>
    )
  }

  const listStart = ((pageNum - 1) * 30) + 1

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-4">
        {stories?.map((story, index) => (
          <div key={story.id} className="flex space-x-3 py-2">
            <div className="text-gray-500 text-sm w-8 text-right">
              {listStart + index}.
            </div>
            <div className="flex-1">
              <div className="flex items-start space-x-2">
                <div className="flex-1">
                  <h3 className="text-lg leading-tight">
                    {story.url ? (
                      <a
                        href={story.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 hover:text-orange-600"
                      >
                        {story.title}
                      </a>
                    ) : (
                      <Link
                        to={`/item/${story.id}`}
                        className="text-gray-900 hover:text-orange-600"
                      >
                        {story.title}
                      </Link>
                    )}
                    {story.url && (
                      <span className="ml-2 text-sm text-gray-500">
                        ({story.domain})
                      </span>
                    )}
                  </h3>
                  <div className="text-sm text-gray-600 mt-1">
                    {story.points} points by{' '}
                    <Link
                      to={`/user/${story.user}`}
                      className="hover:text-orange-600"
                    >
                      {story.user}
                    </Link>{' '}
                    {story.time_ago} |{' '}
                    <Link
                      to={`/item/${story.id}`}
                      className="hover:text-orange-600"
                    >
                      {story.comments_count} comments
                    </Link>
                  </div>
                </div>
                {story.url && (
                  <ExternalLink size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-8 pt-4 border-t">
        <div>
          {pageNum > 1 && (
            <Link
              to={`/${feedType}/${pageNum - 1}`}
              className="flex items-center space-x-1 text-orange-600 hover:text-orange-700"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </Link>
          )}
        </div>
        <div className="text-gray-600">
          Page {pageNum}
        </div>
        <div>
          {stories && stories.length === 30 && (
            <Link
              to={`/${feedType}/${pageNum + 1}`}
              className="flex items-center space-x-1 text-orange-600 hover:text-orange-700"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
