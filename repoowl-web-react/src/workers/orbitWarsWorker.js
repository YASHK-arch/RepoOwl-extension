// Orbit Wars Background Simulation Worker
// Autonomous 4-player AI simulation

const BOARD_SIZE = 1000;
const SUN = { x: 500, y: 500, radius: 35 };

let planets = [];
let fleets = [];
let comet = null;
let ticks = 0;

// Setup initial state
function init() {
  planets = [];
  fleets = [];
  comet = null;
  ticks = 0;

  // Inner rotating planets
  for (let i = 0; i < 4; i++) {
    planets.push({
      id: i,
      owner: i,
      ships: 100,
      radius: 12,
      orbitRadius: 150,
      angle: (Math.PI / 2) * i,
      orbitSpeed: 0.002,
      x: 0,
      y: 0,
      genPower: 2
    });
  }

  // Outer static planets (neutral)
  for (let i = 0; i < 8; i++) {
    let r = Math.random();
    let gen = 2;
    if (r > 0.85) gen = 5;
    else if (r > 0.6) gen = 4;
    else if (r > 0.3) gen = 2;
    else gen = 1;
    
    // Scale radius precisely with production power
    let rad = 9 + (gen - 1) * 2.5;

    planets.push({
      id: i + 4,
      owner: null, // Neutral
      ships: 20 * gen, // Stronger planets are harder to take
      radius: rad,
      orbitRadius: 280,
      angle: (Math.PI / 4) * i + Math.PI / 8,
      orbitSpeed: 0, // static
      x: 0,
      y: 0,
      genPower: gen
    });
  }

  // Far lone planets (corners / deep space)
  for (let i = 0; i < 6; i++) {
    let gen = Math.random() > 0.5 ? 2 : 1;
    let rad = 9 + (gen - 1) * 2.5;
    
    planets.push({
      id: i + 12,
      owner: null,
      ships: 10 * gen,
      radius: rad,
      orbitRadius: 380 + Math.random() * 120, // Very far
      angle: (Math.PI / 3) * i + Math.random(),
      orbitSpeed: 0.0005 * (Math.random() > 0.5 ? 1 : -1), // Slow revolving
      x: 0,
      y: 0,
      genPower: gen
    });
  }
  
  updatePlanetPositions();
}

function updatePlanetPositions() {
  planets.forEach(p => {
    if (p.orbitSpeed !== 0) {
      p.angle += p.orbitSpeed;
    }
    // Horizontal ellipse: X axis is 1.8x wider
    p.x = SUN.x + Math.cos(p.angle) * (p.orbitRadius * 1.8);
    p.y = SUN.y + Math.sin(p.angle) * p.orbitRadius;
  });
}

function updatePlanets() {
  planets.forEach(p => {
    if (p.owner !== null) {
      if (ticks % 20 === 0) { // Fast production
        p.ships += (p.genPower * 0.75); // scales with genPower
      }
    }
  });
}

function calculateState() {
  let totalShips = 0;
  let playerShips = [0, 0, 0, 0];
  let playerPlanets = [0, 0, 0, 0];

  planets.forEach(p => {
    totalShips += p.ships;
    if (p.owner !== null) {
      playerShips[p.owner] += p.ships;
      playerPlanets[p.owner] += 1;
    }
  });

  fleets.forEach(f => {
    totalShips += f.ships;
    if (f.owner !== null) {
      playerShips[f.owner] += f.ships;
    }
  });

  return { totalShips, playerShips, playerPlanets };
}

