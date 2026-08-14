// particles.js — 爆発・破片パーティクル

(function () {
  "use strict";
  const G = window.G;
  const U = G.util;

  class Particle {
    constructor(x, y, vx, vy, life, color, size) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.life = life;
      this.maxLife = life;
      this.color = color;
      this.size = size;
      this.dead = false;
    }
    update(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vx *= 0.96;
      this.vy *= 0.96;
      this.life -= dt;
      if (this.life <= 0) this.dead = true;
    }
    draw(ctx) {
      const a = Math.max(0, this.life / this.maxLife);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = this.color;
      const s = this.size * (0.4 + a * 0.6);
      ctx.fillRect(this.x - s / 2, this.y - s / 2, s, s);
      ctx.restore();
    }
  }

  const Particles = {
    list: [],
    reset() {
      this.list.length = 0;
    },
    spawn(x, y, vx, vy, life, color, size) {
      this.list.push(new Particle(x, y, vx, vy, life, color, size));
    },
    // 標準的な爆発
    burst(x, y, color, count = 14, spread = 220, size = 3) {
      for (let i = 0; i < count; i++) {
        const ang = U.rand(0, Math.PI * 2);
        const sp = U.rand(spread * 0.2, spread);
        this.spawn(
          x,
          y,
          Math.cos(ang) * sp,
          Math.sin(ang) * sp,
          U.rand(0.3, 0.7),
          color,
          size
        );
      }
    },
    // 大爆発（ボス用）
    bigBurst(x, y) {
      const cols = [G.C.COL.yellow, G.C.COL.orange, G.C.COL.red, G.C.COL.white];
      for (let i = 0; i < 40; i++) {
        const ang = U.rand(0, Math.PI * 2);
        const sp = U.rand(40, 340);
        this.spawn(
          x + U.rand(-20, 20),
          y + U.rand(-20, 20),
          Math.cos(ang) * sp,
          Math.sin(ang) * sp,
          U.rand(0.5, 1.3),
          U.choice(cols),
          U.rand(3, 6)
        );
      }
    },
    update(dt) {
      const l = this.list;
      for (let i = l.length - 1; i >= 0; i--) {
        l[i].update(dt);
        if (l[i].dead) l.splice(i, 1);
      }
    },
    draw(ctx) {
      for (const p of this.list) p.draw(ctx);
    },
  };

  G.Particles = Particles;
})();
