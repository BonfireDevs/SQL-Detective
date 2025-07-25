import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BadgesPanel from '../components/BadgesPanel';
import LeaderboardPanel from '../components/LeaderboardPanel';

const HomePage = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Load badge progress from localStorage
  const [badgeProgress, setBadgeProgress] = useState({ join: false, crime: false, select: false });
  useEffect(() => {
    const progress = JSON.parse(localStorage.getItem('badges') || '{"join":false,"crime":false,"select":false}');
    setBadgeProgress(progress);
  }, []);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await fetch('http://localhost:8000/cases');
        const data = await response.json();
        setCases(data.cases || []);
      } catch (err) {
        setError('Failed to load cases.');
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading cases...</div>;
  }
  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div>
      <BadgesPanel progress={badgeProgress} />
      <LeaderboardPanel />
      <h1 className="text-3xl font-bold text-gray-800 mb-6">SQL Detective Cases</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.map((c) => (
          <div
            key={c.case_id}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg border border-gray-100 hover:border-blue-400 transition"
            onClick={() => navigate(`/case/${c.case_id}`)}
          >
            <h2 className="text-xl font-semibold text-blue-700 mb-2">{c.title}</h2>
            <p className="text-gray-600 mb-2">{c.description}</p>
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-4">Difficulty: <span className="font-medium">{c.difficulty}</span></span>
              <span>Concept: <span className="font-medium">{c.required_concept}</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage; 