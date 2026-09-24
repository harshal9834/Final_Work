const http = require('http');

const API_BASE = 'http://localhost:4001/api/missions';

async function postData(endpoint, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(API_BASE + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTestMission() {
  console.log("🚀 Starting simulated test mission via API...");
  
  // 1. Start Mission
  const startRes = await postData('/start', {
    missionName: "OPERATION SANKALP (TEST)",
    missionId: "MIS-TEST-001",
    uavId: "TAPAS-BH-201",
    platform: "MALE_UAV",
    initialFuelKg: 184.5,
    initialHealthScore: 92.4,
    initialRulHours: 145.2
  });
  
  const missionId = startRes.missionSessionId;
  console.log(`✅ Mission Started! ID: ${missionId}`);
  
  let timeMs = Date.now() - (600 * 1000); // Start 10 mins ago

  // 2. Send 50 telemetry points (simulating 10 minutes of flight)
  console.log("📡 Injecting telemetry points...");
  const telemetryBatch = [];
  for(let i=0; i<50; i++) {
    timeMs += 12000; // 12 seconds per point
    telemetryBatch.push({
      timestamp: new Date(timeMs).toISOString(),
      latitude: 14.23 + (i * 0.001),
      longitude: 76.41 + (i * 0.001),
      altitude: 15000 + (i * 100),
      groundSpeed: 105 + Math.random()*5,
      heading: 45,
      rpm: 5200 + Math.random()*100,
      chtAvg: 110 + (i * 0.5),
      egtAvg: 750 + Math.random()*20,
      oilTemp: 95 + (i * 0.2),
      oilPressure: 4.5,
      turboBoost: 1.2,
      manifoldPressure: 35.8,
      fuelRemaining: 184.5 - (i * 0.5),
      engineHealth: 92.4 - (i * 0.01),
      rulHours: 145.2 - (i * 0.01),
      missionPhase: i < 15 ? "CLIMB" : "LOITER"
    });
  }
  
  await postData(`/${missionId}/telemetry`, { telemetry: telemetryBatch });
  
  // 3. Inject Events & Faults
  console.log("⚠️ Injecting events and faults...");
  await postData(`/${missionId}/event`, {
    timestamp: new Date(Date.now() - (300 * 1000)).toISOString(),
    eventType: "ALARM",
    severity: "CRITICAL",
    title: "Turbocharger Temp Spike",
    description: "CHT exceeded 130C limit."
  });
  
  await postData(`/${missionId}/fault`, {
    faultType: "Cylinder Overheating",
    severity: "CRITICAL",
    affectedSystems: "Engine Bank 1",
    injectedAt: new Date(Date.now() - (300 * 1000)).toISOString(),
    detectedAt: new Date(Date.now() - (295 * 1000)).toISOString(),
    recoveredAt: new Date(Date.now() - (100 * 1000)).toISOString(),
    impactDescription: "Reduced thrust by 15%",
    aiResponse: "Throttle reduced automatically",
    outcome: "Recovered"
  });

  await postData(`/${missionId}/ai`, {
    timestamp: new Date(Date.now() - (290 * 1000)).toISOString(),
    actionType: "Throttle Reduction",
    reason: "Thermal mitigation",
    confidenceScore: 0.98,
    outcome: "SUCCESS"
  });

  // 4. End Mission
  console.log("🏁 Ending mission...");
  await postData(`/${missionId}/end`, {});
  
  console.log(`🎉 Mission ${missionId} successfully recorded! Refresh your Replay UI!`);
}

runTestMission().catch(console.error);
