'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartHandshake, 
  GraduationCap, 
  TrendingUp, 
  Users, 
  Home,
  Calculator,
  ChevronRight,
  Sparkles,
  Target,
  BookOpen,
  Utensils,
  Shirt,
  ExternalLink
} from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function ImpactPage() {
  const [donationAmount, setDonationAmount] = useState(500);

  const calculateImpact = (amount: number) => {
    const impacts = [];
    
    if (amount >= 37) impacts.push({ 
      icon: BookOpen, 
      text: `${Math.floor(amount / 37)} Early Childhood Development Kits`,
      source: "UNICEF HK",
      sourceUrl: "https://donation.unicef.org.hk/inspiredgifts/index.php?route=product/product&product_id=70"
    });
    if (amount >= 80) impacts.push({ 
      icon: Utensils, 
      text: `${Math.floor(amount / 80 * 7)} nutritious school meals`,
      source: "HK Government",
      sourceUrl: "https://www.info.gov.hk/gia/general/201801/10/P2018011000687.htm"
    });
    if (amount >= 200) impacts.push({ 
      icon: GraduationCap, 
      text: `${Math.floor(amount / 200)} students with full year supplies`,
      source: "SoCO",
      sourceUrl: "https://soco.org.hk/en/projecthome/child-rights/"
    });
    if (amount >= 1500) impacts.push({ 
      icon: Shirt, 
      text: `${Math.floor(amount / 1500)} students fully equipped for K3`,
      source: "SoCO",
      sourceUrl: "https://soco.org.hk/en/projecthome/child-rights/"
    });
    if (amount >= 4000) impacts.push({ 
      icon: BookOpen, 
      text: `${Math.floor(amount / 4000 * 12)} students receive English tutoring`,
      source: "Project Reach",
      sourceUrl: "https://reach.org.hk/"
    });
    
    return impacts;
  };

  const keyStats = [
    {
      number: "1 in 5",
      label: "children in Hong Kong live in poverty",
      icon: Users,
      color: "from-red-500 to-orange-500",
      source: "HKU Well-being",
      sourceUrl: "https://wellbeing.hku.hk/break-cycle-child-poverty-hong-kong-one-five-children-poor/"
    },
    {
      number: "13%",
      label: "of grassroots youth make it to university",
      icon: GraduationCap,
      color: "from-blue-500 to-cyan-500",
      source: "The Borgen Project",
      sourceUrl: "https://borgenproject.org/generational-poverty-in-hong-kong/"
    },
    {
      number: "HK$16",
      label: "return for every HK$1 invested in early education",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      source: "University of Pennsylvania",
      sourceUrl: "https://www.impact.upenn.edu/early-childhood-toolkit/why-invest/what-is-the-return-on-investment/"
    },
    {
      number: "3.7x",
      label: "more likely for wealthy kids to attend university",
      icon: Target,
      color: "from-purple-500 to-pink-500",
      source: "HKU Well-being",
      sourceUrl: "https://wellbeing.hku.hk/break-cycle-child-poverty-hong-kong-one-five-children-poor/"
    }
  ];

  const donationTiers = [
    {
      amount: 100,
      title: "Meal Hero",
      impact: "Provides monthly meals for one child",
      icon: Utensils,
      color: "bg-gradient-to-br from-amber-400 to-orange-500",
      source: "Project Reach & SoCO",
      sourceUrl: "https://soco.org.hk/en/projecthome/child-rights/"
    },
    {
      amount: 200,
      title: "Supply Champion",
      impact: "Essential school supplies for one student for an entire year",
      icon: BookOpen,
      color: "bg-gradient-to-br from-blue-400 to-indigo-500",
      source: "SoCO",
      sourceUrl: "https://soco.org.hk/en/projecthome/child-rights/"
    },
    {
      amount: 800,
      title: "Class Supporter",
      impact: "Equips 5-10 students with comprehensive school supplies",
      icon: Users,
      color: "bg-gradient-to-br from-emerald-400 to-teal-500",
      source: "Project Reach",
      sourceUrl: "https://reach.org.hk/"
    },
    {
      amount: 2000,
      title: "Education Guardian",
      impact: "Full year of school meals for one child",
      icon: HeartHandshake,
      color: "bg-gradient-to-br from-purple-400 to-pink-500",
      source: "HK Government",
      sourceUrl: "https://www.info.gov.hk/gia/general/201801/10/P2018011000687.htm"
    }
  ];

  const impactMultipliers = [
    { 
      metric: "25%", 
      description: "higher lifetime earnings with quality kindergarten",
      sourceUrl: "https://heckmanequation.org/resource/13-roi-toolbox/"
    },
    { 
      metric: "40%", 
      description: "higher high school graduation rates",
      sourceUrl: "https://www.spriglearning.com/early-literacy-academic-return-on-investment-roi-for-schools/"
    },
    { 
      metric: "60%", 
      description: "less likely to live in poverty as adults",
      sourceUrl: "https://governorsfoundation.org/gelf-articles/13-return-on-investment-in-birth-5-programs-economic-gains-in-early-childhood-development/"
    },
    { 
      metric: "10%", 
      description: "increase in lifetime earnings per year of schooling",
      sourceUrl: "https://blogs.worldbank.org/en/education/2024-Education-Finance-Watch-Highlights-the-Need-for-More-Adequate"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <motion.section 
        initial="initial"
        animate="animate"
        className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white"
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <motion.div variants={fadeIn} className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">Every Dollar Creates Lasting Change</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              Your Impact Multiplied
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-50 mb-8 leading-relaxed">
              In Hong Kong, <a href="https://wellbeing.hku.hk/break-cycle-child-poverty-hong-kong-one-five-children-poor/" target="_blank" rel="noopener noreferrer" className="font-semibold text-white underline decoration-2 decoration-white/30 hover:decoration-white transition-all">222,600 children</a> live below the poverty line.
              Your donation creates a <a href="https://www.impact.upenn.edu/early-childhood-toolkit/why-invest/what-is-the-return-on-investment/" target="_blank" rel="noopener noreferrer" className="font-semibold text-white underline decoration-2 decoration-white/30 hover:decoration-white transition-all">16x return</a> in lifetime benefits.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-purple-600 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all"
              >
                Start Donating Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold text-lg border-2 border-white/30 hover:bg-white/30 transition-all"
              >
                View Success Stories
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Animated decoration */}
        <div className="absolute -bottom-1 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
                  fill="white" />
          </svg>
        </div>
      </motion.section>

      {/* Key Statistics Grid */}
      <motion.section 
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={stagger}
        className="container mx-auto px-4 py-16 md:py-24"
      >
        <motion.div variants={fadeIn} className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            The Reality We're Changing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            These numbers represent real children and families in Hong Kong who need our support
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {keyStats.map((stat, index) => (
            <motion.a
              key={index}
              href={stat.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              variants={fadeIn}
              whileHover={{ scale: 1.05, rotate: 1 }}
              className="relative group block cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"
                   style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}
                   className={`bg-gradient-to-r ${stat.color}`} />
              
              <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-100">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
                
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${stat.color} mb-4`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                
                <div className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                  {stat.number}
                </div>
                
                <p className="text-gray-700 font-medium mb-2">{stat.label}</p>
                <p className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
                  Source: {stat.source} →
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </motion.section>

      {/* Interactive Donation Calculator */}
      <section className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full mb-4">
                <Calculator className="w-5 h-5" />
                <span className="font-medium">Impact Calculator</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                See Your Direct Impact
              </h2>
              <p className="text-xl text-gray-600">
                Every donation amount creates specific, measurable change
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Donation Amount (HKD)
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="37"
                    max="10000"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(Number(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-purple-200 to-pink-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="mt-4 text-center">
                    <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                      HK${donationAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={donationAmount}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-3"
                >
                  <p className="text-sm font-medium text-gray-500 mb-4">Your donation will provide:</p>
                  {calculateImpact(donationAmount).map((impact, index) => (
                    <motion.a
                      key={index}
                      href={impact.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-colors group"
                    >
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <impact.icon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-gray-800 block">{impact.text}</span>
                        <span className="text-xs text-gray-500 group-hover:text-gray-700 flex items-center gap-1 mt-1">
                          Source: {impact.source} <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </motion.a>
                  ))}
                </motion.div>
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-8 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Donate HK${donationAmount.toLocaleString()} Now
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Donation Tiers */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div variants={fadeIn} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Choose Your Impact Level
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Every contribution level creates meaningful change in children's lives
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {donationTiers.map((tier, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                whileHover={{ y: -8 }}
                className="group cursor-pointer"
              >
                <div className="h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-gray-100">
                  <div className={`h-2 ${tier.color}`} />
                  
                  <div className="p-6">
                    <div className={`inline-flex p-3 rounded-xl ${tier.color} mb-4`}>
                      <tier.icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.title}</h3>
                    
                    <div className="text-3xl font-bold text-gray-900 mb-4">
                      HK${tier.amount}
                    </div>
                    
                    <p className="text-gray-600 mb-2">{tier.impact}</p>
                    
                    <a 
                      href={tier.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-4 transition-colors"
                    >
                      Source: {tier.source}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    
                    <button className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      Select This Level
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Long-term Impact Section */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-5xl mx-auto"
          >
            <motion.div variants={fadeIn} className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                The Lifetime Impact
              </h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Your donation today creates benefits that last a lifetime
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {impactMultipliers.map((item, index) => (
                <motion.a
                  key={index}
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={fadeIn}
                  className="flex items-start gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-colors group"
                >
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    {item.metric}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg text-slate-200">{item.description}</p>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400 group-hover:text-slate-300 mt-2">
                      View source <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </motion.a>
              ))}
            </div>

            <motion.div 
              variants={fadeIn}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 md:p-12 text-center"
            >
              <h3 className="text-3xl font-bold mb-4">
                Ready to Change Lives?
              </h3>
              <p className="text-xl mb-8 text-blue-50">
                Join thousands of donors who are breaking the cycle of poverty through education
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-blue-600 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all"
                >
                  Donate Now
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-transparent text-white rounded-full font-semibold text-lg border-2 border-white hover:bg-white/10 transition-all"
                >
                  Learn More
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">Trusted by leading organizations</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-gray-700 font-semibold">HKU Well-being</div>
            <div className="text-gray-700 font-semibold">Save the Children</div>
            <div className="text-gray-700 font-semibold">UNICEF Hong Kong</div>
            <div className="text-gray-700 font-semibold">Teach for Hong Kong</div>
          </div>
          <p className="text-xs text-gray-500 mt-8">
            Tax deductible up to 35% of assessable income for donations above HKD 100
          </p>
        </div>
      </section>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: white;
          border: 3px solid #a855f7;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        
        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: white;
          border: 3px solid #a855f7;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
      `}</style>
    </div>
  );
}