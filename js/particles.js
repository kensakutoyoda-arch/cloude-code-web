// particles.js — SFC風の爆発（スプライトアニメ）＋ドット破片

(function () {
  "use strict";
  const G = window.G;
  const U = G.util;
  const PX = () => G.C.PX;

  // ドット破片（グリッドスナップした矩形。発光なし）
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
      const px = PX();
      const s = a > 0.5 ? px * 2 : px; // 減衰で1ドットに縮む
      ctx.save();
      ctx.globalAlpha = a < 0.25 ? 0.5 : 1; // 消え際だけ半透明
      ctx.fillStyle = this.color;
      ctx.fillRect(U.snap(this.x), U.snap(this.y), s, s);
      ctx.restore();
    }
  }

  // 爆発スプライトアニメ（4フレーム）
  const EX_FRAMES = ["ex0", "ex1", "ex2", "ex3"];
  const EX_FPS = 14;
  class ExplosionAnim {
    constructor(x, y, scale) {
      this.x = x;
      this.y = y;
      this.scale = scale;
      this.t = 0;
      this.dead = false;
    }
    update(dt) {
      this.t += dt;
      if (this.t >= EX_FRAMES.length / EX_FPS) this.dead = true;
    }
    draw(ctx) {
      const fi = Math.min(
        EX_FRAMES.length - 1,
        Math.floor(this.t * EX_FPS)
      );
      G.Sprites.blitScaled(ctx, EX_FRAMES[fi], this.x, this.y, this.scale);
    }
  }

  const Particles = {
    list: [],
    anims: [],
    reset() {
      this.list.length = 0;
      this.anims.length = 0;
    },
    spawn(x, y, vx, vy, life, color, size) {
      this.list.push(new Particle(x, y, vx, vy, life, color, size));
    },
    // 爆発アニメ＋少量の破片
    explode(x, y, scale = 1) {
      this.anims.push(new ExplosionAnim(x, y, scale));
      const cols = [G.C.COL.yellow, G.C.COL.orange, G.C.COL.white];
      for (let i = 0; i < 6 * scale; i++) {
        const ang = U.rand(0, Math.PI * 2);
        const sp = U.rand(60, 180) * scale;
        this.spawn(
          x,
          y,
          Math.cos(ang) * sp,
          Math.sin(ang) * sp,
          U.rand(0.25, 0.5),
          U.choice(cols),
          0
        );
      }
    },
    // 小さな火花（被弾スパークなど）
    burst(x, y, color, count = 14, spread = 220, size = 3) {
      void size;
      for (let i = 0; i < count; i++) {
        const ang = U.rand(0, Math.PI * 2);
        const sp = U.rand(spread * 0.2, spread);
        this.spawn(
          x,
          y,
          Math.cos(ang) * sp,
          Math.sin(ang) * sp,
          U.rand(0.2, 0.5),
          color,
          0
        );
      }
    },
    // 大爆発（自機ミス・ボス用）
    bigBurst(x, y) {
      this.anims.push(new ExplosionAnim(x, y, 2));
      const cols = [G.C.COL.yellow, G.C.COL.orange, G.C.COL.red, G.C.COL.white];
      for (let i = 0; i < 24; i++) {
        const ang = U.rand(0, Math.PI * 2);
        const sp = U.rand(60, 320);
        this.spawn(
          x + U.rand(-14, 14),
          y + U.rand(-14, 14),
          Math.cos(ang) * sp,
          Math.sin(ang) * sp,
          U.rand(0.4, 1.0),
          U.choice(cols),
          0
        );
      }
    },
    update(dt) {
      const l = this.list;
      for (let i = l.length - 1; i >= 0; i--) {
        l[i].update(dt);
        if (l[i].dead) l.splice(i, 1);
      }
      const a = this.anims;
      for (let i = a.length - 1; i >= 0; i--) {
        a[i].update(dt);
        if (a[i].dead) a.splice(i, 1);
      }
    },
    draw(ctx) {
      for (const p of this.list) p.draw(ctx);
      for (const e of this.anims) e.draw(ctx);
    },
  };

  G.Particles = Particles;
})();
