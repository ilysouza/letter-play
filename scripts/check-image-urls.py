from pathlib import Path
import re
import subprocess

text = Path('/home/ubuntu/letter-play/client/src/dailyWords.ts').read_text()
urls = dict(re.findall(r'^  ([A-Z]+): "(https://images\.unsplash\.com/[^" ]+)', text, re.M))
for key, url in urls.items():
    result = subprocess.run(['curl','-LIs','--max-time','8',url], capture_output=True, text=True)
    status = next((line.strip() for line in result.stdout.splitlines() if line.startswith('HTTP/')), 'NO_RESPONSE')
    print(f'{key}: {status}')
