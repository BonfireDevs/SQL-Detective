from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import os
import time
import re
from typing import List, Optional

app = FastAPI(title="SQL Detective API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class SQLQuery(BaseModel):
    query: str
    case_id: str

class CaseInfo(BaseModel):
    case_id: str
    title: str
    description: str
    starting_clue: str
    difficulty: str
    required_concept: str
    schema_info: List[dict]

class Clue(BaseModel):
    clue_index: int
    text: str
    expected_query: Optional[str] = None  # For validation
    expected_result: Optional[list] = None  # For result-based validation

# Security configuration
MAX_QUERY_LENGTH = 1000
MAX_EXECUTION_TIME = 2  # seconds
DISALLOWED_KEYWORDS = [
    "insert", "update", "delete", "drop", "alter", 
    "create", "attach", "detach", "pragma", "transaction"
]

def get_db_path(case_id: str) -> str:
    cases_dir = os.path.join(os.path.dirname(__file__), "cases")
    db_path = os.path.join(cases_dir, f"{case_id}.db")
    if not os.path.exists(db_path):
        raise HTTPException(status_code=404, detail="Case not found")
    return db_path

def validate_query(query: str) -> bool:
    query_lower = query.lower().strip()
    
    if len(query) > MAX_QUERY_LENGTH:
        return False
    
    if not query_lower.startswith("select"):
        return False
    
    for keyword in DISALLOWED_KEYWORDS:
        if keyword in query_lower:
            return False
            
    if re.search(r";\s*\w", query_lower):
        return False
        
    return True

def get_table_schema(conn: sqlite3.Connection) -> List[dict]:
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    
    schema = []
    for table in tables:
        table_name = table[0]
        if table_name == "sqlite_sequence":
            continue
            
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        
        schema.append({
            "table_name": table_name,
            "columns": [{"name": col[1], "type": col[2]} for col in columns]
        })
    
    return schema

@app.post("/execute")
async def execute_query(sql_query: SQLQuery):
    if not validate_query(sql_query.query):
        raise HTTPException(status_code=400, detail="Invalid or unsafe SQL query")
    
    db_path = get_db_path(sql_query.case_id)
    conn = None
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        start_time = time.time()
        cursor.execute(sql_query.query)
        results = cursor.fetchall()
        columns = [description[0] for description in cursor.description] if cursor.description else []
        execution_time = time.time() - start_time
        
        if execution_time > MAX_EXECUTION_TIME:
            raise HTTPException(status_code=400, detail="Query took too long to execute")
            
        return {
            "success": True,
            "results": results,
            "columns": columns,
            "execution_time": execution_time
        }
    except sqlite3.Error as e:
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        if conn:
            conn.close()

@app.get("/cases")
async def get_available_cases():
    cases_dir = os.path.join(os.path.dirname(__file__), "cases")
    cases = []
    
    for case_file in os.listdir(cases_dir):
        if case_file.endswith(".db"):
            case_id = case_file[:-3]
            db_path = os.path.join(cases_dir, case_file)
            
            conn = sqlite3.connect(db_path)
            try:
                cursor = conn.cursor()
                cursor.execute("SELECT title, description, starting_clue, difficulty, required_concept FROM case_metadata")
                row = cursor.fetchone()
                
                if row:
                    schema = get_table_schema(conn)
                    cases.append({
                        "case_id": case_id,
                        "title": row[0],
                        "description": row[1],
                        "starting_clue": row[2],
                        "difficulty": row[3],
                        "required_concept": row[4],
                        "schema_info": schema
                    })
            finally:
                conn.close()
    
    return {"cases": cases}

@app.get("/case/{case_id}")
async def get_case_info(case_id: str):
    db_path = get_db_path(case_id)
    conn = sqlite3.connect(db_path)
    
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT title, description, starting_clue, difficulty, required_concept FROM case_metadata")
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Case metadata not found")
        
        schema = get_table_schema(conn)
        
        return {
            "case": {
                "case_id": case_id,
                "title": row[0],
                "description": row[1],
                "starting_clue": row[2],
                "difficulty": row[3],
                "required_concept": row[4],
                "schema_info": schema
            }
        }
    finally:
        conn.close()

@app.get("/case/{case_id}/clues")
async def get_case_clues(case_id: str):
    db_path = get_db_path(case_id)
    conn = sqlite3.connect(db_path)
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT clue_index, text FROM clues ORDER BY clue_index ASC")
        clues = [
            {"clue_index": row[0], "text": row[1]} for row in cursor.fetchall()
        ]
        return {"clues": clues}
    finally:
        conn.close()

@app.get("/case/{case_id}/clue/{clue_index}")
async def get_case_clue(case_id: str, clue_index: int):
    db_path = get_db_path(case_id)
    conn = sqlite3.connect(db_path)
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT clue_index, text FROM clues WHERE clue_index=?", (clue_index,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Clue not found")
        return {"clue": {"clue_index": row[0], "text": row[1]}}
    finally:
        conn.close()

@app.post("/case/{case_id}/clue/{clue_index}/validate")
async def validate_clue_query(case_id: str, clue_index: int, sql_query: SQLQuery):
    if not validate_query(sql_query.query):
        raise HTTPException(status_code=400, detail="Invalid or unsafe SQL query")
    db_path = get_db_path(case_id)
    conn = sqlite3.connect(db_path)
    try:
        cursor = conn.cursor()
        # Get expected result for this clue
        cursor.execute("SELECT expected_query, expected_result FROM clues WHERE clue_index=?", (clue_index,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Clue not found")
        expected_query, expected_result = row
        # Execute user query
        cursor.execute(sql_query.query)
        user_result = cursor.fetchall()
        # If expected_result is set, compare results
        if expected_result:
            import json
            expected_result = json.loads(expected_result)
            if user_result == expected_result:
                return {"success": True, "message": "Correct! Clue unlocked."}
            else:
                return {"success": False, "message": "Incorrect result. Try again."}
        # If expected_query is set, compare queries (case-insensitive, stripped)
        if expected_query:
            if sql_query.query.strip().lower() == expected_query.strip().lower():
                return {"success": True, "message": "Correct! Clue unlocked."}
            else:
                return {"success": False, "message": "Incorrect query. Try again."}
        return {"success": False, "message": "No validation criteria set for this clue."}
    except sqlite3.Error as e:
        return {"success": False, "error": str(e)}
    finally:
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)