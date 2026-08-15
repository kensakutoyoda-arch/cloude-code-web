// powerup.js — パワーアップバーの状態機械（グラディウス方式）
// カプセル取得でカーソルが1つ進み、強化キーでカーソル位置の強化を自機へ適用する。

(function () {
  "use strict";
  const G = window.G;
  const C = G.C;
  const COL = C.COL;
  const U = G.util;

  class PowerBar {
    constructor() {
      this.slots = C.POWER_SLOTS.slice();
      this.cursor = -1; // -1 = 未選択（カプセル未取得）
      this.flash = 0; // 適用時のフラッシュ演出
    }
    reset() {
      this.cursor = -1;
      this.flash = 0;
    }
    // カプセル取得：カーソルを1つ進める（末尾で先頭へ）
    gainCapsule() {
      this.cursor = this.cursor + 1;
      if (this.cursor >= this.slots.length) this.cursor = 0;
      G.audio.capsule();
    }
    // 強化キー押下：現在のスロットを自機へ適用
    apply(player) {
      if (this.cursor < 0) return false;
      const slot = this.slots[this.cursor];
      let ok = true;
      switch (slot) {
        case "SPEED":
          if (player.speedLevel < C.MAX_SPEED_LEVEL) player.speedLevel++;
          break;
        case "MISSILE":
          player.hasMissile = true;
          break;
        case "DOUBLE":
          player.hasDouble = true;
          player.hasLaser = false; // レーザーと排他
          break;
        case "LASER":
          player.hasLaser = true;
          player.hasDouble = false; // ダブルと排他
          break;
        case "OPTION":
          ok = player.options.addOne();
          break;
        case "SHIELD":
          player.shieldHp = 4; // 数発ぶんの耐久
          break;
      }
      this.cursor = -1;
      this.flash = 0.25;
      G.audio.powerup();
      return ok;
    }
    update(dt) {
      if (this.flash > 0) this.flash -= dt;
    }
    // 画面下部にバーを描画（SFC風フラットUI）
    draw(ctx, player) {
      const PX = C.PX;
      const n = this.slots.length;
      const cellW = 108;
      const gap = 6;
      const totalW = n * cellW + (n - 1) * gap;
      const x0 = U.snap((C.W - totalW) / 2);
      const y = U.snap(C.H - 40);
      const h = 27;

      for (let i = 0; i < n; i++) {
        const x = U.snap(x0 + i * (cellW + gap));
        const active = i === this.cursor;

        ctx.save();
        // セル（ベタ塗り＋ドット枠）
        ctx.fillStyle = active ? COL.yellow : COL.uiBlue;
        ctx.fillRect(x, y, cellW, h);
        ctx.fillStyle = active ? COL.white : COL.uiBorder;
        ctx.fillRect(x, y, cellW, PX); // 上
        ctx.fillRect(x, y + h - PX, cellW, PX); // 下
        ctx.fillRect(x, y, PX, h); // 左
        ctx.fillRect(x + cellW - PX, y, PX, h); // 右
        ctx.restore();

        // ラベル（ドット文字。選択中は黒文字）
        U.pxText(ctx, this.slots[i], x + cellW / 2, y + 6, {
          size: 9,
          color: active ? "#181c24" : "#8fb8d8",
          align: "center",
        });

        // 取得状況インジケータ（点灯 = 所持/レベル）
        const lit = this._litLevel(this.slots[i], player);
        if (lit > 0) {
          ctx.save();
          ctx.fillStyle = COL.green;
          for (let k = 0; k < lit; k++) {
            ctx.fillRect(x + PX * 2 + k * PX * 3, y + h - PX * 2, PX * 2, PX);
          }
          ctx.restore();
        }
      }
    }
    _litLevel(slot, p) {
      switch (slot) {
        case "SPEED":
          return p.speedLevel;
        case "MISSILE":
          return p.hasMissile ? 1 : 0;
        case "DOUBLE":
          return p.hasDouble ? 1 : 0;
        case "LASER":
          return p.hasLaser ? 1 : 0;
        case "OPTION":
          return p.options.count;
        case "SHIELD":
          return p.shieldHp > 0 ? Math.ceil(p.shieldHp / 2) : 0;
      }
      return 0;
    }
  }

  G.PowerBar = PowerBar;
})();
