"use client"

import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { ChildInfo } from "./components/ChildInfo";
import { ChildProvider, useChildContext } from "./contexts/ChildContext";
import { useEffect, useState } from "react";
import { Post, PostCard } from "../stories/components/PostCard";
import { DonateButton } from "./components/DonateButton";
import "./styles/scrollbar.css";
import { getBackendUrl } from "@/utils/url.utils";

const Posts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
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
    
    // Update current post index based on scroll position
    const postHeight = clientHeight;
    const newIndex = Math.round(scrollTop / postHeight);
    setCurrentPostIndex(newIndex);
    
    // Load more posts when near the end
    if (scrollHeight - scrollTop <= clientHeight + 2000 && hasMore) {
      fetchPost(pageNumber, 10);
    }
  };

  return (
    <div className="w-full h-screen relative">
      {/* Fixed heading overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-sm">
        <h1 className="text-4xl text-black font-extrabold py-6 text-center">View my updates here</h1>
      </div>
      
      {/* Scrollable content area */}
      <div className="relative h-full">
        <div
          className="flex flex-col overflow-y-scroll snap-y snap-mandatory h-full scrollbar-hide pt-24"
          onScroll={handleScroll}
          style={{ scrollBehavior: 'smooth' }}
        >
          {posts.map((post) => {
            return (
              <div className="snap-start min-h-full flex items-center justify-center" key={post.id}>
                <PostCard post={post} constrainScrollArea={true} />
              </div>
            )
          })}
        </div>
        
        {/* Vertical Dot Indicators */}
        {posts.length > 0 && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-10">
            {posts.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  const scrollContainer = document.querySelector('.snap-y.snap-mandatory') as HTMLElement;
                  if (scrollContainer) {
                    const viewportHeight = scrollContainer.clientHeight;
                    scrollContainer.scrollTo({
                      top: index * viewportHeight,
                      behavior: 'smooth'
                    });
                  }
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentPostIndex 
                    ? 'bg-indigo-600 w-3 h-3' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to post ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const FanClub = () => {
  const { child } = useChildContext();
  const [donations, setDonations] = useState<any[]>([]);
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const getDonations = async () => {
    if (!child) return;
    
    setDonationsLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/v1/donations/child/${child.id}`, {
        method: "GET"
      });
      const result = await response.json();
      setDonations(result);
      
      // Calculate total amount from donations
      const total = result.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
      setTotalAmount(total);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setDonationsLoading(false);
    }
  }

  useEffect(() => {
    getDonations();
  }, [child])

  if (!child) return;

  return (
    <div className="w-full h-full py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Child Details Card */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  <Image
                    src={child.picture_link ? getBackendUrl(child.picture_link) : "/placeholder.png"}
                    alt={child.name}
                    width={120}
                    height={120}
                    className="rounded-full border-4 border-white shadow-lg"
                  />
                </div>
                <div className="flex-1 text-white">
                  <h1 className="text-3xl font-bold mb-2">{child.name}</h1>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Age: {child.age} years</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Grade: {child.grade || 'K3'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{child.region || 'Hong Kong'}</span>
                    </div>
                  </div>
                  <p className="mt-3 text-white/90 text-sm">
                    {child.description || 'A bright student with dreams of a better future through education.'}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <DonateButton />
                </div>
              </div>
            </div>
            
            {/* Impact Stats */}
            <div className="grid grid-cols-3 divide-x divide-gray-200 bg-white">
              <div className="p-4 text-center">
                <p className="text-2xl font-bold text-indigo-600">HK${totalAmount.toFixed(0)}</p>
                <p className="text-sm text-gray-500">Total Raised</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{donations.length}</p>
                <p className="text-sm text-gray-500">Total Donations</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(donations.filter(d => d.user_id && d.user_id !== '0000').map(d => d.user_id)).size}
                </p>
                <p className="text-sm text-gray-500">Supporters</p>
              </div>
            </div>
          </div>

          {/* Donation History Card */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <h2 className="text-xl font-semibold">Donation History</h2>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                All contributions supporting {child.name}'s education
              </p>
            </div>
            
            <div className="p-6">
              {donationsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : donations.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {donations.map((donation) => (
                        <div
                          key={donation.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <svg className="h-5 w-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {donation.user_name || 'Anonymous Donor'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {donation.donation_type === 'Quick' ? 'Quick Donation' : 
                                 donation.donation_type === 'Guest' ? 'Guest Donation' : 
                                 'Standard Donation'}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-xs text-gray-500">
                                  {donation.created_at ? new Date(donation.created_at).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              {donation.currency || 'HKD'} ${donation.amount.toFixed(2)}
                            </p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              donation.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : donation.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {donation.status}
                            </span>
                          </div>
                        </div>
                      ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-gray-500">No donations yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Be the first to support {child.name}!</p>
                </div>
              )}
            </div>
          </div>
        </div>
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
      <div className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
        {/* Child Info Section - Snap Point */}
        <div className="min-h-screen snap-start flex flex-col justify-center items-center">
          <ChildInfo/>
        </div>
        
        {/* Posts Section - Snap Point with Internal Scroll */}
        <div className="min-h-screen snap-start">
          <Posts/>
        </div>
        
        {/* Donation History Section - Snap Point */}
        <div className="min-h-screen snap-start">
          <FanClub/>
        </div>
      </div>
    </ChildProvider>
  );
}
