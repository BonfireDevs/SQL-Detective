import React, { useEffect, useState } from 'react';

const LeaderboardPanel = () => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    setEntries(data);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="bg-gray-800 text-white p-3">
        <h2 className="font-mono text-lg">Leaderboard</h2>
      </div>
      <div className="p-4">
        {entries.length === 0 ? (
          <div className="text-gray-500">No entries yet. Solve a case to appear here!</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time (s)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entries.map((entry, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{entry.user}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{entry.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPanel; 