import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useHackerNewsAPI'
import UserProfile from '../components/User/UserProfile'
import Loader from '../components/Loader/Loader'
import ErrorMessage from '../components/ErrorMessage/ErrorMessage'

const UserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, loading, error } = useUser(id || '')

  const goBack = () => {
    navigate(-1)
  }

  if (loading) return <Loader />
  if (error) return <ErrorMessage message={error} />
  if (!user) return <ErrorMessage message="User not found" />

  return <UserProfile user={user} onGoBack={goBack} />
}

export default UserPage
