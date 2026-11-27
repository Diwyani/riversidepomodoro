"""Edit books.csv, then run python3 rename-books.py and python3 export.py."""
import csv,json,re
from pathlib import Path
p=Path(__file__).resolve().parent
rows=list(csv.DictReader((p/'books.csv').open(newline='')))
if not rows or any(not r['title'].strip() for r in rows):raise SystemExit('Every book needs a title.')
source=(p/'world.mjs').read_text()
for key,column in [('bookTitles','title'),('bookAuthors','author')]:
 value=json.dumps([r[column].strip() for r in rows],ensure_ascii=False)
 source=re.sub(r'const '+key+r'=\[.*?\];',lambda _: 'const '+key+'='+value+';',source,count=1)
(p/'world.mjs').write_text(source)
print('Updated',len(rows),'books. Run python3 export.py, then refresh.')
