const fs = require('fs');
const path = require('path');
const dns = require('dns');
const { exec, spawn } = require('child_process');

const configPath = path.join(__dirname, '../data/local-auto-config.json');

let cooldownUntil = 0;
let idleStreakSeconds = 0;
const CHECK_INTERVAL_MS = 10000; // 10s

function readConfig() {
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (e) {
    console.error("❌ Failed to read config:", e.message);
    return null;
  }
}

function writeConfig(config) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  } catch (e) {
    console.error("❌ Failed to write config:", e.message);
  }
}

// Check internet by resolving google.com
function checkOnline() {
  return new Promise((resolve) => {
    dns.lookup('google.com', (err) => {
      resolve(!err);
    });
  });
}

// Get total bytes (in + out) for non-loopback interfaces on macOS
function getNetworkBytes() {
  return new Promise((resolve) => {
    exec('netstat -ib', (err, stdout) => {
      if (err) {
        return resolve(0);
      }
      let totalBytes = 0;
      const lines = stdout.trim().split('\n');
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].trim().split(/\s+/);
        // On macOS, the row with MAC address has '<Link#...>' in the 3rd column
        // Format: Name Mtu Network Address Ipkts Ierrs Ibytes Opkts Oerrs Obytes Coll
        if (parts[2] && parts[2].startsWith('<Link')) {
          const ibytes = parseInt(parts[6], 10);
          const obytes = parseInt(parts[9], 10);
          
          if (!isNaN(ibytes)) totalBytes += ibytes;
          if (!isNaN(obytes)) totalBytes += obytes;
        }
      }
      resolve(totalBytes);
    });
  });
}

async function getNetworkThroughputKBps() {
  const bytes1 = await getNetworkBytes();
  await new Promise(r => setTimeout(r, 2000));
  const bytes2 = await getNetworkBytes();
  
  const diff = bytes2 - bytes1;
  const bytesPerSec = diff / 2;
  return Math.max(0, bytesPerSec / 1024);
}

function runWorker(batchSize) {
  return new Promise((resolve) => {
    console.log(`\n🚀 [AutoProducer] Spawning worker: target ${batchSize}, batch ${batchSize}...`);
    // Spawn worker
    const worker = spawn('node', ['scripts/worker-stage2.js', '--target', batchSize, '--batch', batchSize], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });

    worker.on('close', (code) => {
      console.log(`✅ [AutoProducer] Worker finished with code ${code}`);
      resolve(code);
    });
  });
}

async function mainLoop() {
  console.log("🤖 Local Auto Producer Started");

  while (true) {
    await new Promise(r => setTimeout(r, CHECK_INTERVAL_MS));

    const config = readConfig();
    if (!config || !config.autoProductionEnabled) {
      idleStreakSeconds = 0;
      continue;
    }

    // Reset daily count if date changed
    const today = new Date().toISOString().split('T')[0];
    if (config.lastRunDate !== today) {
      config.todayGenerated = 0;
      config.lastRunDate = today;
      writeConfig(config);
    }

    // Check daily limit
    if (config.todayGenerated >= config.dailyLimit) {
      idleStreakSeconds = 0;
      continue;
    }

    // Check cooldown
    if (Date.now() < cooldownUntil) {
      idleStreakSeconds = 0;
      continue;
    }

    // Check online
    const isOnline = await checkOnline();
    if (!isOnline) {
      console.log("⚠️ [AutoProducer] Offline. Waiting...");
      idleStreakSeconds = 0;
      continue;
    }

    // Check network idle
    const kbps = await getNetworkThroughputKBps();
    if (kbps > config.maxNetworkKBps) {
      if (idleStreakSeconds > 0) {
         console.log(`📡 [AutoProducer] Network active (${kbps.toFixed(1)} KB/s). Resetting idle streak.`);
      }
      idleStreakSeconds = 0;
      continue;
    }

    idleStreakSeconds += (CHECK_INTERVAL_MS / 1000) + 2; // +2 for the throughput sleep

    const requiredIdleSeconds = config.idleMinutes * 60;
    process.stdout.write(`\r💤 [AutoProducer] Idle streak: ${Math.floor(idleStreakSeconds)}s / ${requiredIdleSeconds}s `);

    if (idleStreakSeconds >= requiredIdleSeconds) {
      console.log("\n⚡ [AutoProducer] Idle threshold reached! Starting batch generation.");
      
      // Run worker
      await runWorker(config.batchSize);

      // Update state
      const newConfig = readConfig(); // read fresh config
      newConfig.todayGenerated += config.batchSize;
      newConfig.lastRunDate = today;
      writeConfig(newConfig);

      console.log(`📊 [AutoProducer] Today generated: ${newConfig.todayGenerated} / ${newConfig.dailyLimit}`);

      // Set cooldown
      const cdMins = newConfig.cooldownMinutes || 180;
      console.log(`❄️  [AutoProducer] Entering cooldown for ${cdMins} minutes...`);
      cooldownUntil = Date.now() + (cdMins * 60 * 1000);
      idleStreakSeconds = 0;
    }
  }
}

mainLoop();
