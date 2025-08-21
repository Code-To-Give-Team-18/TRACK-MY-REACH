'use client';

import { motion } from 'framer-motion';
import { Loader2, Heart, School } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center">
      {/* Animated loader */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* Spinning ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        >
          <div className="w-32 h-32 rounded-full border-4 border-blue-500/20 border-t-blue-500" />
        </motion.div>
        
        {/* Center icon */}
        <div className="w-32 h-32 flex items-center justify-center">
          <School className="w-12 h-12 text-blue-400" />
        </div>
      </motion.div>
      
      {/* Loading text */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-center"
      >
        <h2 className="text-white text-xl font-semibold mb-2">
          Preparing Ming&apos;s Classroom
        </h2>
        <p className="text-white/60 text-sm mb-4">
          Creating an immersive experience...
        </p>
        
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-2 h-2 bg-blue-400 rounded-full"
            />
          ))}
        </div>
      </motion.div>
      
      {/* Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-12 text-center"
      >
        <div className="flex items-center gap-2 text-white/40 text-xs">
          <Heart className="w-3 h-3" />
          <span>Every donation transforms a child&apos;s future</span>
        </div>
      </motion.div>
    </div>
  );
}