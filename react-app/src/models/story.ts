import type { Comment } from './comment'
import type { FeedType } from './feedType'
import type { PollResult } from './pollResult'

/** Summary entry returned by the feed endpoints (`/news`, `/jobs`, ...). Jobs have null `points`/`user`. */
export interface FeedItem {
  id: number
  title: string
  points: number | null
  user: string | null
  time: number
  time_ago: string
  type: FeedType
  url: string
  domain?: string
  comments_count: number
}

/** Full item returned by `/item/:id`. */
export interface Story extends FeedItem {
  content?: string
  comments: Comment[]
  poll?: PollResult[]
  poll_votes_count?: number
  deleted?: boolean
  dead?: boolean
}
