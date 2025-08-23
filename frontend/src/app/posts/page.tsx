'use client';

import { useEffect, useState } from 'react';
import { postService, PostResponse } from '@/services/post.service';
import PostCard from '@/components/journey/PostCard';
import { childrenService } from '@/services/children.service'; // Ensure this exists
import { regionService } from '@/services/region.service';
import type { Region } from '@/services/region.service';

export default function ViewPostsPage() {
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [childSearch, setChildSearch] = useState('');
  const [showChildDropdown, setShowChildDropdown] = useState(false);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [childPosts, setChildPosts] = useState<PostResponse[] | null>(null);
  const [childLoading, setChildLoading] = useState(false);

  // Region filter state
  const [regionSearch, setRegionSearch] = useState('');
  const [regions, setRegions] = useState<Region[]>([]);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [regionPosts, setRegionPosts] = useState<PostResponse[] | null>(null);
  const [regionLoading, setRegionLoading] = useState(false);

  // ------------- Get All Posts -----------------
  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        let allPosts = [];
        const data = await postService.getPosts({ sort: 'recent', limit: 2 });
        allPosts.push(...data.items);
        while (data.has_next) {
          const nextPage = await postService.getPosts({ sort: 'recent', limit: 2, page: data.page + 1 });
          allPosts.push(...nextPage.items);
          data.has_next = nextPage.has_next;
          data.page = nextPage.page;
        }
        setPosts(allPosts);
      } catch (err) {
        setPosts([]);
      }
      setLoading(false);
    }
    fetchPosts();
  }, []);

  // -------------- Get all regions ---------------
  useEffect(() => {
    async function fetchRegions() {
      setRegionLoading(true);
      try {
        const data = await regionService.getRegions();
        setRegions(data);
      } catch (err) {
        setRegions([]);
      }
      setRegionLoading(false);
    }
    fetchRegions();
  }, []);

  // ---------------- Get Posts by Child Name -----------------
  // Get unique child names from posts
  const childNames = Array.from(new Set(posts.map(p => p.child_name).filter(Boolean)));
  const childDropdownOptions = childNames.filter(name =>
    name && name.toLowerCase().includes(childSearch.toLowerCase())
  );

  // Region dropdown options by search
  const regionOptions = regions.map(r => [r.id, r.name]);

  // Fetch posts for selected child
  useEffect(() => {
    if (selectedChild) {
      setChildLoading(true);
      setChildPosts(null);
      // Find childId for selected child name
      const childId = posts.find(p => p.child_name === selectedChild)?.child_id;
      if (childId) {
        postService.getPostsByChild(childId, { limit: 50 }).then(res => {
          setChildPosts(res.items);
          setChildLoading(false);
        }).catch(() => {
          setChildPosts([]);
          setChildLoading(false);
        });
      } else {
        setChildPosts([]);
        setChildLoading(false);
      }
    } else {
      setChildPosts(null);
    }
  }, [selectedChild, posts]);

  //--------------- Get Posts by Region ---------------
  useEffect(() => {
    if (selectedRegion) {
      setRegionLoading(true);
      // Find regionId for selected region name
      const regionId = regions.find(r => r.name === selectedRegion)?.id;
      if (regionId) {
        postService.getPostsByRegion(regionId, { limit: 50 }).then(res => {
          setRegionPosts(res.items);
          setRegionLoading(false);
        }).catch(() => {
          setRegionPosts([]);
          setRegionLoading(false);
        });
      } else {
        setRegionPosts([]);
        setRegionLoading(false);
      }
    } else {
      setRegionPosts(null);
    }
  }, [selectedRegion, regions]);

  // Posts to display
  let displayPosts = posts;
  let isLoading = loading;
  if (selectedChild && selectedRegion) {
    // Check if the selected child is in the selected region
    const childId = posts.find(p => p.child_name === selectedChild)?.child_id;
    const isChildInRegion = regionPosts?.some(post => post.child_id === childId);
    if (!isChildInRegion) {
      displayPosts = [];
    } else {
      displayPosts = childPosts ?? [];
      isLoading = childLoading;
    }
  } else if (selectedChild) {
    displayPosts = childPosts ?? [];
    isLoading = childLoading;
  } else if (selectedRegion) {
    displayPosts = regionPosts ?? [];
    isLoading = regionLoading;
  }

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Stories & Updates</h1>
        {/* Horizontal Filter Bar with badges below */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center max-w-2xl mx-auto py-4 px-4 rounded-lg bg-gradient-to-r from-orange-100 via-pink-100 to-purple-100 shadow">
            {/* Child Name Filter */}
            <div className="relative flex-1 max-w-xs">
              <input
                type="text"
                className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Search child name..."
                value={childSearch}
                onChange={e => {
                  setChildSearch(e.target.value);
                  setShowChildDropdown(true);
                }}
                onFocus={() => setShowChildDropdown(true)}
                onBlur={() => setTimeout(() => setShowChildDropdown(false), 150)}
              />
              {showChildDropdown && childSearch && (
                <div className="absolute left-0 right-0 bg-white border rounded shadow z-10 mt-1 max-h-60 overflow-auto">
                  {childDropdownOptions.length === 0 ? (
                    <div className="px-4 py-2 text-gray-500">No matches</div>
                  ) : (
                    childDropdownOptions.map(name => (
                      <div
                        key={name}
                        className="px-4 py-2 hover:bg-orange-100 cursor-pointer"
                        onMouseDown={() => {
                          setSelectedChild(name ?? null);
                          setChildSearch(name ?? '');
                          setShowChildDropdown(false);
                        }}
                      >
                        {name}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            {/* Region Filter */}
            <div className="relative flex-1 max-w-xs">
              <input
                type="text"
                className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Search region..."
                value={regionSearch}
                onChange={e => {
                  setRegionSearch(e.target.value);
                  setShowRegionDropdown(true);
                }}
                onFocus={() => setShowRegionDropdown(true)}
                onBlur={() => setTimeout(() => setShowRegionDropdown(false), 150)}
              />
              {showRegionDropdown && regionSearch && (
                <div className="absolute left-0 right-0 bg-white border rounded shadow z-10 mt-1 max-h-60 overflow-auto">
                  {regionOptions.length === 0 ? (
                    <div className="px-4 py-2 text-gray-500">No matches</div>
                  ) : (
                    regionOptions.map(([id, name]) => (
                      <div
                        key={id}
                        className="px-4 py-2 hover:bg-orange-100 cursor-pointer"
                        onMouseDown={() => {
                          setSelectedRegion(name);
                          setRegionSearch(name);
                          setShowRegionDropdown(false);
                        }}
                      >
                        {name}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Filter badges for selected child and region, now directly below selection panel */}
          {(selectedChild || selectedRegion) && (
            <div className="mt-2 flex items-center gap-2 justify-center">
              <span className="text-sm text-gray-700">Filtering by:</span>
              {selectedChild && (
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">{selectedChild}</span>
              )}
              {selectedRegion && (
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">{selectedRegion}</span>
              )}
              <button
                className="ml-2 text-xs text-gray-500 hover:text-red-500"
                onClick={() => {
                  setSelectedChild(null);
                  setChildSearch('');
                  setSelectedRegion(null);
                  setRegionSearch('');
                }}
              >Clear</button>
            </div>
          )}
        </div>
        {isLoading ? (
          <div className="text-center text-lg text-gray-600">Loading posts...</div>
        ) : displayPosts.length === 0 ? (
          <div className="text-center text-lg text-gray-600">No posts found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayPosts.map((post, idx) => (
              <PostCard key={post.id} post={post} index={idx} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

