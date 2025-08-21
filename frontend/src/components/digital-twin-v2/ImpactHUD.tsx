'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Pencil, Users, Clock, Star, Target } from 'lucide-react';

interface ImpactHUDProps {
  donationAmount: number;
}

export function ImpactHUD({ donationAmount }: ImpactHUDProps) {
  const [animatedBooks, setAnimatedBooks] = useState(0);
  const [animatedPencils, setAnimatedPencils] = useState(0);
  const [animatedStudents, setAnimatedStudents] = useState(0);
  
  // Calculate impact metrics based on donation amount
  const books = Math.floor(donationAmount / 10) * 3;
  const pencils = Math.floor(donationAmount / 5) * 6;
  const students = Math.floor(donationAmount / 20);
  const learningHours = Math.floor(donationAmount * 2.5);
  
  // Animate numbers
  useEffect(() => {
    const animateValue = (start: number, end: number, setter: (val: number) => void) => {
      const duration = 1000;
      const increment = (end - start) / (duration / 16);
      let current = start;
      
      const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
          setter(end);
          clearInterval(timer);
        } else {
          setter(Math.floor(current));
        }
      }, 16);
      
      return timer;
    };
    
    const timer1 = animateValue(animatedBooks, books, setAnimatedBooks);
    const timer2 = animateValue(animatedPencils, pencils, setAnimatedPencils);
    const timer3 = animateValue(animatedStudents, students, setAnimatedStudents);
    
    return () => {
      clearInterval(timer1);
      clearInterval(timer2);
      clearInterval(timer3);
    };
  }, [books, pencils, students]);
  
  const impactLevel = 
    donationAmount === 0 ? 'No Impact Yet' :
    donationAmount < 25 ? 'Getting Started' :
    donationAmount < 50 ? 'Making Progress' :
    donationAmount < 100 ? 'Significant Impact' :
    donationAmount < 250 ? 'Transformative' :
    'Life-Changing';
  
  const impactColor = 
    donationAmount === 0 ? 'text-gray-400' :
    donationAmount < 25 ? 'text-blue-400' :
    donationAmount < 50 ? 'text-green-400' :
    donationAmount < 100 ? 'text-purple-400' :
    donationAmount < 250 ? 'text-pink-400' :
    'text-yellow-400';

  return (
    <div className="fixed bottom-8 left-8 z-20" data-ui-overlay="impact-hud">
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-black/50 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-2xl"
      >
        {/* Header */}
        <div className="mb-3">
          <h4 className="text-white text-sm font-semibold mb-1">Your Impact So Far</h4>
          <p className={`text-xs font-medium ${impactColor}`}>{impactLevel}</p>
        </div>
        
        {/* Impact Grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Books */}
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="p-1.5 bg-blue-500/20 rounded-lg">
              <Book className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={animatedBooks}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  className="text-white text-sm font-bold"
                >
                  {animatedBooks}
                </motion.p>
              </AnimatePresence>
              <p className="text-white/50 text-[10px]">Books</p>
            </div>
          </motion.div>
          
          {/* Pencils */}
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="p-1.5 bg-yellow-500/20 rounded-lg">
              <Pencil className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={animatedPencils}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  className="text-white text-sm font-bold"
                >
                  {animatedPencils}
                </motion.p>
              </AnimatePresence>
              <p className="text-white/50 text-[10px]">Pencils</p>
            </div>
          </motion.div>
          
          {/* Students */}
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="p-1.5 bg-green-500/20 rounded-lg">
              <Users className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={animatedStudents}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  className="text-white text-sm font-bold"
                >
                  {animatedStudents}
                </motion.p>
              </AnimatePresence>
              <p className="text-white/50 text-[10px]">Students</p>
            </div>
          </motion.div>
          
          {/* Learning Hours */}
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="p-1.5 bg-purple-500/20 rounded-lg">
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">{learningHours}</p>
              <p className="text-white/50 text-[10px]">Hours</p>
            </div>
          </motion.div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-white/50 text-[10px]">Ming\'s Goal</span>
            <span className="text-white/70 text-[10px]">${donationAmount} / $250</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${Math.min((donationAmount / 250) * 100, 100)}%` }}
              transition={{ type: 'spring', stiffness: 100 }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          </div>
        </div>
        
        {/* Achievement Badges */}
        {donationAmount > 0 && (
          <div className="flex gap-2">
            {donationAmount >= 10 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                className="p-1.5 bg-yellow-500/20 rounded-lg"
                title="First Donation!"
              >
                <Star className="w-3 h-3 text-yellow-400" />
              </motion.div>
            )}
            {donationAmount >= 50 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                className="p-1.5 bg-green-500/20 rounded-lg"
                title="Comfort Provider"
              >
                <Target className="w-3 h-3 text-green-400" />
              </motion.div>
            )}
            {donationAmount >= 100 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                className="p-1.5 bg-purple-500/20 rounded-lg"
                title="Education Champion"
              >
                <Star className="w-3 h-3 text-purple-400" />
              </motion.div>
            )}
          </div>
        )}
        
        {/* Milestone Messages */}
        <AnimatePresence>
          {donationAmount > 0 && donationAmount % 50 === 0 && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="mt-3 p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg"
            >
              <p className="text-white text-xs font-medium">
                🎉 Milestone reached!
              </p>
              <p className="text-white/70 text-[10px]">
                Ming can now {donationAmount === 50 ? 'learn comfortably' : 
                            donationAmount === 100 ? 'access modern tools' :
                            donationAmount === 150 ? 'enjoy a better environment' :
                            donationAmount === 200 ? 'thrive in class' :
                            'reach his full potential'}!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}