import gsap from 'gsap';

interface ConfettiOptions {
  origin?: { x: number; y: number };
  count?: number;
  colors?: string[];
  spread?: number;
  duration?: number;
  gravity?: number;
  scalar?: number;
}

export function launchConfetti(options: ConfettiOptions = {}) {
  const {
    origin = { x: 0.5, y: 0.5 },
    count = 80,
    colors = ['#00ffe0', '#7b5fe8', '#d4a843', '#ff4060', '#ffffff'],
    spread = 70,
    duration = 3000,
    gravity = 0.6,
    scalar = 1.0
  } = options;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '10001';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const pieces: any[] = [];
  const startX = origin.x * canvas.width;
  const startY = origin.y * canvas.height;

  for (let i = 0; i < count; i++) {
    const angle = (Math.random() - 0.5) * spread * (Math.PI / 180) - Math.PI / 2;
    const speed = (Math.random() * 15 + 10) * scalar;
    
    pieces.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 10,
      w: (Math.random() * 10 + 5) * scalar,
      h: (Math.random() * 6 + 3) * scalar,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1,
      shape: Math.random() > 0.5 ? 'rect' : 'circle'
    });
  }

  let startTime = Date.now();

  const update = () => {
    const elapsed = Date.now() - startTime;
    const progress = elapsed / duration;

    if (progress >= 1) {
      canvas.remove();
      window.removeEventListener('resize', resize);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.forEach(p => {
      p.vy += gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotV;
      
      if (progress > 0.7) {
        p.opacity = 1 - (progress - 0.7) / 0.3;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    requestAnimationFrame(update);
  };

  update();
}
