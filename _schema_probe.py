import re
raw = open(r'supabase\migrations\schema.sql', 'rb').read()
text = raw.decode('utf-16')
m = re.search(r'CREATE TABLE IF NOT EXISTS "public"\."booking".*?\);', text, re.S)
print(m.group(0) if m else 'not found')
