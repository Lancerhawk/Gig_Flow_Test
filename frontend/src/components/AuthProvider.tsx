import { useEffect } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { getMe } from '../store/slices/authSlice';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check if user is authenticated on app load
    console.log('AuthProvider: Dispatching getMe');
    dispatch(getMe()).catch((error) => {
      console.error('AuthProvider: Error in getMe', error);
    });
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthProvider;
