"use client"

import { useState } from "react";

export enum FollowStatus {
  LOADING,
  ERROR,
  FOLLOWING,
  NOT_FOLLOWING,
};

interface FollowButtonProps {
  status: FollowStatus
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  status
}) => {
  const [curStatus, setStatus] = useState<FollowStatus>(status)

  const handleClick = () => {
    setStatus(FollowStatus.LOADING);
    setTimeout(() => {
      if (curStatus === FollowStatus.NOT_FOLLOWING) setStatus(FollowStatus.FOLLOWING);
      else setStatus(FollowStatus.NOT_FOLLOWING);
    }, 1000);
  }

  if (curStatus === FollowStatus.FOLLOWING) return <button onClick={()=> handleClick()}>Unfollow</button>
  if (curStatus === FollowStatus.NOT_FOLLOWING) return <button onClick={() => handleClick()}>Follow</button>
  if (curStatus === FollowStatus.LOADING) return <button>loading...</button>

  return <button>error</button>
};
