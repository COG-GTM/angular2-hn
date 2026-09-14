import { useParams } from 'react-router-dom'

function User() {
  const { id } = useParams<{ id: string }>()
  return (
    <main>
      <h2>User {id}</h2>
    </main>
  )
}

export default User
