export default function Avatar({ username, size = 32, className = '' }) {
  const colors = [
    'bg-pink-500', 
    'bg-blue-500', 
    'bg-green-500', 
    'bg-purple-500', 
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500'
  ];
  
  const colorIndex = username?.charCodeAt(0) % colors.length || 0;
  
  return (
    <div 
      className={`${colors[colorIndex]} rounded-full flex items-center justify-center text-white ${className}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        fontSize: `${size * 0.5}px`
      }}
    >
      {username?.charAt(0).toUpperCase()}
    </div>
  );
}