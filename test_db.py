import sqlite3
c = sqlite3.connect('backend/discovery.db')
res = c.execute('SELECT id, status FROM sessions').fetchall()
print(res)
