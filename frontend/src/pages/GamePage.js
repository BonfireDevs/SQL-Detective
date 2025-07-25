import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useParams } from 'react-router-dom';

const GamePage = () => {
  const { caseId } = useParams();
  const [query, setQuery] = useState('SELECT * FROM suspects');
  const [results, setResults] = useState([]);
  const [columns, setColumns] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [caseInfo, setCaseInfo] = useState(null);
  const [clues, setClues] = useState([]);
  const [solved, setSolved] = useState(false);

  // Load case info on mount
  useEffect(() => {
    const loadCaseInfo = async () => {
      try {
        const response = await fetch(`http://localhost:8000/case/${caseId}`);
        const data = await response.json();
        setCaseInfo(data.case);
        
        // Add the starting clue
        if (data.case.starting_clue) {
          setClues([data.case.starting_clue]);
        }
      } catch (err) {
        console.error('Failed to load case info:', err);
      }
    };

    loadCaseInfo();
  }, [caseId]);

  const executeQuery = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          case_id: caseId
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute query');
      }
      
      setResults(data.results || []);
      setColumns(data.columns || []);
      
      // Check if this query solved the case (simplified for example)
      if (data.results && data.results.length > 0) {
        const newClue = `Found ${data.results.length} records matching your query`;
        if (!clues.includes(newClue)) {
          setClues([...clues, newClue]);
        }
        
        // Simple check for case solution (would be more complex in real app)
        if (query.toLowerCase().includes('where') && query.toLowerCase().includes('join')) {
          setSolved(true);
        }
      }
    } catch (err) {
      setError(err.message);
      console.error('Query execution error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {caseInfo && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Case #{caseId}: {caseInfo.title}</h1>
          <p className="text-gray-600 mb-4">{caseInfo.description}</p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <p className="text-yellow-700">Required SQL Concept: <span className="font-semibold">{caseInfo.required_concept}</span></p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Query Editor */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-800 text-white p-3">
            <h2 className="font-mono text-lg">SQL Query Editor</h2>
          </div>
          <div className="h-64">
            <MonacoEditor
              language="sql"
              theme="vs-dark"
              value={query}
              onChange={setQuery}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                wordWrap: 'on',
              }}
            />
          </div>
          <div className="p-4 bg-gray-50">
            <button
              onClick={executeQuery}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white font-medium ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? 'Executing...' : 'Execute Query'}
            </button>
            {error && (
              <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-md">
                <p className="font-medium">Error:</p>
                <p className="font-mono text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Results Panel */}
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
      </div>
      
      {/* Clues and Case Info */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-800 text-white p-3">
            <h2 className="font-mono text-lg">Case Notebook</h2>
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
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-800 text-white p-3">
            <h2 className="font-mono text-lg">Case Status</h2>
          </div>
          <div className="p-4">
            {solved ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
                <h3 className="text-green-800 font-bold text-lg mb-2">Case Solved!</h3>
                <p className="text-green-700">Congratulations detective! You cracked the case with SQL.</p>
                <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  Next Case
                </button>
              </div>
            ) : (
              <div>
                <h3 className="font-medium mb-2">Progress</h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, clues.length * 20)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{clues.length} of 5 clues found</p>
                
                <div className="mt-4">
                  <h3 className="font-medium mb-2">SQL Tips</h3>
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-blue-800">{caseInfo?.required_concept} is needed to solve this case. Try using it in your query.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;