function doAI() {
  const { totalShips, playerShips, playerPlanets } = calculateState();

  const STRATEGIES = ['aggressive', 'defensive', 'balanced', 'opportunistic'];

  // For each player, decide a move
  for (let player = 0; player < 4; player++) {
    if (playerPlanets[player] === 0) continue; // dead (should be prevented by rubber band)

    const strategy = STRATEGIES[player];

    let isSnowballing = (playerShips[player] / (totalShips || 1)) > 0.4;
    let isUnderdog = (playerShips[player] / (totalShips || 1)) < 0.1 || playerPlanets[player] === 1;

    let actionChance = 0.02;
    let sendPercentage = 0.5;

    if (strategy === 'aggressive') {
       actionChance = 0.08;
       sendPercentage = 0.8;
    } else if (strategy === 'defensive') {
       actionChance = 0.015;
       sendPercentage = 0.3;
    } else if (strategy === 'opportunistic') {
       actionChance = 0.05;
       sendPercentage = 0.6;
    } else {
       // balanced
       actionChance = 0.04;
       sendPercentage = 0.5;
    }

    // Only make a move occasionally (staggered)
    if (Math.random() > actionChance) continue;

    // Find a source planet
    let myPlanets = planets.filter(p => p.owner === player && p.ships > 10);
    if (myPlanets.length === 0) continue;
    let source = myPlanets[Math.floor(Math.random() * myPlanets.length)];

    // Decide target
    let target = null;
    let shipsToSend = Math.floor(source.ships * sendPercentage);

    if (isSnowballing) {
      // Bad move: target the sun or split into tiny fleet
      if (Math.random() > 0.5) {
        // Send to sun (virtual target)
        target = { id: -1, x: SUN.x, y: SUN.y, radius: SUN.radius, owner: null };
      } else {
        shipsToSend = 1; // Tiny slow fleet
        let others = planets.filter(p => p.owner !== player);
        if (others.length > 0) {
           target = others[Math.floor(Math.random() * others.length)];
        }
      }
    } else {
      // Normal move: Target a neutral or enemy planet
      let possibleTargets = planets.filter(p => p.id !== source.id);
      
      // Rubber-band: don't target underdog's last planet
      possibleTargets = possibleTargets.filter(p => {
         if (p.owner !== null && p.owner !== player) {
            let enemyPlanets = playerPlanets[p.owner];
            let enemyShare = playerShips[p.owner] / (totalShips || 1);
            if (enemyPlanets === 1 || enemyShare < 0.1) return false; // Spare them
         }
         return true;
      });

      if (possibleTargets.length > 0) {
        if (strategy === 'aggressive') {
           // Target highest ship count non-owned planet to assert dominance
           let enemies = possibleTargets.filter(p => p.owner !== player);
           if (enemies.length > 0) {
              enemies.sort((a,b) => b.ships - a.ships);
              target = enemies[0];
           } else {
              target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
           }
        } else if (strategy === 'defensive') {
           // Reinforce own weakest planet, or attack if source is huge
           let ownPlanets = possibleTargets.filter(p => p.owner === player);
           if (source.ships < 150 && ownPlanets.length > 0) {
              ownPlanets.sort((a,b) => a.ships - b.ships);
              target = ownPlanets[0];
           } else {
              target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
           }
        } else if (strategy === 'opportunistic') {
           // Target weakest planet globally to sweep easy wins
           possibleTargets.sort((a,b) => a.ships - b.ships);
           target = possibleTargets[0];
        } else {
           // balanced: prefer weak targets
           let weakTargets = possibleTargets.filter(p => p.ships < shipsToSend);
           if (weakTargets.length > 0) {
              target = weakTargets[Math.floor(Math.random() * weakTargets.length)];
           } else {
              target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
           }
        }
      }
    }

    if (target) {
      // Apply noise to target pos to simulate organic imperfect targeting
      let targetX = target.x + (Math.random() * 20 - 10);
      let targetY = target.y + (Math.random() * 20 - 10);

      // Logarithmic speed based on ships, dialed back slightly
      let speed = 12 / (1 + Math.log10(shipsToSend + 1));
      if (speed < 0.8) speed = 0.8;

      // Distance
      let dx = targetX - source.x;
      let dy = targetY - source.y;
      let dist = Math.sqrt(dx * dx + dy * dy);

      fleets.push({
        id: Math.random().toString(36).substr(2, 9),
        owner: player,
        ships: shipsToSend,
        x: source.x,
        y: source.y,
        vx: (dx / dist) * speed,
        vy: (dy / dist) * speed,
        speed: speed,
        targetId: target.id
      });
      source.ships -= shipsToSend;
    }
  }
}

