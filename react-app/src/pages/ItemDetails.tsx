import { useParams } from 'react-router-dom'

function ItemDetails() {
  const { id } = useParams<{ id: string }>()
  return (
    <main>
      <h2>Item {id}</h2>
    </main>
  )
}

export default ItemDetails
