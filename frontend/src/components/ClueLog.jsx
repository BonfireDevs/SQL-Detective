import React from 'react';

const ClueLog = ({ clues }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-800 text-white p-3">
        <h2 className="font-mono text-lg">Clue Log</h2>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-lg mb-2">Discovered Clues</h3>
        <ul className="space-y-2">
          {clues.map((clue, index) => (
            <li key={index} className="flex items-start">
              <span className="inline-block bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs mr-2">{index + 1}</span>
              <span>{clue}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ClueLog; 