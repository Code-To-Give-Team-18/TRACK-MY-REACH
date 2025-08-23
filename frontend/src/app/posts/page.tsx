'use client';

import { useEffect, useState } from 'react';
import { postService, PostResponse } from '@/services/post.service';
import PostCard from '@/components/journey/PostCard';

export default function ViewPostsPage() {
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [childPosts, setChildPosts] = useState<PostResponse[] | null>(null);
  const [childLoading, setChildLoading] = useState(false);

  // ------------- Get All Posts -----------------
  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        let allPosts = [];
        const data = await postService.getPosts({ sort: 'recent', limit: 20 });
        allPosts.push(...data.items);
        while (data.has_next) {
          const nextPage = await postService.getPosts({ sort: 'recent', limit: 20, page: data.page + 1 });
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

  // ---------------- Get Posts by Child Name -----------------
  // Get unique child names from posts
  const childNames = Array.from(new Set(posts.map(p => p.child_name).filter(Boolean)));

  // Filter dropdown options by search
  const dropdownOptions = childNames.filter(name =>
    name && name.toLowerCase().includes(search.toLowerCase())
  );

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

  // Posts to display
  const displayPosts = selectedChild ? (childPosts ?? []) : posts;
  const isLoading = selectedChild ? childLoading : loading;

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Stories & Updates</h1>
        {/* Child Name Filter UI */}
        <div className="relative max-w-md mx-auto mb-8">
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            placeholder="Search child name..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          />
          {showDropdown && search && (
            <div className="absolute left-0 right-0 bg-white border rounded shadow z-10 mt-1 max-h-60 overflow-auto">
              {dropdownOptions.length === 0 ? (
                <div className="px-4 py-2 text-gray-500">No matches</div>
              ) : (
                dropdownOptions.map(name => (
                  <div
                    key={name}
                    className="px-4 py-2 hover:bg-orange-100 cursor-pointer"
                    onMouseDown={() => {
                      setSelectedChild(name ?? null);
                      setSearch(name ?? '');
                      setShowDropdown(false);
                    }}
                  >
                    {name}
                  </div>
                ))
              )}
            </div>
          )}
          {selectedChild && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-gray-700">Filtering by:</span>
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">{selectedChild}</span>
              <button
                className="ml-2 text-xs text-gray-500 hover:text-red-500"
                onClick={() => {
                  setSelectedChild(null);
                  setSearch('');
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

