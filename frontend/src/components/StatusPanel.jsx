import React from 'react';

const StatusPanel = ({ solved, cluesFound, requiredConcept }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-800 text-white p-3">
        <h2 className="font-mono text-lg">Case Status</h2>
      </div>
      <div className="p-4">
        {solved ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
            <h3 className="text-green-800 font-bold text-lg mb-2">Case Solved!</h3>
            <p className="text-green-700">Congratulations detective! You cracked the case with SQL.</p>
          </div>
        ) : (
          <div>
            <h3 className="font-medium mb-2">Progress</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${Math.min(100, cluesFound * 20)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mb-4">{cluesFound} clues found</p>
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800">Required SQL Concept: <span className="font-semibold">{requiredConcept}</span></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusPanel; 