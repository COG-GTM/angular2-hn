import { useParams } from 'react-router-dom';

export default function UserPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <section>
      <h1>User {id}</h1>
      <p>User component not migrated yet.</p>
    </section>
  );
}
