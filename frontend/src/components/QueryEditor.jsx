import React from 'react';
import MonacoEditor from '@monaco-editor/react';

const QueryEditor = ({ query, setQuery, executeQuery, loading, error }) => {
  return (
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
  );
};

export default QueryEditor;