import os
import re

search_dirs = [r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV"]
patterns = [r"localhost", r"127\.0\.0\.1", r"ws://", r"wss://", r"http://"]
exclude_dirs = ["node_modules", ".next", "build", "dist", ".git", "venv", "__pycache__"]

regex = re.compile('|'.join(patterns))

for d in search_dirs:
    for root, dirs, files in os.walk(d):
        dirs[:] = [dir for dir in dirs if dir not in exclude_dirs]
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.py', '.env', '.json')):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        for i, line in enumerate(f):
                            if regex.search(line):
                                print(f"File: {filepath}\nLine: {i+1}\nCode: {line.strip()}\n---")
                except Exception as e:
                    pass
