import { useState, useEffect, useRef } from 'react';
import API from '../utils/api';
import { 
  FiMessageSquare, 
  FiSend, 
  FiHeart, 
  FiMoreHorizontal,
  FiUser,
  FiFlag,
  FiChevronDown,
  FiCheck,
  FiBook,
  FiAward,
  FiX
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import TimeAgo from 'react-timeago';
import Avatar from '../pages/Avatar';
import { useNavigate, useLocation } from 'react-router-dom';

export default function CommunityTab() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [userCommunities, setUserCommunities] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState('');
  const [newCommunityLanguage, setNewCommunityLanguage] = useState('');
  const [activeLanguage, setActiveLanguage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userLanguages, setUserLanguages] = useState([]);
  const [comments, setComments] = useState({});
  const [showCommentInput, setShowCommentInput] = useState({});
  const [commentText, setCommentText] = useState({});
  const [posting, setPosting] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [communityMessages, setCommunityMessages] = useState([]);
  const [newCommunityMessage, setNewCommunityMessage] = useState('');
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Fetch communities
  const fetchCommunities = async () => {
    try {
      const res = await API.get('community/');
      setCommunities(res.data);
    } catch (error) {
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to load communities');
    }
  };

  const fetchUserCommunities = async () => {
    try {
      const res = await API.get('community/user/');
      setUserCommunities(res.data);
    } catch (error) {
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to load your communities');
    }
  };

  const fetchPosts = async () => {
    try {
      const params = {};
      if (activeLanguage) {
        params.language = activeLanguage;
      }
      const res = await API.get('community/posts/', { params });
      setPosts(res.data);
    } catch (error) {
      toast.error('Failed to load posts');
      console.error('Fetch posts error:', error);
    }
  };

  // Handle post submission
  const handleSubmit = async () => {
    if (!newPost.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }

    if (!activeLanguage) {
      toast.error('Please select a language for your post');
      return;
    }

    try {
      setPosting(true);
      const res = await API.post('community/posts/create/', {
        content: newPost,
        language: activeLanguage
      });
      
      // Update posts state with the new post at the beginning
      setPosts(prevPosts => [res.data, ...prevPosts]);
      setNewPost('');
      toast.success('Post created!');
    } catch (error) {
      console.error('Post error details:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  // Create community
  const createCommunity = async () => {
    if (!newCommunityName.trim() || !newCommunityLanguage) {
      toast.error('Please provide a name and select a language');
      return;
    }

    try {
      setPosting(true);
      const res = await API.post('community/create/', {
        name: newCommunityName,
        language: newCommunityLanguage
      });
      
      // Update state with the new community
      setCommunities(prev => [res.data, ...prev]);
      setUserCommunities(prev => [res.data, ...prev]);
      toast.success('Community created!');
      setShowCreateCommunity(false);
      setNewCommunityName('');
      setNewCommunityLanguage('');
    } catch (error) {
      console.error('Community creation error:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to create community');
    } finally {
      setPosting(false);
    }
  };

  // Toggle like on post
  const toggleLike = async (postId) => {
    try {
      await API.post(`community/posts/${postId}/like/`);
      setPosts(posts.map(post =>
        post.id === postId ? {
          ...post,
          likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1,
          is_liked: !post.is_liked
        } : post
      ));
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  // Toggle comment section
  const toggleCommentSection = (postId) => {
    setShowCommentInput(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));

    if (!comments[postId] && !showCommentInput[postId]) {
      fetchComments(postId);
    }
  };

  // Fetch comments for a post
  const fetchComments = async (postId) => {
    try {
      const res = await API.get(`community/posts/${postId}/comments/`);
      setComments(prev => ({ ...prev, [postId]: res.data }));
    } catch (error) {
      toast.error('Failed to load comments');
    }
  };

  // Add comment to a post
  const addComment = async (postId) => {
    const content = commentText[postId];
    if (!content?.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      const res = await API.post(`community/posts/${postId}/comments/`, { content });
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), res.data]
      }));
      setCommentText(prev => ({ ...prev, [postId]: '' }));
      
      // Update comments count in posts list
      setPosts(posts.map(post => 
        post.id === postId ? {
          ...post,
          comments_count: post.comments_count + 1
        } : post
      ));
      
      toast.success('Comment added!');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLanguageDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [langsRes] = await Promise.all([
          API.get('profiles/me/'),
        ]);
        setUserLanguages(langsRes.data.learning_languages || []);
        await fetchPosts();
        await fetchCommunities();
        await fetchUserCommunities();
      } catch (error) {
        toast.error('Failed to load community data');
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Refresh posts when language filter changes
  useEffect(() => {
    if (userLanguages.length > 0) {
      fetchPosts();
    }
  }, [activeLanguage]);

  // Join Community function
  const joinCommunity = async (communityId) => {
    try {
      await API.post(`community/${communityId}/join/`);
      // Update both communities and userCommunities state
      setCommunities(communities.map(community => 
        community.id === communityId 
          ? { 
              ...community, 
              member_count: community.member_count + 1,
              is_member: true 
            } 
          : community
      ));
      setUserCommunities(prev => [
        ...prev,
        communities.find(c => c.id === communityId)
      ]);
      toast.success('Joined community successfully!');
    } catch (error) {
      console.error('Join error:', error);
      toast.error(error.response?.data?.error || 'Failed to join community');
    }
  };

  // Function to open a community
  const openCommunity = async (community) => {
    setSelectedCommunity(community);
    try {
      const res = await API.get(`community/${community.id}/messages/`);
      setCommunityMessages(res.data);
    } catch (error) {
      toast.error('Failed to load community messages');
    }
  };

  // Function to send a message
  const sendCommunityMessage = async () => {
    if (!newCommunityMessage.trim() || !selectedCommunity) return;
    
    try {
      const res = await API.post(`community/${selectedCommunity.id}/messages/send/`, {
        content: newCommunityMessage
      });
      setCommunityMessages([...communityMessages, res.data]);
      setNewCommunityMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      {/* Create Post Section */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Ask a question or share something with the community..."
          className="w-full p-3 border border-gray-200 rounded-lg mb-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          rows={3}
        />
        
        <div className="flex justify-between items-center">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="flex items-center space-x-1 border rounded-lg px-3 py-2 text-sm"
            >
              <FiFlag className="text-gray-500" />
              <span>
                {activeLanguage 
                  ? userLanguages.find(l => l.id === activeLanguage)?.name 
                  : 'All Languages'}
              </span>
              <FiChevronDown className="text-gray-500" />
            </button>
            
            <AnimatePresence>
              {showLanguageDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg"
                >
                  <div 
                    className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                    onClick={() => {
                      setActiveLanguage(null);
                      setShowLanguageDropdown(false);
                    }}
                  >
                    <span>All Languages</span>
                    {!activeLanguage && <FiCheck />}
                  </div>
                  {userLanguages.map(lang => (
                    <div 
                      key={lang.id}
                      className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                      onClick={() => {
                        setActiveLanguage(lang.id);
                        setShowLanguageDropdown(false);
                      }}
                    >
                      <span>{lang.name}</span>
                      {activeLanguage === lang.id && <FiCheck />}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={posting || !newPost.trim()}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50 transition-colors"
          >
            {posting ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            ) : (
              <FiSend className="mr-2" />
            )}
            Post
          </button>
        </div>
      </div>

      {/* Communities Section */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <h2 className="text-lg font-bold mb-4">Language Communities</h2>
        
        <div className="grid grid-cols-2 gap-3">
          {communities.map(community => {
            const isMember = userCommunities.some(c => c.id === community.id);
            return (
              <div 
                key={community.id} 
                className="p-3 border rounded-lg hover:bg-pink-50 cursor-pointer"
                onClick={() => openCommunity(community)}
              >
                <h3 className="font-bold">{community.name}</h3>
                <p className="text-sm text-gray-500">{community.language.name}</p>
                <p className="text-xs text-gray-400 mt-1">{community.member_count} members</p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    isMember ? null : joinCommunity(community.id);
                  }}
                  className={`mt-2 text-sm px-3 py-1 rounded-full ${
                    isMember
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-pink-500 text-white hover:bg-pink-600'
                  }`}
                >
                  {isMember ? 'Joined' : 'Join'}
                </button>
              </div>
            );
          })}
        </div>

        <button 
          onClick={() => setShowCreateCommunity(true)}
          className="mt-4 text-sm bg-pink-500 text-white px-4 py-2 rounded-lg"
        >
          Create New Community
        </button>

        {showCreateCommunity && (
          <div className="mt-4 p-4 border-t">
            <h3 className="font-bold mb-2">Create Community</h3>
            <input
              type="text"
              placeholder="Community name"
              value={newCommunityName}
              onChange={(e) => setNewCommunityName(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />
            <select
              value={newCommunityLanguage}
              onChange={(e) => setNewCommunityLanguage(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            >
              <option value="">Select a language</option>
              {userLanguages.map(lang => (
                <option key={lang.id} value={lang.id}>{lang.name}</option>
              ))}
            </select>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setShowCreateCommunity(false)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>
              <button 
                onClick={createCommunity}
                disabled={posting}
                className="px-3 py-1 bg-pink-500 text-white rounded disabled:opacity-50"
              >
                {posting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map(post => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar username={post.user.username} size={40} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">
                          {post.user.username}
                        </h3>
                        <span className="text-xs text-gray-500">
                          <TimeAgo date={post.created_at} />
                        </span>
                      </div>
                      
                      {post.language && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-100 text-pink-800 mb-1">
                          {post.language.name}
                        </span>
                      )}
                      
                      <p className="text-gray-700 mt-1 whitespace-pre-line">{post.content}</p>
                      
                      <div className="flex items-center mt-3 space-x-4">
                        <button 
                          onClick={() => toggleLike(post.id)}
                          className={`flex items-center ${post.is_liked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'}`}
                        >
                          <FiHeart className="mr-1" />
                          <span>{post.likes_count || 0}</span>
                        </button>
                        
                        <button 
                          onClick={() => toggleCommentSection(post.id)}
                          className="flex items-center text-gray-500 hover:text-pink-500"
                        >
                          <FiMessageSquare className="mr-1" />
                          <span>{post.comments_count || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Comments Section */}
                <AnimatePresence>
                  {showCommentInput[post.id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-gray-50 p-4 border-t"
                    >
                      <div className="space-y-3">
                        {comments[post.id]?.map(comment => (
                          <div key={comment.id} className="flex space-x-2">
                            <Avatar username={comment.user.username} size={32} />
                            <div className="flex-1 bg-white p-3 rounded-lg shadow-sm">
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-medium text-gray-900">
                                  {comment.user.username}
                                </div>
                                <span className="text-xs text-gray-500">
                                  <TimeAgo date={comment.created_at} />
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                        
                        <div className="flex mt-2">
                          <input
                            type="text"
                            placeholder="Add a comment..."
                            value={commentText[post.id] || ''}
                            onChange={(e) => setCommentText(prev => ({
                              ...prev,
                              [post.id]: e.target.value
                            }))}
                            className="flex-1 text-sm border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pink-500"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && commentText[post.id]?.trim()) {
                                addComment(post.id);
                              }
                            }}
                          />
                          <button 
                            onClick={() => addComment(post.id)}
                            disabled={!commentText[post.id]?.trim()}
                            className="bg-pink-500 text-white px-3 py-2 rounded-r-lg text-sm disabled:opacity-50 transition-colors"
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {activeLanguage 
                ? `No posts found for ${userLanguages.find(l => l.id === activeLanguage)?.name}. Be the first to post!`
                : "No posts found. Be the first to post!"}
            </div>
          )}
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 px-4 max-w-4xl mx-auto rounded-t-xl shadow-lg">
        <button 
          onClick={() => navigate('/home')}
          className={`flex flex-col items-center ${location.pathname === '/home' ? 'text-pink-600' : 'text-gray-500'}`}
        >
          <div className={`p-2 rounded-full ${location.pathname === '/home' ? 'bg-pink-100' : 'bg-gray-100'}`}>
            <FiBook className="text-xl" />
          </div>
          <span className="text-xs mt-1 font-medium">Learn</span>
        </button>
        
        <button 
          onClick={() => navigate('/community')}
          className={`flex flex-col items-center ${location.pathname === '/community' ? 'text-pink-600' : 'text-gray-500'}`}
        >
          <div className={`p-2 rounded-full ${location.pathname === '/community' ? 'bg-pink-100' : 'bg-gray-100'}`}>
            <FiUser className="text-xl" />
          </div>
          <span className="text-xs mt-1 font-medium">Community</span>
        </button>
        
        <button 
          onClick={() => navigate('/leaderboard')}
          className={`flex flex-col items-center ${location.pathname === '/leaderboard' ? 'text-pink-600' : 'text-gray-500'}`}
        >
          <div className={`p-2 rounded-full ${location.pathname === '/leaderboard' ? 'bg-pink-100' : 'bg-gray-100'}`}>
            <FiAward className="text-xl" />
          </div>
          <span className="text-xs mt-1 font-medium">Leaderboard</span>
        </button>
        
        <button 
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center ${location.pathname === '/profile' ? 'text-pink-600' : 'text-gray-500'}`}
        >
          <div className={`p-2 rounded-full ${location.pathname === '/profile' ? 'bg-pink-100' : 'bg-gray-100'}`}>
            <FiUser className="text-xl" />
          </div>
          <span className="text-xs mt-1 font-medium">Profile</span>
        </button>
      </div>

      {/* Community Chat Modal */}
      {selectedCommunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md h-[80vh] flex flex-col">
            {/* Header */}
            <div className="bg-pink-500 text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar username={selectedCommunity.name} size={40} />
                <div>
                  <h3 className="font-bold">{selectedCommunity.name}</h3>
                  <p className="text-xs">{selectedCommunity.member_count} members</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCommunity(null)} 
                className="text-white hover:text-gray-200"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {communityMessages.map(message => (
                <div key={message.id} className="flex space-x-2">
                  <Avatar username={message.user.username} size={32} />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{message.user.username}</span>
                      <span className="text-xs text-gray-500">
                        <TimeAgo date={message.created_at} />
                      </span>
                    </div>
                    <p className="text-gray-800">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="border-t p-3">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newCommunityMessage}
                  onChange={(e) => setNewCommunityMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  onKeyPress={(e) => e.key === 'Enter' && sendCommunityMessage()}
                />
                <button
                  onClick={sendCommunityMessage}
                  disabled={!newCommunityMessage.trim()}
                  className="bg-pink-500 text-white p-2 rounded-full hover:bg-pink-600 disabled:opacity-50"
                >
                  <FiSend />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}