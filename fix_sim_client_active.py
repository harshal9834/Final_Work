path = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\backend-service\app\services\simulator_client.py"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

import re

# Find inject_fault
content = re.sub(
    r"async def inject_fault\(self, data: Dict\[str, Any\]\) -> Dict\[str, Any\]:\n\s+return await self\._post\(\"/api/faults\", data\)",
    r"async def inject_fault(self, data: Dict[str, Any]) -> Dict[str, Any]:\n        data['active'] = True\n        return await self._post(\"/api/faults\", data)",
    content
)

# Find clear_fault
content = re.sub(
    r"async def clear_fault\(self, data: Dict\[str, Any\]\) -> Dict\[str, Any\]:\n\s+return await self\._post\(\"/api/faults\", data\)",
    r"async def clear_fault(self, data: Dict[str, Any]) -> Dict[str, Any]:\n        data['active'] = False\n        return await self._post(\"/api/faults\", data)",
    content
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
