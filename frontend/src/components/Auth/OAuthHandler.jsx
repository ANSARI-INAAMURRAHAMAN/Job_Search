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
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      console.log('OAuth Handler - Params:', { authStatus, role, name, token: !!token, error });

      if (error === 'oauth_failed') {
        toast.error('Google authentication failed. Please try again.');
        navigate('/login');
        return;
      }

      if (authStatus === 'success') {
        try {
          console.log('OAuth success detected, verifying authentication...');
          
          // If we have a token in URL, store it in localStorage as fallback
          if (token) {
            localStorage.setItem('authToken', token);
            console.log('Token stored in localStorage');
          }
          
          // Small delay to ensure cookie is set
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Try to verify authentication with cookies first
          let response;
          try {
            response = await axios.get(
              `${import.meta.env.VITE_BACKEND_URL}/user/getuser`,
              { 
                withCredentials: true,
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            );
          } catch (cookieError) {
            console.log('Cookie authentication failed, trying with token from URL...');
            
            if (token) {
              // Try with Authorization header as fallback
              response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/user/getuser`,
                { 
                  withCredentials: true,
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  }
                }
              );
            } else {
              throw cookieError;
            }
          }

          console.log('User verification response:', response.data);

          if (response.data.success) {
            setUser(response.data.user);
            setIsAuthorized(true);
            toast.success(`Welcome back, ${name || response.data.user.name}!`);
            
            // Clean up URL by removing OAuth parameters
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
            
            // Navigate to appropriate page based on role
            if (response.data.user.role === 'Employer') {
              navigate('/dashboard');
            } else {
              navigate('/');
            }
          }
        } catch (error) {
          console.error('Failed to verify authentication:', error.response?.data || error.message);
          
          // Clear any stored tokens
          localStorage.removeItem('authToken');
          document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.onrender.com;';
          document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          
          toast.error('Authentication failed. Please try logging in again.');
          navigate('/login');
        }
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, setIsAuthorized, setUser]);

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
