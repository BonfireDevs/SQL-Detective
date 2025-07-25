import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import QueryEditor from '../components/QueryEditor';
import ResultsTable from '../components/ResultsTable';

const TUTORIALS = {
  select: {
    title: 'SELECT Statement',
    description: 'The SELECT statement is used to fetch data from a database. You can specify columns and use WHERE to filter rows.',
    example: 'SELECT name, age FROM users WHERE age > 18;'
  },
  where: {
    title: 'WHERE Clause',
    description: 'The WHERE clause is used to filter records that fulfill a specified condition.',
    example: 'SELECT * FROM suspects WHERE alibi = "none";'
  },
  join: {
    title: 'JOINs',
    description: 'JOINs are used to combine rows from two or more tables, based on a related column.',
    example: 'SELECT s.name, c.crime FROM suspects s JOIN crimes c ON s.id = c.suspect_id;'
  },
  // Add more concepts as needed
};

const TutorialPage = () => {
  const { concept } = useParams();
  const tutorial = TUTORIALS[concept] || {
    title: concept,
    description: 'No tutorial available for this concept.',
    example: ''
  };
  const [query, setQuery] = useState(tutorial.example);
  const [results, setResults] = useState([]);
  const [columns, setColumns] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const executeQuery = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // Use a demo case for practice queries (e.g., case1)
      const response = await fetch('http://localhost:8000/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, case_id: 'case1' })
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.error || 'Failed to execute query');
      } else {
        setResults(data.results);
        setColumns(data.columns);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Tutorial: {tutorial.title}</h1>
      <p className="mb-4 text-gray-700">{tutorial.description}</p>
      <div className="mb-6 p-4 bg-blue-50 rounded-md border-l-4 border-blue-400">
        <h2 className="font-semibold text-blue-800 mb-2">Practice Query</h2>
        <QueryEditor 
          query={query}
          setQuery={setQuery}
          executeQuery={executeQuery}
          loading={loading}
          error={error}
        />
        <div className="mt-4">
          <ResultsTable results={results} columns={columns} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default TutorialPage; 