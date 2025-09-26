import { useState, useEffect } from 'react'
import { Story, User, PollResult } from '../types'

const BASE_URL = 'https://node-hnapi.herokuapp.com'

async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export const useFeed = (feedType: string, page: number) => {
  const [items, setItems] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await fetchData<Story[]>(`${BASE_URL}/${feedType}?page=${page}`)
        setItems(data)
      } catch (err) {
        setError(`Could not load ${feedType} stories.`)
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchFeed()
  }, [feedType, page])

  return { items, loading, error }
}

export const useItemContent = (id: number) => {
  const [item, setItem] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true)
        setError('')
        const story = await fetchData<Story>(`${BASE_URL}/item/${id}`)
        
        if (story.type === 'poll' && story.poll) {
          let pollVotesCount = 0
          const pollPromises = story.poll.map(async (_, index) => {
            try {
              const pollResult = await fetchData<PollResult>(`${BASE_URL}/item/${story.id + index + 1}`)
              pollVotesCount += pollResult.points
              return pollResult
            } catch {
              return null
            }
          })
          
          const pollResults = await Promise.all(pollPromises)
          story.poll = pollResults.filter(Boolean) as PollResult[]
          story.poll_votes_count = pollVotesCount
        }
        
        setItem(story)
      } catch (err) {
        setError('Could not load item comments.')
        setItem(null)
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [id])

  return { item, loading, error }
}

export const useUser = (id: string) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        setError('')
        const userData = await fetchData<User>(`${BASE_URL}/user/${id}`)
        setUser(userData)
      } catch (err) {
        setError(`Could not load user ${id}.`)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [id])

  return { user, loading, error }
}
