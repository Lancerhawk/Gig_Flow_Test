import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import { addNotification } from '../store/slices/notificationSlice';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const useSocket = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      socketRef.current = io(SOCKET_URL, {
        withCredentials: true,
      });

      socketRef.current.on('bid-hired', (data: { gigTitle: string; freelancerId: string; gigId: string }) => {
        if (user && data.freelancerId === user._id) {
          dispatch(
            addNotification({
              type: 'bid-hired',
              message: `You have been hired for "${data.gigTitle}"`,
              gigId: data.gigId,
              gigTitle: data.gigTitle,
            })
          );
        }
      });

      socketRef.current.on('new-bid', (data: { bidId: string; gigId: string; freelancerId: string; gigOwnerId: string }) => {
        if (user && data.gigOwnerId === user._id) {
          dispatch(
            addNotification({
              type: 'new-bid',
              message: `New bid received on your gig`,
              gigId: data.gigId,
            })
          );
        }
        // Dispatch event for real-time UI updates
        window.dispatchEvent(new CustomEvent('new-bid', { detail: data }));
      });

      socketRef.current.on('gig-updated', (data: { gigId: string; status: string; title: string }) => {
        // Refresh gig data if user is viewing this gig
        window.dispatchEvent(new CustomEvent('gig-updated', { detail: data }));
      });

      socketRef.current.on('hire-confirmed', (data: { bidId: string; gigId: string; gigTitle: string; freelancerId: string }) => {
        if (user) {
          window.dispatchEvent(new CustomEvent('hire-confirmed', { detail: data }));
        }
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [isAuthenticated, user, dispatch]);

  return socketRef.current;
};
