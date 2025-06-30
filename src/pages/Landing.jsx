import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAward, FiMic, FiUser, FiArrowRight, FiGlobe, FiCheckCircle, FiPlay, FiChevronRight } from 'react-icons/fi';
import { FaLanguage, FaUserFriends, FaRegSmileBeam } from 'react-icons/fa';
import { GiConversation, GiAchievement } from 'react-icons/gi';
import { RiChatSmile2Line } from 'react-icons/ri';

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
    { 
      icon: <GiConversation size={40} className="text-pink-600" />, 
      title: 'Conversation Practice', 
      desc: 'Real-life dialogue simulations with native pronunciation',
      bg: 'bg-gradient-to-br from-pink-50 to-white'
    },
    { 
      icon: <FiAward size={40} className="text-pink-600" />, 
      title: 'Gamified Learning', 
      desc: 'Earn badges, level up, and track your progress',
      bg: 'bg-gradient-to-br from-blue-50 to-white'
    },
    { 
      icon: <FaUserFriends size={40} className="text-pink-600" />, 
      title: 'Community Challenges', 
      desc: 'Compete with friends and learners worldwide',
      bg: 'bg-gradient-to-br from-purple-50 to-white'
    }
  ];

  const stats = [
    { value: '50+', label: 'Languages', icon: <FaLanguage className="text-pink-600" /> },
    { value: '10M+', label: 'Learners', icon: <FiUser className="text-pink-600" /> },
    { value: '98%', label: 'Satisfaction', icon: <FaRegSmileBeam className="text-pink-600" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-blue-50 overflow-hidden">
      {/* Floating decorative elements */}
      <div className="fixed top-20 left-10 w-32 h-32 rounded-full bg-pink-200 opacity-20 blur-xl"></div>
      <div className="fixed bottom-1/4 right-20 w-48 h-48 rounded-full bg-blue-200 opacity-20 blur-xl"></div>
      <div className="fixed top-1/3 right-1/4 w-24 h-24 rounded-full bg-purple-200 opacity-20 blur-xl"></div>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20 md:py-32 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex flex-col lg:flex-row items-center gap-12"
        >
          <motion.div variants={itemVariants} className="lg:w-1/2">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-pink-100 rounded-full">
                <GiAchievement className="text-pink-600 text-xl" />
              </div>
              <span className="text-sm font-semibold text-pink-600 uppercase tracking-wider">Most Innovative 2025</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
              Speak <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-pink-400">Confidently</span> with Speakably
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-10">
              The most engaging way to learn languages. Start speaking naturally from day one.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div 
                whileHover={{ scale: 1.03 }} 
                whileTap={{ scale: 0.98 }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-pink-400 rounded-full opacity-75 blur-sm group-hover:opacity-100 transition duration-200"></div>
                <Link
                  to="/signup"
                  className="relative bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white font-semibold py-4 px-8 rounded-full shadow-lg transition duration-300 text-center block sm:inline-block flex items-center justify-center gap-2"
                >
                  Start Learning Free <FiArrowRight />
                </Link>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.03 }} 
                whileTap={{ scale: 0.98 }}
                className="relative group"
              >
                <Link
                  to="/login"
                  className="relative border-2 border-gray-900 hover:bg-gray-900/5 font-semibold py-4 px-8 rounded-full shadow-sm transition duration-300 text-center block sm:inline-block flex items-center justify-center gap-2"
                >
                  Existing User <FiUser />
                </Link>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants} 
            className="lg:w-1/2 relative"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-pink-400 to-blue-400 rounded-3xl opacity-20 blur-xl"></div>
              <div className="relative bg-white p-8 rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-pink-100 to-blue-100 rounded-full flex items-center justify-center mb-6">
                    <RiChatSmile2Line className="text-pink-600 text-5xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">The fastest way to fluency</h3>
                  <p className="text-gray-600 mb-6 text-lg">Our method helps you learn 2x faster than traditional approaches</p>
                  <div className="flex items-center gap-2 text-pink-600 font-semibold">
                    <span>See how it works</span>
                    <FiChevronRight />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why Learn With <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-pink-400">Speakably</span>?
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Our science-backed approach accelerates your language learning
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
              className={`${feature.bg} p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100`}
            >
              <div className="mb-6 flex justify-center">
                <div className="p-4 rounded-2xl bg-white shadow-md text-pink-600">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">{feature.title}</h3>
              <p className="text-gray-700 text-center text-lg">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-6 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center"
              >
                <div className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent mb-3">{stat.value}</div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 rounded-full shadow-sm text-pink-600">
                    {stat.icon}
                  </div>
                  <span className="text-lg font-medium text-gray-700">{stat.label}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Final CTA */}
      <div className="container mx-auto px-6 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-pink-600 to-pink-500 rounded-3xl shadow-2xl p-12 text-center text-white relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-white/10 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-white/10 translate-x-1/4 translate-y-1/4"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Start your language journey today
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join millions of learners who have transformed their language skills
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.98 }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 transition duration-200"></div>
                <Link
                  to="/signup"
                  className="relative bg-white hover:bg-gray-100 text-pink-600 font-semibold py-4 px-8 rounded-full shadow-lg transition duration-300 inline-block flex items-center justify-center gap-2"
                >
                  Get Started Free <FiArrowRight />
                </Link>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.98 }}
                className="relative group"
              >
                <Link
                  to="/about"
                  className="relative border-2 border-white hover:bg-white/10 font-semibold py-4 px-8 rounded-full shadow-lg transition duration-300 inline-block flex items-center justify-center gap-2"
                >
                  Learn More <FiChevronRight />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Landing;