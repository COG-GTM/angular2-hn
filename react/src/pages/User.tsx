import { useParams } from 'react-router-dom';

function User() {
    const { id } = useParams();
    return <div className="profile">{id}</div>;
}

export default User;
