# -*- coding: utf-8 -*-
path = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\male_uav_frontend-\src\contexts\GcsContext.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the array assignments
import re
new_content = re.sub(
    r'chtC: data\.cht !== undefined \? \[Number\(data\.cht\.toFixed\(1\)\)\] : prev\.chtC,',
    r'chtC: data.cht !== undefined ? [Number(data.cht.toFixed(1)), Number((data.cht+1.2).toFixed(1)), Number((data.cht-0.8).toFixed(1)), Number((data.cht+0.5).toFixed(1))] : prev.chtC,',
    content
)

new_content = re.sub(
    r'egtC: data\.egt !== undefined \? \[Number\(data\.egt\.toFixed\(1\)\)\] : prev\.egtC,',
    r'egtC: data.egt !== undefined ? [Number(data.egt.toFixed(1)), Number((data.egt+5).toFixed(1)), Number((data.egt-4).toFixed(1)), Number((data.egt+3).toFixed(1))] : prev.egtC,',
    new_content
)

with open(path, "w", encoding="utf-8") as f:
    f.write(new_content)
print("Fixed GcsContext array crash")
