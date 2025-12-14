import React from 'react';

const PolyBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-slate-900">
        {/* Abstract shapes generated via SVG */}
        <svg className="absolute w-full h-full opacity-20" preserveAspectRatio="none">
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#4f46e5', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#06b6d4', stopOpacity: 1}} />
                </linearGradient>
                <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#db2777', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#7c3aed', stopOpacity: 1}} />
                </linearGradient>
            </defs>
            
            {/* Large Triangles */}
            <path d="M0,0 L1000,0 L0,1000 Z" fill="url(#grad1)" transform="scale(2)" opacity="0.3" />
            <path d="M100%,100% L100%,0 L0,100% Z" fill="url(#grad2)" transform="scale(2) translate(-500, -500)" opacity="0.3" />
            
            {/* Floating shards */}
            <polygon points="100,100 250,50 200,200" fill="#6366f1" opacity="0.4" className="animate-pulse" />
            <polygon points="800,600 950,550 900,700" fill="#ec4899" opacity="0.3" />
            <polygon points="50%,50% 60%,40% 60%,60%" fill="#14b8a6" opacity="0.2" />
        </svg>
    </div>
  );
};

export default PolyBackground;