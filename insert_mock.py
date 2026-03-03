import sqlite3
import json

c = sqlite3.connect('backend/discovery.db')

dummy_result = {
    "project_name": "Test Project for Miro",
    "jtbd": {
        "verdict": "GO",
        "evidence_level": "3_Paying",
        "confidence": 85,
        "functional_job": "Export data simply",
        "emotional_job": "Feel professional",
        "social_job": "Impress team",
        "competing_solutions": [],
        "reasoning": "Strong evidence."
    },
    "scorecard": {
        "hours_invested": 2,
        "confidence_before": 10,
        "confidence_after": 85,
        "roi_estimate": "High"
    },
    "duration_hours": 2,
    "forces_report": "### Push\n- Need testing\n### Pull\n- Cool stuff",
    "assumption_map": "### FATAL\n| Assumption | Value |\n|--|--|\n| Exists | True |"
}

c.execute('''
INSERT INTO sessions (id, project_name, mode, status, progress, created_at, result_json)
VALUES ('mock-miro-test-id', 'Test Project for Miro', 'full', 'completed', 8, '2026-03-03T00:00:00Z', ?)
''', (json.dumps(dummy_result),))
c.commit()
print("Mock session inserted!")
