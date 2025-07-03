export interface Story {
  id: number
  title: string
  points: number
  user: string
  time: number
  time_ago: string
  type: FeedType
  url: string
  domain: string
  comments: Comment[]
  comments_count: number
  poll?: PollResult[]
  poll_votes_count?: number
  deleted?: boolean
  dead?: boolean
}

export interface Comment {
  id: number
  level: number
  user: string
  time: number
  time_ago: string
  content: string
  comments: Comment[]
  deleted?: boolean
  dead?: boolean
}

export interface User {
  id: string
  created: number
  karma: number
  about?: string
  submitted?: number[]
}

export interface PollResult {
  id: number
  points: number
  text: string
}

export type FeedType = 'news' | 'newest' | 'show' | 'ask' | 'jobs' | 'poll' | 'story' | 'job'

export interface Settings {
  showSettings: boolean
  openLinkInNewTab: boolean
  theme: string
  titleFontSize: string
  listSpacing: string
}
