import { useEffect, useRef, useState } from 'react';
import { classroomsApi } from '@/lib/api/classrooms';

export function useVisitTracking(classroomId: string) {
  const [visitStartTime, setVisitStartTime] = useState<number>(() => Date.now());
  const [interactions, setInteractions] = useState<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const newStartTime = Date.now();
    setVisitStartTime(newStartTime);
    startTimeRef.current = newStartTime;
    setInteractions([]);

    intervalRef.current = setInterval(() => {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (duration > 0 && duration % 30 === 0) {
        sendVisitUpdate();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      sendVisitUpdate();
    };
  }, [classroomId]);

  const sendVisitUpdate = async () => {
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    if (duration > 0) {
      try {
        await classroomsApi.trackClassroomVisit(
          classroomId,
          duration,
          interactions
        );
      } catch (error) {
        console.error('Failed to track visit:', error);
      }
    }
  };

  const trackInteraction = (interaction: string) => {
    setInteractions(prev => [...prev, `${interaction}-${Date.now()}`]);
  };

  const getVisitDuration = () => {
    return Math.floor((Date.now() - startTimeRef.current) / 1000);
  };

  return {
    trackInteraction,
    getVisitDuration,
    visitStartTime,
    interactions: interactions.length,
  };
}