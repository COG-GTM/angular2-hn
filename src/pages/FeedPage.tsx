import React from 'react'
import { useParams } from 'react-router-dom'
import { useFeed } from '../hooks/useHackerNewsAPI'
import { FeedType } from '../types'
import Feed from '../components/Feed/Feed'
import Loader from '../components/Loader/Loader'
import ErrorMessage from '../components/ErrorMessage/ErrorMessage'

interface FeedPageProps {
  feedType: FeedType
}

const FeedPage: React.FC<FeedPageProps> = ({ feedType }) => {
  const { page } = useParams<{ page: string }>()
  const pageNum = page ? parseInt(page, 10) : 1
  const { items, loading, error } = useFeed(feedType, pageNum)

  if (loading) return <Loader />
  if (error) return <ErrorMessage message={error} />

  return <Feed items={items} feedType={feedType} pageNum={pageNum} />
}

export default FeedPage
