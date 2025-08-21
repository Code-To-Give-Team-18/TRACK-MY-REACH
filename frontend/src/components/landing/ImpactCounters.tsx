'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CounterProps {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
}

function Counter({ label, value, suffix = '', icon, color }: CounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all p-8 border border-gray-100 relative overflow-hidden group"
    >
      {/* Decorative background circle */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-4 mx-auto shadow-lg relative z-10`}>
        {icon}
      </div>
      <div className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-gray-600 font-medium">{label}</div>
      <div className="mt-3 flex justify-center">
        <div className="flex -space-x-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: `${i * 200}ms` }}></div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function ImpactCounters() {
  return (
    <section className="py-24 bg-gradient-to-b from-orange-50 via-yellow-50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-orange-200 rounded-full opacity-20 animate-pulse animation-delay-2000"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-6">
            <h2 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="text-gray-800">Together, We've </span>
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">Created Magic</span>
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Behind every number is a child's smile, a dream realized, and a future brightened.
            <br/>
            <span className="font-medium text-orange-600">This is what love in action looks like.</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Counter
            label="Happy Children"
            value={3426}
            icon={
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
              </svg>
            }
            color="bg-gradient-to-br from-blue-400 to-blue-600"
          />
          
          <Counter
            label="Nutritious Meals"
            value={45890}
            icon={
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
              </svg>
            }
            color="bg-gradient-to-br from-red-400 to-pink-500"
          />
          
          <Counter
            label="Books Shared"
            value={12567}
            icon={
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
              </svg>
            }
            color="bg-gradient-to-br from-purple-400 to-purple-600"
          />
          
          <Counter
            label="Partner Schools"
            value={23}
            icon={
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
            }
            color="bg-gradient-to-br from-green-400 to-emerald-500"
          />
        </div>

        {/* Story Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8 border-t-4 border-orange-400"
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">What Your Love Creates</h3>
            <p className="text-gray-600">Real-time impact happening right now</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-b from-orange-50 to-white rounded-2xl">
              <div className="text-4xl mb-2">🍎</div>
              <div className="text-2xl font-bold text-orange-600">Every 3 min</div>
              <div className="text-gray-600">A child receives a nutritious meal</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-b from-blue-50 to-white rounded-2xl">
              <div className="text-4xl mb-2">📚</div>
              <div className="text-2xl font-bold text-blue-600">Every 15 min</div>
              <div className="text-gray-600">New books reach eager hands</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-b from-green-50 to-white rounded-2xl">
              <div className="text-4xl mb-2">🌟</div>
              <div className="text-2xl font-bold text-green-600">Every day</div>
              <div className="text-gray-600">A new child gets support</div>
            </div>
          </div>
          
          <div className="mt-8 text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
            <p className="text-lg font-medium text-gray-700">
              "When we help children learn, we don't just change their lives—<br/>
              <span className="text-orange-600 font-bold">we change the world they will create."</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}