import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CasePage from './pages/CasePage';
import TutorialPage from './pages/TutorialPage';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/case/:caseId" element={<CasePage />} />
            <Route path="/tutorial/:concept" element={<TutorialPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;