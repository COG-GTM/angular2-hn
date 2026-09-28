// Mirrors src/app/shared/models/*. Field names match the node-hnapi wire format.

export type ItemType = 'poll' | 'story' | 'job'

export type FeedType = 'news' | 'newest' | 'show' | 'ask' | 'jobs'

export interface Comment {
  id: number
  level: number
  user: string
  time: number
  time_ago: string
  content: string
  deleted?: boolean
  comments: Comment[]
}

export interface PollResult {
  points: number
  content: string
}

export interface Story {
  id: number
  title: string
  points: number | null
  user: string | null
  time: number
  // Typed `number` in the Angular model, but node-hnapi returns e.g. "3 hours ago".
  time_ago: string
  type: ItemType
  url: string
  domain?: string
  content?: string
  comments: Comment[]
  comments_count: number
  poll?: PollResult[]
  poll_votes_count?: number
  deleted?: boolean
  dead?: boolean
}

export interface User {
  id: string
  created_time: number
  created: string
  karma: number
  avg?: number
  about?: string
}
