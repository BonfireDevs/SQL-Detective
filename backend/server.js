const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const CASES_DIR = path.join(__dirname, 'cases');
const MAX_QUERY_LENGTH = 1000;
const DISALLOWED_KEYWORDS = [
  'insert', 'update', 'delete', 'drop', 'alter',
  'create', 'attach', 'detach', 'pragma', 'transaction'
];

function getDbPath(caseId) {
  const dbPath = path.join(CASES_DIR, `${caseId}.db`);
  if (!fs.existsSync(dbPath)) {
    return null;
  }
  return dbPath;
}

function validateQuery(query) {
  const q = query.trim().toLowerCase();
  if (query.length > MAX_QUERY_LENGTH) return false;
  if (!q.startsWith('select')) return false;
  for (const keyword of DISALLOWED_KEYWORDS) {
    if (q.includes(keyword)) return false;
  }
  if (/;\s*\w/.test(q)) return false;
  return true;
}

function getTableSchema(db) {
  return new Promise((resolve, reject) => {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
      if (err) return reject(err);
      const schema = [];
      let count = 0;
      tables.forEach((table) => {
        if (table.name === 'sqlite_sequence') return;
        db.all(`PRAGMA table_info(${table.name})`, [], (err, columns) => {
          if (err) return reject(err);
          schema.push({
            table_name: table.name,
            columns: columns.map(col => ({ name: col.name, type: col.type }))
          });
          count++;
          if (count === tables.length) resolve(schema);
        });
      });
      if (tables.length === 0) resolve([]);
    });
  });
}

// List all cases
app.get('/cases', (req, res) => {
  fs.readdir(CASES_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to read cases directory' });
    const cases = [];
    let count = 0;
    files.filter(f => f.endsWith('.db')).forEach(file => {
      const caseId = file.replace('.db', '');
      const dbPath = path.join(CASES_DIR, file);
      const db = new sqlite3.Database(dbPath);
      db.get('SELECT title, description, starting_clue, difficulty, required_concept FROM case_metadata', [], async (err, row) => {
        if (row) {
          const schema = await getTableSchema(db).catch(() => []);
          cases.push({
            case_id: caseId,
            title: row.title,
            description: row.description,
            starting_clue: row.starting_clue,
            difficulty: row.difficulty,
            required_concept: row.required_concept,
            schema_info: schema
          });
        }
        db.close();
        count++;
        if (count === files.filter(f => f.endsWith('.db')).length) {
          res.json({ cases });
        }
      });
    });
    if (files.filter(f => f.endsWith('.db')).length === 0) res.json({ cases: [] });
  });
});

// Get case info
app.get('/case/:caseId', (req, res) => {
  const dbPath = getDbPath(req.params.caseId);
  if (!dbPath) return res.status(404).json({ error: 'Case not found' });
  const db = new sqlite3.Database(dbPath);
  db.get('SELECT title, description, starting_clue, difficulty, required_concept FROM case_metadata', [], async (err, row) => {
    if (!row) return res.status(404).json({ error: 'Case metadata not found' });
    const schema = await getTableSchema(db).catch(() => []);
    db.close();
    res.json({
      case: {
        case_id: req.params.caseId,
        title: row.title,
        description: row.description,
        starting_clue: row.starting_clue,
        difficulty: row.difficulty,
        required_concept: row.required_concept,
        schema_info: schema
      }
    });
  });
});

// Execute user query
app.post('/execute', (req, res) => {
  const { query, case_id } = req.body;
  if (!validateQuery(query)) return res.status(400).json({ success: false, error: 'Invalid or unsafe SQL query' });
  const dbPath = getDbPath(case_id);
  if (!dbPath) return res.status(404).json({ success: false, error: 'Case not found' });
  const db = new sqlite3.Database(dbPath);
  db.all(query, [], (err, rows) => {
    if (err) return res.json({ success: false, error: err.message });
    db.all(`PRAGMA table_info(${rows && rows.length > 0 ? Object.keys(rows[0])[0] : ''})`, [], (err2, columns) => {
      db.close();
      res.json({
        success: true,
        results: rows,
        columns: rows && rows.length > 0 ? Object.keys(rows[0]) : [],
        execution_time: 0 // Not measured here
      });
    });
  });
});

