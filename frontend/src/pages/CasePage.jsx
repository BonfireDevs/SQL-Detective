import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import QueryEditor from '../components/QueryEditor';
import ResultsTable from '../components/ResultsTable';
import ClueLog from '../components/ClueLog';
import StatusPanel from '../components/StatusPanel';
import LeaderboardPanel from '../components/LeaderboardPanel';

const CasePage = () => {
  const { caseId } = useParams();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [columns, setColumns] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [caseInfo, setCaseInfo] = useState(null);
  const [clues, setClues] = useState([]); // All clues for the case
  const [currentClueIndex, setCurrentClueIndex] = useState(0);
  const [clueLog, setClueLog] = useState([]); // Unlocked clues
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());

  // Load case info and clues
  useEffect(() => {
    const loadCaseInfo = async () => {
      try {
        const response = await fetch(`http://localhost:8000/case/${caseId}`);
        const data = await response.json();
        setCaseInfo(data.case);
      } catch (err) {
        console.error('Failed to load case info:', err);
      }
    };
    const loadClues = async () => {
      try {
        const response = await fetch(`http://localhost:8000/case/${caseId}/clues`);
        const data = await response.json();
        setClues(data.clues || []);
        // Load progress from localStorage
        const progress = JSON.parse(localStorage.getItem(`progress_${caseId}`) || '0');
        setCurrentClueIndex(progress);
        setClueLog(data.clues.slice(0, progress + 1).map(c => c.text));
      } catch (err) {
        console.error('Failed to load clues:', err);
      }
    };
    loadCaseInfo();
    loadClues();
    setStartTime(Date.now()); // Reset timer when case changes
  }, [caseId]);

  // Set default query for the first table
  useEffect(() => {
    if (caseInfo && caseInfo.schema_info.length > 0) {
      setQuery(`SELECT * FROM ${caseInfo.schema_info[0].table_name} LIMIT 5`);
    }
  }, [caseInfo]);

  const awardBadges = (query, caseSolved, requiredConcept) => {
    let badges = JSON.parse(localStorage.getItem('badges') || '{"join":false,"crime":false,"select":false}');
    let updated = false;
    if (query && query.toLowerCase().includes('join')) {
      if (!badges.join) { badges.join = true; updated = true; }
    }
    if (query && query.toLowerCase().includes('select')) {
      if (!badges.select) { badges.select = true; updated = true; }
    }
    if (caseSolved) {
      if (!badges.crime) { badges.crime = true; updated = true; }
    }
    // Optionally, award badge based on requiredConcept
    if (requiredConcept && requiredConcept.toLowerCase().includes('join')) {
      if (!badges.join) { badges.join = true; updated = true; }
    }
    if (updated) {
      localStorage.setItem('badges', JSON.stringify(badges));
    }
  };

  const executeQuery = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setFeedback(null);
    try {
      // Validate query for current clue
      const response = await fetch(`http://localhost:8000/case/${caseId}/clue/${currentClueIndex}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, case_id: caseId })
      });
      const data = await response.json();
      if (!data.success) {
        setFeedback(data.message || 'Incorrect. Try again.');
      } else {
        // Unlock next clue
        const nextClueIndex = currentClueIndex + 1;
        setClueLog([...clueLog, clues[nextClueIndex]?.text]);
        setCurrentClueIndex(nextClueIndex);
        localStorage.setItem(`progress_${caseId}`, JSON.stringify(nextClueIndex));
        setFeedback('Correct! Clue unlocked.');
        // If last clue, mark as solved
        if (nextClueIndex >= clues.length) {
          setSolved(true);
          awardBadges(query, true, caseInfo?.required_concept);
        } else {
          awardBadges(query, false, caseInfo?.required_concept);
        }
      }
      // Also run the query for result display
      const execRes = await fetch('http://localhost:8000/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, case_id: caseId })
      });
      const execData = await execRes.json();
      if (execData.success) {
        setResults(execData.results);
        setColumns(execData.columns);
      } else {
        setError(execData.error || 'Failed to execute query');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (solved) {
      let user = localStorage.getItem('username');
      if (!user) {
        user = prompt('Enter your detective name for the leaderboard:') || 'Anonymous';
        localStorage.setItem('username', user);
      }
      const time = Math.round((Date.now() - startTime) / 1000);
      const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
      leaderboard.push({ user, time });
      leaderboard.sort((a, b) => a.time - b.time);
      localStorage.setItem('leaderboard', JSON.stringify(leaderboard.slice(0, 10)));
    }
  }, [solved, startTime]);

  if (!caseInfo || clues.length === 0) {
    return <div className="text-center py-8">Loading case...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Case #{caseId}: {caseInfo.title}</h1>
        <p className="text-gray-600 mb-4">{caseInfo.description}</p>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="text-yellow-700">Required SQL Concept: <span className="font-semibold">{caseInfo.required_concept}</span></p>
        </div>
      </div>
      <div className="mb-6 p-4 bg-blue-50 rounded-md border-l-4 border-blue-400">
        <h2 className="font-semibold text-blue-800 mb-2">Current Clue</h2>
        <p className="text-blue-900">{clues[currentClueIndex]?.text}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <QueryEditor 
          query={query}
          setQuery={setQuery}
          executeQuery={executeQuery}
          loading={loading}
          error={error}
        />
        <ResultsTable 
          results={results}
          columns={columns}
          loading={loading}
        />
      </div>
      {feedback && (
        <div className={`mt-4 p-3 rounded-md ${feedback.startsWith('Correct') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'}`}>{feedback}</div>
      )}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ClueLog clues={clueLog.filter(Boolean)} caseInfo={caseInfo} />
        </div>
        <div>
          <StatusPanel 
            solved={solved}
            cluesFound={clueLog.length}
            requiredConcept={caseInfo.required_concept}
          />
        </div>
      </div>
      <LeaderboardPanel />
    </div>
  );
};

export default CasePage;