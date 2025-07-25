import React from 'react';

const ResultsTable = ({ results, columns, loading }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-800 text-white p-3">
        <h2 className="font-mono text-lg">Query Results</h2>
      </div>
      <div className="p-4 h-64 overflow-auto">
        {results.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((col, i) => (
                    <th key={i} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                        {cell !== null ? String(cell) : 'NULL'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            {loading ? 'Executing query...' : 'No results to display. Run a query to see results.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsTable;