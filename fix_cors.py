# -*- coding: utf-8 -*-
import re

def update_cors(path):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Replace allow_origins with a broader list to prevent local 403s
    new_origins = 'allow_origins=["*", "http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],\n    allow_origin_regex="https://.*"'
    
    content = re.sub(
        r'allow_origins=\[.*?\]',
        new_origins,
        content,
        flags=re.DOTALL
    )

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

update_cors(r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\backend-service\app\main.py")
update_cors(r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\simulator\main.py")
print("CORS updated")
