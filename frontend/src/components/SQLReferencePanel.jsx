import React from 'react';

const SQLReferencePanel = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 p-4">
    <h2 className="font-mono text-lg mb-2 text-blue-800">SQL Reference</h2>
    <ul className="list-disc ml-6 text-sm text-gray-700">
      <li><b>SELECT</b>: <code>SELECT column1, column2 FROM table;</code></li>
      <li><b>WHERE</b>: <code>SELECT * FROM table WHERE condition;</code></li>
      <li><b>JOIN</b>: <code>SELECT a.col, b.col FROM a JOIN b ON a.id = b.a_id;</code></li>
      <li><b>GROUP BY</b>: <code>SELECT col, COUNT(*) FROM table GROUP BY col;</code></li>
      <li><b>ORDER BY</b>: <code>SELECT * FROM table ORDER BY col DESC;</code></li>
      <li className="mt-2 text-blue-700">Tip: Only SELECT queries are allowed in this game!</li>
    </ul>
  </div>
);

export default SQLReferencePanel; 