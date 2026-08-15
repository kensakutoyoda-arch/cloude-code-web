// options.js — オプション（マルチプル）：自機の軌跡を追従する分身
// 自機が撃つと同時に同じ武器を発射する。最大 G.C.MAX_OPTIONS 個。

(function () {
  "use strict";
  const G = window.G;
  const COL = G.C.COL;
  const U = G.util;

  const TRAIL_SPACING = 9; // 各オプション間の軌跡サンプル間隔（フレーム相当）

  class OptionManager {
    constructor() {
      this.units = []; // 各要素 { x, y }
      this.phase = 0; // 描画の明滅用
    }
    reset() {
      this.units.length = 0;
    }
    get count() {
      return this.units.length;
    }
    addOne() {
      if (this.units.length >= G.C.MAX_OPTIONS) return false;
      this.units.push({ x: -50, y: -50 });
      return true;
    }
    // trail: 自機の過去位置（index0 が最新）
    update(dt, trail) {
      this.phase += dt * 6;
      for (let i = 0; i < this.units.length; i++) {
        const idx = Math.min(trail.length - 1, (i + 1) * TRAIL_SPACING);
        const p = trail[idx];
        if (p) {
          this.units[i].x = p.x;
          this.units[i].y = p.y;
        }
      }
    }
    // 自機発射に同期して各オプションからも発射
    fire(shots, weaponState) {
      for (const u of this.units) {
        G.Weapons.playerFire(shots, u.x, u.y, weaponState, true);
      }
    }
    draw(ctx) {
      const frame = Math.floor(this.phase * 2) % 2;
      for (const u of this.units) {
        G.Sprites.blit(ctx, frame === 0 ? "option0" : "option1", u.x, u.y);
      }
    }
  }

  G.OptionManager = OptionManager;
})();
