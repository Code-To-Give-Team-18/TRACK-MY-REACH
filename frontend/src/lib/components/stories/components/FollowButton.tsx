"use client"

import { useAuthStore } from "@/stores/auth.store";
import { useEffect, useState } from "react";

export enum FollowStatus {
  LOADING,
  ERROR,
  FOLLOWING,
  NOT_FOLLOWING,
  UNDEFINED,
};

interface FollowButtonProps {
  status: boolean | undefined;
  childId: string
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  status,
  childId
}) => {

  const [curStatus, setStatus] = useState<FollowStatus>()
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    console.log(status, curStatus);
    if (status === undefined) setStatus(FollowStatus.UNDEFINED);
    if (status === true) setStatus(FollowStatus.FOLLOWING);
    if (status === false) setStatus(FollowStatus.NOT_FOLLOWING);
  }, [user, isLoading]);

  const handleClick = () => {
    if (!user) return;
    setStatus(FollowStatus.LOADING);

    if (curStatus === FollowStatus.FOLLOWING) {
      fetch(`http://localhost:8080/api/v1/followers/unfollow?userId=${user.id}&childId=${childId}`, {
        method: "DELETE"
      });
      setStatus(FollowStatus.NOT_FOLLOWING);
    }

    if (curStatus === FollowStatus.NOT_FOLLOWING) {
      fetch(`http://localhost:8080/api/v1/followers/unfollow?userId=${user.id}&childId=${childId}`, {
        method: "POST"
      });
      setStatus(FollowStatus.FOLLOWING);
    }
  }

  
  if (!user || curStatus === FollowStatus.UNDEFINED) return;
  if (curStatus === FollowStatus.FOLLOWING) return <button onClick={()=> handleClick()}>Unfollow</button>
  if (curStatus === FollowStatus.NOT_FOLLOWING) return <button onClick={() => handleClick()}>Follow</button>
  if (curStatus === FollowStatus.LOADING) return <button>loading...</button>

  return <button>error</button>
};
