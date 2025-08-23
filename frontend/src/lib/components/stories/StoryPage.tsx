"use client"
import React, { useEffect, useState } from "react";
import { Post, PostCard } from "./components/PostCard";

export const StoryPage = () => {

  const [posts, setPosts] = useState<Post[]>([]);

  const fetchPost = async (pageNumber: number, pageSize: number) => {
    const response = await fetch(`http://localhost:8080/api/v1/posts?page=${pageNumber}&limit=${pageSize}`, {
      method: "GET"
    });
    const page = await response.json();
    const newPosts = [...posts, ...page.items];
    setPosts(newPosts);
  }

  useEffect(() => {
    fetchPost(1, 10);
  }, []);

  // bug the first post does not show
  return (
    <div className="flex flex-col justify-center items-center overflow-y-scroll snap-y snap-mandatory" style={{
      height: "calc(100dvh - 80px)"
    }}>
      {posts.map((post) => {
        return <PostCard post={post} key={post.id}/>
      })}
    </div>
  );
}

