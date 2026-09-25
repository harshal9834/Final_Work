import os
import re

search_dirs = [r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV"]
patterns = [r"localhost", r"127\.0\.0\.1", r"ws://", r"wss://", r"http://"]
exclude_dirs = ["node_modules", ".next", "build", "dist", ".git", ".venv", "venv", "__pycache__", "prisma", "public"]

regex = re.compile('|'.join(patterns))

for d in search_dirs:
    for root, dirs, files in os.walk(d):
        dirs[:] = [dir for dir in dirs if dir not in exclude_dirs]
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.py', '.env')):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        for i, line in enumerate(f):
                            if regex.search(line):
                                print(f"{filepath}:{i+1}:{line.strip()}")
                except Exception as e:
                    pass
