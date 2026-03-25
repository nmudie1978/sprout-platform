/**
 * Lightweight confetti burst using canvas overlay.
 * No external dependencies — self-contained.
 */
export function fireConfetti(): void {
  if (typeof window === 'undefined') return;

  try {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) { canvas.remove(); return; }

    const colors = ['#10b981', '#14b8a6', '#f59e0b', '#8b5cf6', '#3b82f6', '#ec4899'];

    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      w: number; h: number;
      color: string;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
    }

    const particles: Particle[] = [];
    const cx = canvas.width / 2;
    const cy = canvas.height * 0.3;

    for (let i = 0; i < 80; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = 3 + Math.random() * 6;
      particles.push({
        x: cx + (Math.random() - 0.5) * 100,
        y: cy + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        w: 4 + Math.random() * 4,
        h: 6 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        opacity: 1,
      });
    }

    let frame = 0;
    const maxFrames = 120;

    function animate() {
      if (frame >= maxFrames) {
        canvas.remove();
        return;
      }
      ctx!.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.vx *= 0.99; // drag
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, 1 - frame / maxFrames);

        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rotation);
        ctx!.globalAlpha = p.opacity;
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx!.restore();
      }

      frame++;
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  } catch {
    // Silent fail — confetti is non-critical
  }
}
