// boss.js — ステージボス（大型戦艦）。露出したコアが弱点。
// 本体（body）は弾を吸収し、コア（core）が開いている時だけダメージが通る。

(function () {
  "use strict";
  const G = window.G;
  const C = G.C;
  const COL = C.COL;
  const U = G.util;

  class Boss {
    constructor() {
      this.w = 170;
      this.h = 150;
      this.x = C.W + 140;
      this.y = C.H / 2 - 30;
      this.targetX = C.W - 130;
      this.baseY = C.H / 2 - 30;
      this.maxHp = 140;
      this.hp = this.maxHp;
      this.dead = false;
      this.state = "enter"; // enter -> battle -> dying
      this.t = 0;
      this.coreOpen = true;
      this.coreTimer = 3.5;
      this.fireTimer = 1.2;
      this.spreadTimer = 2.4;
      this.dyingTimer = 0;
      this.score = 8000;
    }

    get enraged() {
      return this.hp < this.maxHp * 0.4;
    }

    // コア（弱点）矩形：本体前面（左寄り）
    coreRect() {
      return { x: this.x - this.w / 2 + 26, y: this.y, w: 34, h: 34 };
    }
    // 本体矩形（弾を吸収／接触ダメージ）
    bodyRect() {
      return { x: this.x, y: this.y, w: this.w, h: this.h };
    }
    get coreVulnerable() {
      return this.coreOpen && this.state === "battle";
    }

    // ダメージ適用。コアに当たった時のみ有効。
    damageCore(dmg) {
      if (!this.coreVulnerable) return false;
      this.hp -= dmg;
      if (this.hp <= 0) {
        this.hp = 0;
        this.state = "dying";
        this.dyingTimer = 1.6;
      }
      return true;
    }

    update(dt, game) {
      this.t += dt;

      if (this.state === "enter") {
        this.x -= 160 * dt;
        if (this.x <= this.targetX) {
          this.x = this.targetX;
          this.state = "battle";
        }
        return;
      }

      if (this.state === "dying") {
        this.dyingTimer -= dt;
        // 断末魔の爆発を撒く
        if (Math.random() < 0.5) {
          G.Particles.bigBurst(
            this.x + U.rand(-this.w / 2, this.w / 2),
            this.y + U.rand(-this.h / 2, this.h / 2)
          );
        }
        this.x -= 10 * dt;
        if (this.dyingTimer <= 0) {
          this.dead = true;
          G.Particles.bigBurst(this.x, this.y);
          G.audio.bigExplode();
        }
        return;
      }

      // battle
      this.y = this.baseY + Math.sin(this.t * 0.9) * 70;

      // コアの開閉サイクル
      this.coreTimer -= dt;
      if (this.coreTimer <= 0) {
        this.coreOpen = !this.coreOpen;
        this.coreTimer = this.coreOpen ? (this.enraged ? 3.5 : 3.0) : 1.8;
      }

      // 前方への連射
      this.fireTimer -= dt;
      if (this.fireTimer <= 0) {
        this.fireTimer = this.enraged ? 0.9 : 1.4;
        this._aimBurst(game);
      }

      // 拡散弾
      this.spreadTimer -= dt;
      if (this.spreadTimer <= 0) {
        this.spreadTimer = this.enraged ? 1.8 : 2.6;
        this._spread(game);
      }
    }

    _aimBurst(game) {
      const p = game.player;
      if (!p.alive) return;
      const cr = this.coreRect();
      const n = this.enraged ? 3 : 2;
      for (let i = 0; i < n; i++) {
        const dx = p.x - cr.x,
          dy = p.y - cr.y + (i - (n - 1) / 2) * 40;
        const d = Math.hypot(dx, dy) || 1;
        const sp = 240;
        game.enemyShots.push(
          new G.Weapons.EnemyBullet(
            cr.x,
            cr.y,
            (dx / d) * sp,
            (dy / d) * sp,
            COL.yellow,
            10
          )
        );
      }
    }

    _spread(game) {
      const cx = this.x - this.w / 2 + 10;
      const cy = this.y;
      const count = this.enraged ? 10 : 7;
      const spread = Math.PI * 0.9;
      for (let i = 0; i < count; i++) {
        const ang =
          Math.PI - spread / 2 + (spread * i) / (count - 1); // 左向き扇状
        const sp = 170;
        game.enemyShots.push(
          new G.Weapons.EnemyBullet(
            cx,
            cy,
            Math.cos(ang) * sp,
            Math.sin(ang) * sp,
            COL.mag,
            9
          )
        );
      }
    }

    draw(ctx) {
      const x = this.x,
        y = this.y;
      const flash = this.state === "dying" && Math.floor(this.t * 20) % 2 === 0;

      // 本体
      ctx.save();
      ctx.shadowColor = COL.purple;
      ctx.shadowBlur = 18;
      ctx.fillStyle = flash ? COL.white : "#2b1550";
      ctx.strokeStyle = COL.purple;
      ctx.lineWidth = 2;
      const w = this.w,
        h = this.h;
      ctx.beginPath();
      ctx.moveTo(x - w / 2, y - h / 2 + 16);
      ctx.lineTo(x + w / 2 - 20, y - h / 2);
      ctx.lineTo(x + w / 2, y);
      ctx.lineTo(x + w / 2 - 20, y + h / 2);
      ctx.lineTo(x - w / 2, y + h / 2 - 16);
      ctx.lineTo(x - w / 2 + 18, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 装甲のディテール線
      ctx.save();
      ctx.strokeStyle = "rgba(176,107,255,0.5)";
      ctx.lineWidth = 1;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(x - w / 2 + 30, y + i * 30);
        ctx.lineTo(x + w / 2 - 24, y + i * 30);
        ctx.stroke();
      }
      ctx.restore();

      // コア（弱点）
      const cr = this.coreRect();
      ctx.save();
      if (this.coreVulnerable) {
        const pulse = 0.6 + 0.4 * Math.sin(this.t * 10);
        ctx.shadowColor = COL.red;
        ctx.shadowBlur = 20;
        ctx.fillStyle = `rgba(255,77,94,${0.6 + pulse * 0.4})`;
      } else {
        ctx.shadowColor = COL.cyan;
        ctx.shadowBlur = 10;
        ctx.fillStyle = "#0a3a4a"; // 閉じている＝無敵
      }
      ctx.beginPath();
      ctx.arc(cr.x, cr.y, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = COL.white;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // コアが閉じている時のシャッター表現
      if (!this.coreVulnerable) {
        ctx.save();
        ctx.strokeStyle = COL.cyan;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cr.x - 16, cr.y);
        ctx.lineTo(cr.x + 16, cr.y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  G.Boss = Boss;
})();
