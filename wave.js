const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

const spacing = 40;
const cols = Math.ceil(width / spacing) + 2;
const rows = Math.ceil(height / spacing) + 2;

const baseGrid = [];
for (let y = 0; y < rows; y++) {
  baseGrid[y] = [];
  for (let x = 0; x < cols; x++) {
    baseGrid[y][x] = {
      x: x * spacing,
      y: y * spacing,
      phase: Math.random() * Math.PI * 2,
    };
  }
}

const mouse = { x: -9999, y: -9999 };
const smoothMouse = { x: -9999, y: -9999 };
const trail = [];
//asdasd
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

canvas.addEventListener("mousedown", (e) => {
  const dx = e.clientX - boat.x;
  const dy = e.clientY - boat.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < boat.size) {
    isDragging = true;
    dragOffset.x = dx;
    dragOffset.y = dy;
    returningToPort = false;
  }
});
canvas.addEventListener("mouseup", () => {
  if (isDragging) {
    isDragging = false;
    lastControlTime = Date.now();
  }
});

//asdasd

const boat = {
  x: width - 200,
  y: 50,
  angle: Math.PI,
  velocity: { x: 0, y: 0 },
  speed: 0,
  maxSpeed: 3,
  acceleration: 0.2,
  friction: 0.95,
  turnSpeed: 0.05,
  size: 60,
  wakeTrail: [],
};

const home = { x: 30, y: 80 };
let returningToPort = false;
let returnStartTime = null;
let lastControlTime = Date.now();
let isTurningBack = false;

const keys = {};

document.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
  lastControlTime = Date.now();
  returningToPort = false;
});

document.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
  lastControlTime = Date.now();
});

const boatImage = new Image();
boatImage.src = "./assets/boat1.png";

canvas.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  trail.push({ x: e.clientX, y: e.clientY, age: 0 });
});

canvas.addEventListener("mouseleave", () => {
  mouse.x = -9999;
  mouse.y = -9999;
});

window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

function updateBoat() {
  const now = Date.now();

  ///asda
  if (isDragging) {
    boat.x = mouse.x - dragOffset.x;
    boat.y = mouse.y - dragOffset.y;
    boat.speed = 0;
    boat.velocity = { x: 0, y: 0 };
    return; // skip physics if dragging
  }
  ///asdasd

  
  const idleTime = now - lastControlTime;
  let isControlled = keys["w"] || keys["arrowup"] || keys["s"] || keys["arrowdown"] || keys["a"] || keys["arrowleft"] || keys["d"] || keys["arrowright"];
  ///
  if (returningToPort && !isTurningBack) {
    const dx = home.x - boat.x;
    const dy = home.y - boat.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 5) {
      boat.speed = 0;
      //boat.angle = -Math.PI / 2;
      returningToPort = false;
    }
  }
  ///
  

  if (idleTime > 5000 && !returningToPort) {
    returningToPort = true;
    isTurningBack = true;
    returnStartTime = now;
  }

  if (returningToPort) {
    if (isTurningBack) {
      const dx = home.x - boat.x;
      const dy = home.y - boat.y;
      const targetAngle = Math.atan2(dy, dx);
      let angleDiff = targetAngle - boat.angle;

      angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));

      if (Math.abs(angleDiff) < 0.05) {
        isTurningBack = false;
      } else {
        boat.angle += Math.sign(angleDiff) * boat.turnSpeed;
      }
    } else {
      const dx = home.x - boat.x;
      const dy = home.y - boat.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angleToHome = Math.atan2(dy, dx);
      boat.angle = angleToHome;

      boat.speed = Math.min(boat.speed + boat.acceleration, boat.maxSpeed);
    }
  }

  if (!returningToPort && isControlled) {
    if (keys["w"] || keys["arrowup"]) {
      boat.speed = Math.min(boat.speed + boat.acceleration, boat.maxSpeed);
    }
    if (keys["s"] || keys["arrowdown"]) {
      boat.speed = Math.max(boat.speed - boat.acceleration, -boat.maxSpeed * 0.5);
    }
    if (keys["a"] || keys["arrowleft"]) {
      boat.angle -= boat.turnSpeed * (boat.speed / boat.maxSpeed + 0.3);
    }
    if (keys["d"] || keys["arrowright"]) {
      boat.angle += boat.turnSpeed * (boat.speed / boat.maxSpeed + 0.3);
    }
  }

  boat.speed *= boat.friction;
  boat.velocity.x = Math.cos(boat.angle) * boat.speed;
  boat.velocity.y = Math.sin(boat.angle) * boat.speed;
  boat.x += boat.velocity.x;
  boat.y += boat.velocity.y;

  boat.x = Math.max(boat.size, Math.min(width - boat.size, boat.x));
  boat.y = Math.max(boat.size, Math.min(height - boat.size, boat.y));

  if (Math.abs(boat.speed) > 0.5) {
    const wakeDistance = boat.size * 0.8;
    const wakeAngle1 = boat.angle + Math.PI + 0.3;
    const wakeAngle2 = boat.angle + Math.PI - 0.3;

    boat.wakeTrail.push({
      x: boat.x + Math.cos(wakeAngle1) * wakeDistance,
      y: boat.y + Math.sin(wakeAngle1) * wakeDistance,
      age: 0,
      intensity: Math.abs(boat.speed) / boat.maxSpeed,
    });

    boat.wakeTrail.push({
      x: boat.x + Math.cos(wakeAngle2) * wakeDistance,
      y: boat.y + Math.sin(wakeAngle2) * wakeDistance,
      age: 0,
      intensity: Math.abs(boat.speed) / boat.maxSpeed,
    });

    boat.wakeTrail.push({
      x: boat.x + Math.cos(boat.angle + Math.PI) * wakeDistance * 0.5,
      y: boat.y + Math.sin(boat.angle + Math.PI) * wakeDistance * 0.5,
      age: 0,
      intensity: (Math.abs(boat.speed) / boat.maxSpeed) * 0.7,
    });
  }

  for (let i = boat.wakeTrail.length - 1; i >= 0; i--) {
    boat.wakeTrail[i].age += 1;
    if (boat.wakeTrail[i].age > 30) {
      boat.wakeTrail.splice(i, 1);
    }
  }
}

