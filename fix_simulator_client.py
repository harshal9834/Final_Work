path = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\backend-service\app\services\simulator_client.py"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('"/api/faults/inject"', '"/api/faults"')
content = content.replace('"/api/faults/clear"', '"/api/faults"')

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
