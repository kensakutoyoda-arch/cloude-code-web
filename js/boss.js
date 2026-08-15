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

      // 船体（コア開/閉でスプライト切り替え。断末魔は白フラッシュ）
      const hull = flash
        ? "bossWhite"
        : this.coreVulnerable
          ? "bossOpen"
          : "bossClosed";
      G.Sprites.blit(ctx, hull, x, y);

      // コア（開いている時のみ、赤の明滅スプライトを重ねる）
      if (this.coreVulnerable && !flash) {
        const cr = this.coreRect();
        const frame = Math.floor(this.t * 8) % 2;
        G.Sprites.blit(ctx, frame === 0 ? "core0" : "core1", cr.x, cr.y);
      }
    }
  }

  G.Boss = Boss;
})();