function drawBoat() {
  ctx.save();
  ctx.translate(boat.x, boat.y);
  ctx.rotate(boat.angle);

  if (boatImage.complete) {
    const scale = boat.size / Math.max(boatImage.width, boatImage.height);
    const drawWidth = boatImage.width * scale;
    const drawHeight = boatImage.height * scale;

    ctx.drawImage(boatImage, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  } else {
    ctx.fillStyle = "#8B4513";
    ctx.beginPath();
    ctx.ellipse(0, 0, boat.size / 2, boat.size / 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#654321";
    ctx.beginPath();
    ctx.moveTo(boat.size / 3, 0);
    ctx.lineTo(-boat.size / 3, -boat.size / 6);
    ctx.lineTo(-boat.size / 3, boat.size / 6);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function smoothLine(points) {
  if (points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length - 2; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
  }
  if (points.length >= 2) {
    const penultimate = points[points.length - 2];
    const last = points[points.length - 1];
    ctx.quadraticCurveTo(penultimate.x, penultimate.y, last.x, last.y);
  }
  ctx.stroke();
}

function draw(time) {
  updateBoat();
  const lerpFactor = 0.1;
  smoothMouse.x += (mouse.x - smoothMouse.x) * lerpFactor;
  smoothMouse.y += (mouse.y - smoothMouse.y) * lerpFactor;
  ctx.fillStyle = "#fefefe";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#ccc";
  ctx.lineWidth = 1;

  const waveSpeed = time * 0.002;
  const bumpRadius = 100;
  const bumpHeight = 25;

  for (let i = trail.length - 1; i >= 0; i--) {
    trail[i].age += 1;
    if (trail[i].age > 20) {
      trail.splice(i, 1);
    }
  }

  const grid = [];
  for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) {
      const point = baseGrid[y][x];
      let waveX = Math.cos(waveSpeed + point.phase) * 10;
      let waveY = Math.sin(waveSpeed + point.phase) * 10;
      let bump = 0;

      for (const t of trail) {
        const dx = point.x - t.x;
        const dy = point.y - t.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const ratio = dist / bumpRadius;
        const falloff = 20;
        const strength = Math.exp(-ratio * ratio * falloff) * bumpHeight;
        const ageFalloff = 1 - t.age / 20;
        bump += strength * ageFalloff;
      }

      for (const wake of boat.wakeTrail) {
        const dx = point.x - wake.x;
        const dy = point.y - wake.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const ratio = dist / bumpRadius;
        const falloff = 5;
        const strength = Math.exp(-ratio * ratio * falloff);
        const ageFalloff = 1 - wake.age / 10;
        bump += strength * ageFalloff;
      }

      const boatDx = point.x - boat.x;
      const boatDy = point.y - boat.y;
      const boatDist = Math.sqrt(boatDx * boatDx + boatDy * boatDy);
      if (boatDist < boat.size * 1.5) {
        const boatRatio = boatDist / (boat.size * 1.5);
        const boatStrength = Math.exp(-boatRatio * boatRatio * 10) * 15;
        bump += boatStrength;
      }

      grid[y][x] = {
        x: point.x + waveX,
        y: point.y + waveY - bump,
      };
    }
  }

  for (let y = 0; y < rows; y++) {
    smoothLine(grid[y]);
  }

  for (let x = 0; x < cols; x++) {
    const column = [];
    for (let y = 0; y < rows; y++) {
      column.push(grid[y][x]);
    }
    smoothLine(column);
  }

  drawBoat();
  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
