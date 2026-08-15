// enemies.js — 雑魚敵（数種）とパワーカプセル
// 赤い個体（isRed）は撃破時にパワーカプセルをドロップする。

(function () {
  "use strict";
  const G = window.G;
  const C = G.C;
  const COL = C.COL;
  const U = G.util;

  // パワーカプセル
  class Capsule {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.w = 20;
      this.h = 20;
      this.vx = -70;
      this.dead = false;
      this.phase = U.rand(0, 6);
    }
    update(dt) {
      this.x += this.vx * dt;
      this.phase += dt * 5;
      if (this.x < -30) this.dead = true;
    }
    draw(ctx) {
      const frame = Math.floor(this.phase * 1.5) % 2;
      G.Sprites.blit(ctx, frame === 0 ? "capsule0" : "capsule1", this.x, this.y);
    }
  }

  class Enemy {
    // cfg: { x, y, type, isRed, hp, baseY, amp, freq, speed }
    constructor(cfg) {
      this.type = cfg.type || "straight";
      this.x = cfg.x;
      this.y = cfg.y;
      this.baseY = cfg.baseY != null ? cfg.baseY : cfg.y;
      this.amp = cfg.amp || 60;
      this.freq = cfg.freq || 2.2;
      this.t = U.rand(0, Math.PI * 2);
      this.speed = cfg.speed || 140;
      this.isRed = !!cfg.isRed;
      this.dead = false;
      this.score = 100;

      switch (this.type) {
        case "turret":
          this.w = 40;
          this.h = 34;
          this.hp = cfg.hp || 6;
          this.score = 500;
          this.fireCd = U.rand(0.6, 1.4);
          break;
        case "tracker":
          this.w = 22;
          this.h = 22;
          this.hp = cfg.hp || 1;
          this.score = 150;
          this.vy = 0;
          this.homed = false;
          break;
        case "sine":
          this.w = 26;
          this.h = 22;
          this.hp = cfg.hp || 1;
          this.score = 120;
          this.fireCd = U.rand(1.2, 2.4);
          break;
        default: // straight
          this.w = 26;
          this.h = 20;
          this.hp = cfg.hp || 1;
          this.score = 100;
          this.fireCd = U.rand(1.0, 2.2);
      }
      if (this.isRed) this.hp += 1;
    }

    update(dt, game) {
      this.t += dt;
      const player = game.player;

      switch (this.type) {
        case "sine":
          this.x -= this.speed * dt;
          this.y = this.baseY + Math.sin(this.t * this.freq) * this.amp;
          this._maybeShoot(dt, game, 200);
          break;
        case "tracker":
          this.x -= this.speed * dt;
          if (!this.homed && this.x < C.W - 120 && player.alive) {
            // 1回だけ自機の高さへ寄る
            const dir = Math.sign(player.y - this.y);
            this.vy = dir * 90;
            this.homed = true;
          }
          this.y += (this.vy || 0) * dt;
          break;
        case "turret":
          this.x -= this.speed * 0.6 * dt;
          this._maybeShoot(dt, game, 240, true);
          break;
        default: // straight
          this.x -= this.speed * dt;
          this._maybeShoot(dt, game, 210);
      }

      if (this.x < -40) this.dead = true;
    }

    _maybeShoot(dt, game, bulletSpeed, aimed) {
      if (this.fireCd == null) return;
      this.fireCd -= dt;
      if (this.fireCd <= 0 && this.x < C.W && this.x > 40 && game.player.alive) {
        this.fireCd = U.rand(1.1, 2.6);
        const p = game.player;
        let vx, vy;
        if (aimed) {
          const dx = p.x - this.x,
            dy = p.y - this.y;
          const d = Math.hypot(dx, dy) || 1;
          vx = (dx / d) * bulletSpeed;
          vy = (dy / d) * bulletSpeed;
        } else {
          vx = -bulletSpeed;
          vy = 0;
        }
        game.enemyShots.push(
          new G.Weapons.EnemyBullet(this.x - 10, this.y, vx, vy, COL.mag, 9)
        );
      }
    }

    draw(ctx) {
      G.Sprites.blit(ctx, this._spriteName(), this.x, this.y);
    }

    _spriteName() {
      switch (this.type) {
        case "turret":
          return this.isRed ? "turretRed" : "turret";
        case "tracker":
          return this.isRed ? "trackerRed" : "tracker";
        case "sine":
          return this.isRed ? "zakoRed" : "zakoMag";
        default:
          return this.isRed ? "zakoRed" : "zakoCyan";
      }
    }
  }

  G.Enemy = Enemy;
  G.Capsule = Capsule;
})();
