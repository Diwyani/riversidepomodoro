"""Edit books.csv, then run python3 rename-books.py and python3 export.py."""
import csv,json,re
from pathlib import Path
p=Path(__file__).resolve().parent
rows=list(csv.DictReader((p/'books.csv').open(newline='')))
if not rows or any(not r['title'].strip() for r in rows):raise SystemExit('Every book needs a title.')
source=(p/'world.mjs').read_text()
for key,column in [('bookTitles','title'),('bookAuthors','author'),('bookCoverColors','cover_color'),('bookCoverAccents','cover_accent')]:
 value=json.dumps([r.get(column,'').strip() for r in rows],ensure_ascii=False)
 replacement='const '+key+'='+value+';'
 if re.search(r'const '+key+r'=\[.*?\];',source):source=re.sub(r'const '+key+r'=\[.*?\];',lambda _:replacement,source,count=1)
 else:source=source.replace(' const bookTitles=', ' '+replacement+'\n const bookTitles=',1)
(p/'world.mjs').write_text(source)
print('Updated',len(rows),'books. Run python3 export.py, then refresh.')
