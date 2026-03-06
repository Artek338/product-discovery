"""
SQLite database layer — przechowuje sesje Discovery i ich wyniki.
"""
import json
import aiosqlite
from pathlib import Path

from backend.config import get_db_path


def _db_path() -> Path:
    return get_db_path()


async def init_db():
    async with aiosqlite.connect(_db_path()) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                project_name TEXT,
                mode TEXT,
                status TEXT DEFAULT 'queued',
                progress INTEGER DEFAULT 0,
                current_node TEXT,
                created_at TEXT,
                result_json TEXT,
                logs_json TEXT DEFAULT '[]'
            )
        """)
        await db.commit()


async def create_session(session_id: str, project_name: str, mode: str, created_at: str):
    async with aiosqlite.connect(_db_path()) as db:
        await db.execute(
            "INSERT INTO sessions (id, project_name, mode, status, created_at, logs_json) VALUES (?,?,?,?,?,?)",
            (session_id, project_name, mode, "queued", created_at, "[]"),
        )
        await db.commit()


async def update_session_status(
    session_id: str,
    status: str,
    progress: int = None,
    current_node: str = None,
    log_entry: str = None,
):
    async with aiosqlite.connect(_db_path()) as db:
        # Fetch existing logs
        cursor = await db.execute("SELECT logs_json FROM sessions WHERE id=?", (session_id,))
        row = await cursor.fetchone()
        logs = json.loads(row[0]) if row and row[0] else []
        if log_entry:
            logs.append(log_entry)

        await db.execute(
            "UPDATE sessions SET status=?, logs_json=?, "
            "progress=COALESCE(?, progress), current_node=COALESCE(?, current_node) WHERE id=?",
            (status, json.dumps(logs), progress, current_node, session_id),
        )
        await db.commit()


async def save_result(session_id: str, result_json: str):
    async with aiosqlite.connect(_db_path()) as db:
        await db.execute(
            "UPDATE sessions SET status='completed', progress=8, result_json=? WHERE id=?",
            (result_json, session_id),
        )
        await db.commit()


async def get_session(session_id: str) -> dict | None:
    async with aiosqlite.connect(_db_path()) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM sessions WHERE id=?", (session_id,))
        row = await cursor.fetchone()
        return dict(row) if row else None


async def count_sessions() -> int:
    async with aiosqlite.connect(_db_path()) as db:
        cursor = await db.execute("SELECT COUNT(*) FROM sessions")
        row = await cursor.fetchone()
        return row[0] if row else 0


async def list_sessions(limit: int = 50, offset: int = 0) -> list[dict]:
    async with aiosqlite.connect(_db_path()) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, project_name, mode, status, progress, created_at, result_json "
            "FROM sessions ORDER BY created_at DESC LIMIT ? OFFSET ?",
            (limit, offset),
        )
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]
