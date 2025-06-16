import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTarget, FiAward, FiMic, FiUser, FiArrowRight, FiGlobe, FiCheckCircle } from 'react-icons/fi';
import { FaQuoteLeft, FaLanguage, FaUserFriends, FaChartLine } from 'react-icons/fa';
import { GiConversation, GiAchievement } from 'react-icons/gi';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

function Landing() {
  const features = [
    { icon: <GiConversation size={32} className="text-[#F2B5D4]" />, title: 'Conversation Practice', desc: 'Real-life dialogue simulations' },
    { icon: <FiAward size={32} className="text-[#F2B5D4]" />, title: 'Gamified Learning', desc: 'Earn badges and level up' },
    { icon: <FaUserFriends size={32} className="text-[#F2B5D4]" />, title: 'Community Challenges', desc: 'Compete with friends globally' }
  ];

  const stats = [
    { value: '50+', label: 'Languages', icon: <FaLanguage className="text-[#F2B5D4]" /> },
    { value: '10M+', label: 'Learners', icon: <FiUser className="text-[#F2B5D4]" /> },
    { value: '98%', label: 'Satisfaction', icon: <FiCheckCircle className="text-[#F2B5D4]" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e2f3f8]">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20 md:py-32">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex flex-col lg:flex-row items-center gap-12"
        >
          <motion.div variants={itemVariants} className="lg:w-1/2">
            <div className="flex items-center gap-2 mb-4">
              <GiAchievement className="text-[#F2B5D4] text-2xl" />
              <span className="text-sm font-semibold text-[#F2B5D4] uppercase tracking-wider">Most Innovative 2024</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Speak <span className="text-[#F2B5D4]">Confidently</span> with Speakably
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10">
              The most engaging way to learn languages. Start speaking naturally from day one.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-[#F2B5D4] to-[#a5d8ff] hover:from-[#e8a0c8] hover:to-[#8fc9ff] text-white font-semibold py-3 px-8 rounded-full shadow-lg transition duration-300 text-center block sm:inline-block flex items-center justify-center gap-2"
                >
                  Start Learning Free <FiArrowRight />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/login"
                  className="border-2 border-[#F2B5D4] text-[#F2B5D4] hover:bg-[#F2B5D4]/10 font-semibold py-3 px-8 rounded-full shadow-sm transition duration-300 text-center block sm:inline-block flex items-center justify-center gap-2"
                >
                  Existing User <FiUser />
                </Link>
              </motion.div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:w-1/2">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-[#F2B5D4] to-[#a5d8ff] rounded-3xl opacity-20 blur-xl"></div>
              <div className="relative bg-white p-1 rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-br from-[#f8f0fc] to-[#e6f9ff] p-6 rounded-2xl">
                  <div className="flex items-center justify-center mb-4">
                    <FiGlobe className="text-[#F2B5D4] text-4xl" />
                  </div>
                  <div className="space-y-4">
                    {stats.map((stat, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full shadow-sm">
                          {stat.icon}
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                          <p className="text-gray-600">{stat.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Learn With Speakably?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our unique approach makes language learning stick
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="mb-6 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{feature.title}</h3>
              <p className="text-gray-600 text-center">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-[#F2B5D4] to-[#a5d8ff] rounded-3xl p-8 md:p-12 text-white"
        >
          <div className="max-w-3xl mx-auto">
            <FaQuoteLeft className="text-3xl mb-6 opacity-50" />
            <blockquote className="text-xl md:text-2xl font-medium mb-8">
              "Speakably transformed how I learn languages. In just 3 months, I went from basic phrases to fluent conversations. The gamification makes practice addictive!"
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="bg-white p-1 rounded-full">
                <div className="bg-gray-200 w-12 h-12 rounded-full"></div>
              </div>
              <div>
                <p className="font-bold">Sarah K.</p>
                <p className="opacity-80">Spanish Learner</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Final CTA */}
      <div className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#F2B5D4] to-[#a5d8ff] rounded-3xl shadow-2xl p-8 md:p-12 text-center text-white"
        >
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to speak confidently?
            </h2>
            <p className="text-xl mb-8">
              Join our community of language learners today
            </p>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block"
            >
              <Link
                to="/signup"
                className="bg-white hover:bg-gray-100 text-[#F2B5D4] font-semibold py-4 px-12 rounded-full shadow-lg transition duration-300 inline-block flex items-center gap-2 mx-auto"
              >
                Get Started Now <FiArrowRight />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Landing;