"use client"
import React, { useEffect, useState } from "react";
import { Post, PostCard } from "./components/PostCard";

export const StoryPage = () => {

  const [posts, setPosts] = useState<Post[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPost = async (pageNumber: number, pageSize: number) => {
    const response = await fetch(`http://localhost:8080/api/v1/posts?page=${pageNumber}&limit=${pageSize}`, {
      method: "GET"
    });
    const page = await response.json();
    const newPosts = [...posts, ...page.items];
    setPosts(newPosts);
    setPageNumber(pageNumber+1);
    setHasMore(page.has_next);
  }

  useEffect(() => {
    fetchPost(pageNumber, 10)
  }, []);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 2000 && hasMore) {
      fetchPost(pageNumber, 10);
    }
  };

  return (
    <div
      className="flex flex-col overflow-y-scroll snap-y snap-mandatory h-full max-h-dvh"
      onScroll={handleScroll}
    >
      {posts.map((post) => {
        return <PostCard post={post} key={post.id}/>
      })}
    </div>
  );
}

