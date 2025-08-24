"use client"

import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { ChildInfo } from "./components/ChildInfo";
import { ChildProvider, useChildContext } from "./contexts/ChildContext";
import { useEffect, useState } from "react";
import { Post, PostCard } from "../stories/components/PostCard";
import { DonateButton } from "./components/DonateButton";

const Posts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { child } = useChildContext();

  const fetchPost = async (pageNumber: number, pageSize: number) => {
    const response = await fetch(`http://localhost:8080/api/v1/posts/child/${child?.id}?page=${pageNumber}&limit=${pageSize}`, {
      method: "GET"
    });
    const page = await response.json();
    const newPosts = [...posts, ...page.items];
    setPosts(newPosts);
    setPageNumber(pageNumber+1);
    setHasMore(page.has_next);
  }

  useEffect(() => {
    if (!child) return;

    fetchPost(1, 10);
  }, [child]);

  if (!child) return;

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 2000 && hasMore) {
      fetchPost(pageNumber, 10);
    }
  };

  return (
    <div className="w-full h-full">
      <h1 className="text-4xl text-black font-extrabold p-10 text-center">View my updates here</h1>
      <div
        className="flex flex-col overflow-y-scroll snap-y snap-mandatory h-full max-h-dvh"
        onScroll={handleScroll}
      >
        {posts.map((post) => {
          return <PostCard post={post} key={post.id}/>
        })}
      </div>
    </div>
  );
}

const FanClub = () => {
  const { child } = useChildContext();
  const [topKDonors, setTopKDonors] = useState<any[]>([])
  const [recentKDonors, setRecentKDonors] = useState<any[]>([])
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const getTopKDonors = async () => {
    if (!child) return;

    const response = await fetch(`http://localhost:8080/api/v1/donations/top/single/${child.id}`, {
      method: "GET"
    });

    const result = await response.json();
    setTopKDonors(result);
  }

  const getRecentKDonors = async () => {
    if (!child) return;
    const response = await fetch(`http://localhost:8080/api/v1/donations/recent-donors/${child.id}`, {
      method: "GET"
    });

    const result = await response.json();
    setRecentKDonors(result);
  }

  const getDonationSum = async () => {
    if (!child) return;
    const response = await fetch(`http://localhost:8080/api/v1/donations/total/by-children`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        child_ids: [
          child.id
        ],
      })
    });
    const result = await response.json();
    setTotalAmount(result[0].total_amount);   
  }

  useEffect(() => {
    getTopKDonors();
    getRecentKDonors();
    getDonationSum();
  }, [child])

  if (!child) return;

  return (
    <div className="bg-[#EDD4B2] w-full h-[80dvh]">
      <div className="mb-8">
        <h1 className="font-bold text-4xl text-center pt-10 pb-2">Donor Fan Club</h1>
        <p className="text-center">Thank you to all my fans for supporting me. Together we have raised ${totalAmount} for Reach</p>
      </div>
      <div className="flex gap-20 justify-center">
        <div className="flex flex-col gap-2 justify-center items-center">
          <h1 className="font-bold text-2xl text-center pt-10 pb-2">Recent Donors</h1>
          {
            recentKDonors.map((donor) => {
              return (
                <div className="flex flex-row" key={donor.user_id}>
                  <h1>{donor.user_name}</h1>
                  <h1>{donor.amount}</h1>
                </div>
              )
            })
          }
        </div>
        <div className="flex justify-center items-center">
          <Image
            src={child?.picture_link}
            alt="this is supposed to be a child picture"
            width={300}
            height={400}
          />
        </div>
        <div className="flex flex-col gap-2 justify-center items-center">
          <h1 className="font-bold text-2xl text-center pt-10 pb-2">Top Donors</h1>
          {
            topKDonors.map((donor) => {
              return (
                <div className="flex flex-row" key={donor.user_id}>
                  <h1>{donor.user_name}</h1>
                  <h1>{donor.amount}</h1>
                </div>
              )
            })
          }
        </div>
      </div>
      <div className="flex items-center justify-center w-full">
        <DonateButton/>
      </div>
    </div>
  );
}

export const ChildPage = () => {
  const searchParams = useSearchParams();
  const childId = searchParams.get("id");
  if (!childId) return;

  return (
    <ChildProvider childId={childId}>
      <div className="flex flex-col w-full justify-center items-center">
        <div className="flex flex-col h-[80dvh] w-full">
          <ChildInfo/>
        </div>
      </div>
      <Posts/>
      <FanClub/>
    </ChildProvider>
  );
}
