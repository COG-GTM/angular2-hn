import { Layout } from '@/components/Layout';
import { AppRoutes } from '@/routes';
import './styles/globals.scss';

export function App() {
  return (
    <Layout>
      <AppRoutes />
    </Layout>
  );
}