function update() {
  ticks++;
  updatePlanetPositions();

  const { totalShips, playerShips, playerPlanets } = calculateState();

  // Production every 15 ticks (faster)
  if (ticks % 15 === 0) {
    planets.forEach(p => {
      if (p.owner !== null) {
        let isUnderdog = (playerShips[p.owner] / (totalShips || 1)) < 0.1 || playerPlanets[p.owner] <= 1;
        let prod = (1 + Math.log(p.radius)) * 1.5; // High production for intense game
        if (isUnderdog) prod *= 4; // Underdog boost stronger
        p.ships += prod;
      }
    });
  }

  // AI moves
  doAI();

  // Move fleets and resolve combat
  for (let i = fleets.length - 1; i >= 0; i--) {
    let f = fleets[i];
    
    // Homing logic towards moving target
    if (f.targetId !== -1) {
      let target = planets.find(p => p.id === f.targetId);
      if (target) {
        let dx = target.x - f.x;
        let dy = target.y - f.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
           let desiredVx = (dx / dist) * f.speed;
           let desiredVy = (dy / dist) * f.speed;
           // Steer towards target
           f.vx += (desiredVx - f.vx) * 0.06;
           f.vy += (desiredVy - f.vy) * 0.06;
        }
      }
    }

    // Avoid Sun (Repulsive force if too close)
    let sdx = SUN.x - f.x;
    let sdy = SUN.y - f.y;
    let sdistSq = sdx*sdx + sdy*sdy;
    let avoidanceRadius = SUN.radius + 80;
    if (sdistSq < avoidanceRadius * avoidanceRadius) {
       let sdist = Math.sqrt(sdistSq);
       let pushFactor = (avoidanceRadius - sdist) / avoidanceRadius;
       // Push away from sun
       f.vx -= (sdx / sdist) * pushFactor * f.speed * 0.8;
       f.vy -= (sdy / sdist) * pushFactor * f.speed * 0.8;
    }

    // Normalize speed
    let currentSpeed = Math.sqrt(f.vx*f.vx + f.vy*f.vy);
    if (currentSpeed > 0 && f.speed) {
       f.vx = (f.vx / currentSpeed) * f.speed;
       f.vy = (f.vy / currentSpeed) * f.speed;
    }

    f.x += f.vx;
    f.y += f.vy;

    // Check sun collision
    if (sdistSq < SUN.radius * SUN.radius) {
      fleets.splice(i, 1);
      continue;
    }

    // Check out of bounds
    if (f.x < -100 || f.x > BOARD_SIZE + 100 || f.y < -100 || f.y > BOARD_SIZE + 100) {
      fleets.splice(i, 1);
      continue;
    }

    // Check target collision
    if (f.targetId !== -1) {
      let target = planets.find(p => p.id === f.targetId);
      if (target) {
        let dx = f.x - target.x;
        let dy = f.y - target.y;
        if (Math.sqrt(dx * dx + dy * dy) < target.radius) {
          // Combat
          if (target.owner === f.owner) {
            target.ships += f.ships;
          } else {
            target.ships -= f.ships;
            if (target.ships < 0) {
              target.owner = f.owner;
              target.ships = Math.abs(target.ships);
            }
          }
          fleets.splice(i, 1);
        }
      } else {
        // Target doesn't exist? Just let it fly off
      }
    }
  }

  // Comet logic with real gravity physics (inverse-square law)
  if (!comet && Math.random() < 0.002) {
      let side = Math.floor(Math.random() * 4);
      let cx = 0, cy = 0;
      let speed = 3.5 + Math.random() * 2; // Initial entry speed
      
      // Target a point slightly offset from the sun to ensure a slingshot instead of a direct crash
      let targetX = SUN.x + (Math.random() > 0.5 ? 120 : -120);
      let targetY = SUN.y + (Math.random() > 0.5 ? 120 : -120);

      if (side === 0) { cx = Math.random() * BOARD_SIZE; cy = -200; }
      else if (side === 1) { cx = BOARD_SIZE + 200; cy = Math.random() * BOARD_SIZE; }
      else if (side === 2) { cx = Math.random() * BOARD_SIZE; cy = BOARD_SIZE + 200; }
      else { cx = -200; cy = Math.random() * BOARD_SIZE; }

      let angle = Math.atan2(targetY - cy, targetX - cx);
      comet = {
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed
      };
  }

  if (comet) {
      let dx = SUN.x - comet.x;
      let dy = SUN.y - comet.y;
      let distSq = dx * dx + dy * dy;
      let dist = Math.sqrt(distSq);

      // Apply Sun's gravity (a = G / r^2)
      let G = 20000; // Gravity constant tuned for visual flair
      if (dist > 15) { // Prevent division by zero / singularity explosions
          let accel = G / distSq;
          comet.vx += (dx / dist) * accel;
          comet.vy += (dy / dist) * accel;
      }

      comet.x += comet.vx;
      comet.y += comet.vy;

      // Despawn if it escapes deep into space
      if (comet.x > BOARD_SIZE + 400 || comet.x < -400 || comet.y > BOARD_SIZE + 400 || comet.y < -400) {
          comet = null;
      }
  }

  // Post state
  postMessage({
    type: 'STATE_UPDATE',
    payload: {
      planets: planets.map(p => ({ ...p })),
      fleets: fleets.map(f => ({ ...f })),
      sun: SUN,
      comet: comet ? { ...comet } : null
    }
  });
}

// Setup loop
let intervalId = null;

self.onmessage = (e) => {
  if (e.data.type === 'START') {
    if (!intervalId) {
       if (planets.length === 0) init();
       intervalId = setInterval(update, 1000 / 40); // 40 FPS update (slowed down)
    }
  } else if (e.data.type === 'PAUSE') {
    clearInterval(intervalId);
    intervalId = null;
  } else if (e.data.type === 'RESTART') {
    init();
  }
};
