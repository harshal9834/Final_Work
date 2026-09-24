Write-Host "Installing simulator backend deps..."
cd c:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\simulator\backend
python -m venv .venv
.\.venv\Scripts\Activate
pip install -r requirements.txt

Write-Host "Installing backend-service deps..."
cd c:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\backend-service
python -m venv .venv
.\.venv\Scripts\Activate
pip install -r requirements.txt

Write-Host "Installing simulator frontend deps..."
cd c:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\simulator
npm install

Write-Host "Installing male_uav_frontend- deps..."
cd c:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\male_uav_frontend-
npm install
