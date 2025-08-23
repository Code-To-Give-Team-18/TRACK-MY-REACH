'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { donationService, LeaderboardDonor } from '@/services/donation.service';
import { regionsService, type Region } from '@/services/regions.service';

export default function Leaderboard() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [donorsByRegion, setDonorsByRegion] = useState<Record<string, LeaderboardDonor[]>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const regionsData = await regionsService.getRegions();
        setRegions(regionsData);

        const allDonors = await donationService.getTopDonors(100);

        // Group donors by region (use donor.region directly)
        const grouped: Record<string, LeaderboardDonor[]> = {};
        allDonors.forEach(d => {
          const regionName = d.region?.trim() || "Unknown";
          if (!grouped[regionName]) grouped[regionName] = [];
          grouped[regionName].push(d);
        });

        // Keep top 3 donors per region
        Object.keys(grouped).forEach(region => {
          grouped[region] = grouped[region]
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 3);
        });

        setDonorsByRegion(grouped);
      } catch (err) {
        console.error(err);
      }
    }

    fetchData();
  }, []);

  return (
    <section className="py-16 bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900"
        >
          🌟 Our Top Donors
        </motion.h2>

        {regions.map(region => {
          // Use exact string match or fallback to "Unknown"
          const donors = donorsByRegion[region.name] || [];
          return (
            <div key={region.id} className="mb-8">
              <h3 className="text-2xl font-semibold mb-4">{region.name}</h3>
              {donors.length > 0 ? (
                <ul className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
                  {donors.map(donor => (
                    <li
                      key={donor.id}
                      className="flex items-center justify-between px-6 py-4 border-b last:border-b-0"
                    >
                      <p className="font-semibold text-gray-800">{donor.name}</p>
                      <p className="font-bold text-orange-600">${donor.amount}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 italic">
                  No donors yet, you can be the next one!
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
