import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { ClassroomItem } from '@/lib/api/classrooms';

interface ClassroomUpdate {
  classroomId: string;
  itemId: string;
  newState: 'funded' | 'needed';
  fundedBy?: string;
  amount?: number;
  timestamp: string;
}

export function useClassroomUpdates(classroomId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [updates, setUpdates] = useState<ClassroomUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
    const newSocket = io(wsUrl, {
      path: '/ws/socket.io/',
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join-classroom', { classroomId });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('classroom-update', (update: ClassroomUpdate) => {
      if (update.classroomId === classroomId) {
        setUpdates(prev => [...prev, update]);
      }
    });

    newSocket.on('donation-received', (data: {
      classroomId: string;
      donorName: string;
      amount: number;
      message?: string;
      itemsFunded: string[];
    }) => {
      if (data.classroomId === classroomId) {
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave-classroom', { classroomId });
      newSocket.close();
    };
  }, [classroomId]);

  const sendDonation = (amount: number, itemIds: string[], donorName: string) => {
    if (socket && isConnected) {
      socket.emit('new-donation', {
        classroomId,
        amount,
        itemIds,
        donorName,
        timestamp: new Date().toISOString(),
      });
    }
  };

  return {
    updates,
    isConnected,
    sendDonation,
  };
}