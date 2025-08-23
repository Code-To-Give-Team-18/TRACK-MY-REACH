'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type UserStory = {
  video: string;
  name: string;
  story: string;
};

export default function UserStoriesSection() {
  const [stories, setStories] = useState<UserStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStories() {
      try {
        const res = await fetch('/api/user-stories'); // Replace with your backend route
        const data: UserStory[] = await res.json();
        setStories(data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load stories. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchStories();
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              Success Stories
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Real journeys of growth made possible by you!
          </p>
        </motion.div>

        {/* Error */}
        {error && (
          <p className="text-center text-red-500 mb-6">{error}</p>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl shadow p-6 flex flex-col items-center animate-pulse"
              >
                <div className="w-48 h-48 bg-gray-200 rounded-[20%] mb-4" />
                <div className="w-32 h-6 bg-gray-300 rounded mb-2" />
                <div className="w-48 h-4 bg-gray-300 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {stories.map(({ video, name, story }, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-3xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition-shadow"
              >
                {/* Hexagon Video */}
                <div className="relative w-48 h-48 mb-6">
                  <div className="absolute inset-0 p-[3px] bg-gradient-to-r from-orange-400 to-pink-400 rounded-[20%] clip-hex">
                    <video
                      src={video}
                      controls
                      className="w-full h-full object-cover rounded-[20%] clip-hex"
                      aria-label={`Video story of ${name}`}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>

                {/* Name + Story */}
                <h3 className="text-xl font-bold text-gray-900">{name}</h3>
                <p className="mt-3 text-gray-600 leading-relaxed">{story}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Hexagon Clip CSS */}
      <style jsx>{`
        .clip-hex {
          clip-path: polygon(
            25% 6.7%,
            75% 6.7%,
            100% 50%,
            75% 93.3%,
            25% 93.3%,
            0% 50%
          );
        }
      `}</style>
    </section>
  );
}
