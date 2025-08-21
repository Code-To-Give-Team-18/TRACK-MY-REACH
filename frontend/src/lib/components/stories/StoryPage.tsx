"use client"
import React, { useState } from "react";

interface Post {
  id: number; // PostId
  name: string;
  description?: string;
  pictureLink?: string;
  isFollowing: boolean;
};

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({
  post
}) => {
  return (
    <div>
      <p>{post.name}</p>
      {post.pictureLink && <img src={post.pictureLink}/>}
      <p>{post.description}</p>
      <FollowButton status={post.isFollowing ? FollowStatus.FOLLOWING : FollowStatus.NOT_FOLLOWING}/>
    </div>
  );
}

enum FollowStatus {
  LOADING,
  ERROR,
  FOLLOWING,
  NOT_FOLLOWING,
};

interface FollowButtonProps {
  status: FollowStatus
}

const FollowButton: React.FC<FollowButtonProps> = ({
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

export const StoryPage = () => {
  const data: Post[] = [
    {
      id: 1,
      name: "Jenny",
      description: "Jenny is eating sand",
      isFollowing: false,
    },
    {
      id: 2,
      name: "Jake",
      description: "Jake is eating sand",
      isFollowing: true,
    },
  ];

  return (
    <div>
      {data.map((post) => {
        return <PostCard post={post} key={post.id}/>
      })}
    </div>
  );
}
