// components/VerifiedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';

const VerifiedRoute = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user.isVerified) {
        return <Outlet />;
    } else {
        return <Navigate to="/unverified-home" />;
    }
};

export default VerifiedRoute;