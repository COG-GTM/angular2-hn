import { Link } from 'react-router';
import { ErrorMessage } from '../components/ErrorMessage';

export function NotFoundPage() {
  return (
    <>
      <ErrorMessage message="Page not found." />
      <p style={{ textAlign: 'center' }}>
        <Link to="/news">Back to top stories</Link>
      </p>
    </>
  );
}
