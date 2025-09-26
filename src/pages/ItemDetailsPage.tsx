import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useItemContent } from '../hooks/useHackerNewsAPI'
import ItemDetails from '../components/ItemDetails/ItemDetails'
import Loader from '../components/Loader/Loader'
import ErrorMessage from '../components/ErrorMessage/ErrorMessage'

const ItemDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const itemId = id ? parseInt(id, 10) : 0
  const { item, loading, error } = useItemContent(itemId)

  const goBack = () => {
    navigate(-1)
  }

  if (loading) return <Loader />
  if (error) return <ErrorMessage message={error} />
  if (!item) return <ErrorMessage message="Item not found" />

  return <ItemDetails item={item} onGoBack={goBack} />
}

export default ItemDetailsPage
