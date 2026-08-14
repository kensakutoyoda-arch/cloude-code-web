// weapons.js — 自機/オプションの弾（通常/ダブル/レーザー/ミサイル）と敵弾
// 当たり判定は全て AABB（x,y は中心、w,h は全幅/全高）で統一する。

(function () {
  "use strict";
  const G = window.G;
  const COL = G.C.COL;
  const U = G.util;

  // 通常弾（前方へ直進）
  class Pellet {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.w = 16;
      this.h = 5;
      this.vx = 720;
      this.vy = 0;
      this.damage = 1;
      this.pierce = false;
      this.dead = false;
      this.color = COL.cyan;
    }
    update(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      if (this.x > G.C.W + 30) this.dead = true;
    }
    draw(ctx) {
      U.glow(ctx, this.color, 10, (c) => {
        c.fillRect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
      });
    }
  }

  // ダブルの斜め上弾
  class DoubleShot {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.w = 10;
      this.h = 10;
      this.vx = 560;
      this.vy = -560;
      this.damage = 1;
      this.pierce = false;
      this.dead = false;
      this.color = COL.cyan;
    }
    update(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      if (this.x > G.C.W + 30 || this.y < -30) this.dead = true;
    }
    draw(ctx) {
      U.glowCircle(ctx, this.x, this.y, 5, this.color, 10);
    }
  }

  // レーザー（貫通する長いビーム）
  class Laser {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.w = 60;
      this.h = 7;
      this.vx = 1050;
      this.vy = 0;
      this.damage = 1; // フレーム毎に貫通ヒット
      this.pierce = true;
      this.dead = false;
      this.color = COL.white;
      this._hit = new Set(); // 多重ヒット防止（対象ごと一定間隔）
      this.hitCooldown = new Map();
    }
    update(dt) {
      this.x += this.vx * dt;
      if (this.x - this.w / 2 > G.C.W + 30) this.dead = true;
    }
    draw(ctx) {
      ctx.save();
      ctx.shadowColor = COL.cyan;
      ctx.shadowBlur = 16;
      const grad = ctx.createLinearGradient(
        this.x - this.w / 2,
        0,
        this.x + this.w / 2,
        0
      );
      grad.addColorStop(0, "rgba(56,246,255,0.1)");
      grad.addColorStop(0.5, COL.white);
      grad.addColorStop(1, "rgba(56,246,255,0.1)");
      ctx.fillStyle = grad;
      ctx.fillRect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
      ctx.restore();
    }
  }

  // ミサイル（斜め下に落ちて底面を這う）
  class Missile {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.w = 14;
      this.h = 8;
      this.vx = 280;
      this.vy = 120;
      this.damage = 1;
      this.pierce = false;
      this.dead = false;
      this.color = COL.orange;
      this.crawling = false;
    }
    update(dt) {
      const floor = G.C.H - 14;
      if (!this.crawling) {
        this.vy += 900 * dt; // 落下
        this.y += this.vy * dt;
        this.x += this.vx * dt;
        if (this.y >= floor) {
          this.y = floor;
          this.crawling = true;
          this.vx = 460;
          this.vy = 0;
        }
      } else {
        this.x += this.vx * dt; // 地を這う
      }
      if (this.x > G.C.W + 30) this.dead = true;
    }
    draw(ctx) {
      U.glow(ctx, this.color, 10, (c) => {
        c.beginPath();
        c.moveTo(this.x + 8, this.y);
        c.lineTo(this.x - 6, this.y - 4);
        c.lineTo(this.x - 6, this.y + 4);
        c.closePath();
        c.fill();
      });
    }
  }

  // 敵弾
  class EnemyBullet {
    constructor(x, y, vx, vy, color = COL.mag, size = 8) {
      this.x = x;
      this.y = y;
      this.w = size;
      this.h = size;
      this.r = size / 2;
      this.vx = vx;
      this.vy = vy;
      this.dead = false;
      this.color = color;
    }
    update(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      if (
        this.x < -20 ||
        this.x > G.C.W + 20 ||
        this.y < -20 ||
        this.y > G.C.H + 20
      )
        this.dead = true;
    }
    draw(ctx) {
      U.glowCircle(ctx, this.x, this.y, this.r, this.color, 10);
    }
  }

  // 発射ロジック：武器状態に応じて弾を生成し配列へ push
  // state: { double, laser, missile }
  function playerFire(shots, x, y, state, isOption) {
    if (state.laser) {
      shots.push(new Laser(x + 30, y));
    } else {
      shots.push(new Pellet(x + 16, y));
      if (state.double) shots.push(new DoubleShot(x + 12, y - 6));
    }
    // ミサイルは本体のみ（オプションからは出さない＝過剰連射防止）
    if (state.missile && !isOption) {
      shots.push(new Missile(x + 6, y + 8));
    }
  }

  G.Weapons = {
    Pellet,
    DoubleShot,
    Laser,
    Missile,
    EnemyBullet,
    playerFire,
  };
})();
