// player.js — 自機ビックバイパー：移動・発射・被弾・パワーアップ状態

(function () {
  "use strict";
  const G = window.G;
  const C = G.C;
  const COL = C.COL;
  const U = G.util;

  const BASE_SPEED = 155;
  const SPEED_PER_LEVEL = 55;
  const TRAIL_MAX = 64;

  class Player {
    constructor() {
      this.w = 34;
      this.h = 18;
      // 当たり判定は本体より小さめ（グラディウス風の小さいヒットボックス）
      this.hitW = 14;
      this.hitH = 10;
      this.reset(true);
    }

    // full=true で完全初期化（新規ゲーム）。false は残機復帰（パワーアップ喪失）。
    reset(full) {
      this.x = 120;
      this.y = C.H / 2;
      this.alive = true;
      this.invuln = 2.0; // 復帰直後の無敵
      this.fireCd = 0;
      this.animT = 0; // 描画アニメ用クロック（ロジックには不使用）
      this.trail = [];

      // パワーアップ状態はミス時に喪失する
      this.speedLevel = 0;
      this.hasDouble = false;
      this.hasLaser = false;
      this.hasMissile = false;
      this.shieldHp = 0;
      if (!this.options) this.options = new G.OptionManager();
      this.options.reset();

      if (full && this.powerBar) this.powerBar.reset();
    }

    get speed() {
      return BASE_SPEED + this.speedLevel * SPEED_PER_LEVEL;
    }

    weaponState() {
      return {
        double: this.hasDouble,
        laser: this.hasLaser,
        missile: this.hasMissile,
      };
    }

    update(dt, game) {
      const inp = G.input;
      this.animT += dt;
      if (this.invuln > 0) this.invuln -= dt;

      // 移動
      let dx = 0,
        dy = 0;
      if (inp.down("left")) dx -= 1;
      if (inp.down("right")) dx += 1;
      if (inp.down("up")) dy -= 1;
      if (inp.down("down")) dy += 1;
      if (dx !== 0 && dy !== 0) {
        const inv = 1 / Math.SQRT2;
        dx *= inv;
        dy *= inv;
      }
      this.x += dx * this.speed * dt;
      this.y += dy * this.speed * dt;
      // 画面内に制限（下部はバーぶん空ける）
      this.x = U.clamp(this.x, 20, C.W - 20);
      this.y = U.clamp(this.y, 16, C.H - 60);

      // 軌跡を記録（オプション追従用）
      this.trail.unshift({ x: this.x, y: this.y });
      if (this.trail.length > TRAIL_MAX) this.trail.pop();
      this.options.update(dt, this.trail);

      // 発射
      if (this.fireCd > 0) this.fireCd -= dt;
      if (inp.down("shot") && this.fireCd <= 0) {
        this.fire(game);
        this.fireCd = this.hasLaser ? 0.16 : 0.12;
      }
    }

    fire(game) {
      const st = this.weaponState();
      G.Weapons.playerFire(game.playerShots, this.x, this.y, st, false);
      this.options.fire(game.playerShots, st);
      if (st.laser) G.audio.laser();
      else G.audio.shot();
      if (st.missile) G.audio.missile();
    }

    // 被弾処理。無敵/シールドを考慮し、実際にミスしたら true を返す。
    onHit() {
      if (this.invuln > 0) return false;
      if (this.shieldHp > 0) {
        this.shieldHp--;
        G.audio.hitEnemy();
        return false;
      }
      return true; // ミス確定
    }

    hitbox() {
      return { x: this.x, y: this.y, w: this.hitW, h: this.hitH };
    }

    draw(ctx) {
      // 復帰直後は点滅
      if (this.invuln > 0 && Math.floor(this.invuln * 12) % 2 === 0) return;

      const x = this.x,
        y = this.y;
      const frame = Math.floor(this.animT * 14) % 2;

      // シールド（前方アーク・2フレーム明滅）
      if (this.shieldHp > 0) {
        G.Sprites.blit(ctx, frame === 0 ? "shield0" : "shield1", x + 32, y);
      }

      // エンジン炎（機体の後方、2フレーム）
      G.Sprites.blit(ctx, frame === 0 ? "flame0" : "flame1", x - 40, y);

      // 機体スプライト
      G.Sprites.blit(ctx, "ship", x, y);
    }
  }

  G.Player = Player;
})();
