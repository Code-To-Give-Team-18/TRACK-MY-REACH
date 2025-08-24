'use client';

import { motion } from 'framer-motion';
import { Users, Star } from 'lucide-react';

const team = [
	{
		name: 'Vivian Chung',
		role: 'Co-Founder',
		desc: 'Award-winning education specialist with 20+ years of experience teaching English reading and writing through story books. MA in Psychology in Education from Columbia University.',
		icon: <Users className="w-8 h-8 text-orange-400 mb-2" />,
	},
	{
		name: 'Quincy Tse',
		role: 'Co-Founder, Director of Outreach',
		desc: '15 years in global Fintech, 18+ years co-running education charities. Director of Special Projects at Fortune 500 companies. Council Member of Access HK.',
		icon: <Users className="w-8 h-8 text-orange-400 mb-2" />,
	},
	{
		name: 'Sally Ng',
		role: 'Co-Founder, Honorary Education Consultant',
		desc: 'Native English teacher since 2007, expert in curriculum development and effective, enjoyable learning for students in HK, UK, and US.',
		icon: <Users className="w-8 h-8 text-orange-400 mb-2" />,
	},
	{
		name: 'Myolie Lau',
		role: 'Director of Education and Outreach',
		desc: 'Joined REACH in 2022, former English NET Teacher, passionate about helping children discover and appreciate the beauty of English.',
		icon: <Users className="w-8 h-8 text-orange-400 mb-2" />,
	},
];

const sponsors = [
	'Egon Zehnder Hong Kong',
	'Story Jungle Education Centre Hong Kong',
	'Time Auction Hong Kong',
	'Allen & Overy Hong Kong',
	'Charitable Choice Hong Kong',
	'Warburg Pincus Asia Hong Kong',
	'The University of Hong Kong Faculty of Social Sciences',
	'The Education University of Hong Kong Department of English Language Education',
	'Principal Chan Free Tutorial World',
	'New Home Association',
	'Hope of the City',
	'Asbury Methodist Social Service',
	'Yan Oi Tong Dan Yang Wing Man Kindergarten Cum Nursery',
	'Society for Community Organization',
	'Yan Oi Tong Pang Hung Cheung Kindergarten',
	'Yan Oi Tong Mrs Cheng Ting Kong Kindergarten',
	'The University of Hong Kong Department of Pharmacology and Pharmacy',
];

export default function AboutPage() {
	return (
		<section className="py-20 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 min-h-screen">
			<div className="container mx-auto px-4">
				<h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">About Us</h1>
				{/* Card grid for team */}
				<h2 className="text-2xl font-semibold text-orange-700 mb-4 text-center">Our Team</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
					{team.map((member, idx) => (
						<motion.div
							key={member.name}
							whileHover={{ scale: 1.04 }}
							className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center border border-orange-100"
						>
							{member.icon}
							<h3 className="font-bold text-lg text-pink-700 mb-1">{member.name}</h3>
							<p className="text-sm text-gray-700 mb-1">{member.role}</p>
							<p className="text-xs text-gray-600">{member.desc}</p>
						</motion.div>
					))}
				</div>
				{/* Card grid for sponsors */}
				<h2 className="text-2xl font-semibold text-orange-700 mb-4 text-center">Partners & Sponsors</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{sponsors.map((s, i) => (
						<motion.div
							key={s}
							whileHover={{ scale: 1.04 }}
							className="bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 rounded-xl shadow p-6 flex items-center gap-3 border border-orange-100"
						>
							<Star className="w-6 h-6 text-yellow-400" />
							<span className="text-sm text-gray-700">{s}</span>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}