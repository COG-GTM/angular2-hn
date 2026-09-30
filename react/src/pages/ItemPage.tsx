// OWNER: Session 3 (item details). Stub — port src/app/item-details (+ comment component).
// Route module for React Router `lazy`: must export `Component`.
import { useParams } from 'react-router-dom';

export function Component() {
  const { id } = useParams();
  return (
    <div className="app-item-details">
      <div className="main-content">TODO item {id}</div>
    </div>
  );
}