// Get all clues for a case (with hints)
app.get('/case/:caseId/clues', (req, res) => {
  const dbPath = getDbPath(req.params.caseId);
  if (!dbPath) return res.status(404).json({ error: 'Case not found' });
  const db = new sqlite3.Database(dbPath);
  db.all('SELECT clue_index, text, hint FROM clues ORDER BY clue_index ASC', [], (err, rows) => {
    db.close();
    if (err) return res.status(500).json({ error: 'Failed to fetch clues' });
    res.json({ clues: rows });
  });
});

// Get a specific clue (with hint)
app.get('/case/:caseId/clue/:clueIndex', (req, res) => {
  const dbPath = getDbPath(req.params.caseId);
  if (!dbPath) return res.status(404).json({ error: 'Case not found' });
  const db = new sqlite3.Database(dbPath);
  db.get('SELECT clue_index, text, hint FROM clues WHERE clue_index = ?', [req.params.clueIndex], (err, row) => {
    db.close();
    if (!row) return res.status(404).json({ error: 'Clue not found' });
    res.json({ clue: row });
  });
});

// Get just the hint for a clue
app.get('/case/:caseId/clue/:clueIndex/hint', (req, res) => {
  const dbPath = getDbPath(req.params.caseId);
  if (!dbPath) return res.status(404).json({ error: 'Case not found' });
  const db = new sqlite3.Database(dbPath);
  db.get('SELECT hint FROM clues WHERE clue_index = ?', [req.params.clueIndex], (err, row) => {
    db.close();
    if (!row) return res.status(404).json({ error: 'Hint not found' });
    res.json({ hint: row.hint });
  });
});

// Validate a clue query
app.post('/case/:caseId/clue/:clueIndex/validate', (req, res) => {
  const { query, case_id } = req.body;
  if (!validateQuery(query)) return res.status(400).json({ success: false, message: 'Invalid or unsafe SQL query' });
  const dbPath = getDbPath(req.params.caseId);
  if (!dbPath) return res.status(404).json({ success: false, message: 'Case not found' });
  const db = new sqlite3.Database(dbPath);
  db.get('SELECT expected_query, expected_result FROM clues WHERE clue_index = ?', [req.params.clueIndex], (err, row) => {
    if (!row) {
      db.close();
      return res.status(404).json({ success: false, message: 'Clue not found' });
    }
    db.all(query, [], (err2, userResult) => {
      if (err2) {
        db.close();
        return res.json({ success: false, error: err2.message });
      }
      // If expected_result is set, compare results
      if (row.expected_result) {
        let expectedResult;
        try { expectedResult = JSON.parse(row.expected_result); } catch { expectedResult = []; }
        if (JSON.stringify(userResult) === JSON.stringify(expectedResult)) {
          db.close();
          return res.json({ success: true, message: 'Correct! Clue unlocked.' });
        } else {
          db.close();
          return res.json({ success: false, message: 'Incorrect result. Try again.' });
        }
      }
      // If expected_query is set, compare queries (case-insensitive, stripped)
      if (row.expected_query) {
        if (query.trim().toLowerCase() === row.expected_query.trim().toLowerCase()) {
          db.close();
          return res.json({ success: true, message: 'Correct! Clue unlocked.' });
        } else {
          db.close();
          return res.json({ success: false, message: 'Incorrect query. Try again.' });
        }
      }
      db.close();
      return res.json({ success: false, message: 'No validation criteria set for this clue.' });
    });
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`SQL Detective Express server running on port ${PORT}`);
}); 