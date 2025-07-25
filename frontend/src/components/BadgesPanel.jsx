import React from 'react';

const BADGES = [
  { key: 'join', name: 'JOIN Master', icon: '🔗' },
  { key: 'crime', name: 'Crime Solver', icon: '🕵️' },
  { key: 'select', name: 'SELECT Pro', icon: '🎯' },
  { key: 'hint', name: 'Hint Used', icon: '💡' },
  { key: 'speed', name: 'Speed Runner', icon: '⏱️' },
  { key: 'perfect', name: 'Perfect Case', icon: '🏆' },
  { key: 'first', name: 'First Blood', icon: '🥇' },
];

const BadgesPanel = ({ progress }) => {
  // Example: progress = { join: true, crime: false, select: true }
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="bg-gray-800 text-white p-3">
        <h2 className="font-mono text-lg">Your Badges</h2>
      </div>
      <div className="p-4 flex flex-wrap gap-4">
        {BADGES.map(badge => (
          <div key={badge.key} className={`flex flex-col items-center p-3 rounded-md border ${progress[badge.key] ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
            <span className="text-3xl mb-2">{badge.icon}</span>
            <span className={`font-semibold ${progress[badge.key] ? 'text-green-700' : 'text-gray-500'}`}>{badge.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BadgesPanel; 