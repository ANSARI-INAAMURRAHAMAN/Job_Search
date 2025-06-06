import React, { useEffect, useContext } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Context } from '../../main';
import toast from 'react-hot-toast';
import axios from 'axios';

const OAuthHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsAuthorized, setUser } = useContext(Context);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const authStatus = searchParams.get('auth');
      const role = searchParams.get('role');
      const name = searchParams.get('name');
      const error = searchParams.get('error');

      console.log('OAuth Handler - Params:', { authStatus, role, name, error });
      console.log('Current location:', location.pathname);

      if (error === 'oauth_failed') {
        toast.error('Google authentication failed. Please try again.');
        navigate('/login');
        return;
      }

      if (authStatus === 'success') {
        try {
          console.log('OAuth success detected, verifying authentication...');
          
          // Add longer delay to ensure cookie is properly set
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // The backend has already set the cookie, now verify authentication
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/user/getuser`,
            { 
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );

          console.log('User verification response:', response.data);

          if (response.data.success) {
            setUser(response.data.user);
            setIsAuthorized(true);
            toast.success(`Welcome back, ${name || response.data.user.name}!`);
            
            // Navigate to appropriate page based on role
            if (response.data.user.role === 'Employer') {
              navigate('/dashboard');
            } else {
              navigate('/');
            }
          }
        } catch (error) {
          console.error('Failed to verify authentication:', error.response?.data || error.message);
          
          // If still unauthorized, try to clear any stale cookies and redirect to login
          document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.onrender.com;';
          document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          
          toast.error('Authentication failed. Please try logging in again.');
          navigate('/login');
        }
      } else if (location.pathname === '/' && !authStatus) {
        // Regular home page access, no OAuth params - do nothing, let App.jsx handle it
        return;
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, setIsAuthorized, setUser, location.pathname]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{ 
        fontSize: '18px', 
        marginBottom: '20px',
        color: '#333'
      }}>
        Completing authentication...
      </div>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OAuthHandler;
