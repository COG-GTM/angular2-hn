import { useParams } from 'react-router-dom';

export default function ItemDetailsPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <section>
      <h1>Item {id}</h1>
      <p>Item details component not migrated yet.</p>
    </section>
  );
}
