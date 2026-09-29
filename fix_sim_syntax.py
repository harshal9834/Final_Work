# -*- coding: utf-8 -*-
path = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\backend-service\app\services\simulator_client.py"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(r'\"', '"')

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Syntax fixed")
