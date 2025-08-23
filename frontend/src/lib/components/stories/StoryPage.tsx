"use client"
import React from "react";
import { Post, PostCard } from "./components/PostCard";

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
