// stage.js — 時間軸ウェーブスクリプト、WARNING 演出、ボス出現制御
// 敵は画面右外（x = W+30〜）から連なって出現する。

(function () {
  "use strict";
  const G = window.G;
  const C = G.C;

  const SPAWN_X = C.W + 30;

  // 敵ストリームを生成（i 番目を off-screen で少しずつ右にずらして連なりを作る）
  function stream(game, type, count, y, opts = {}) {
    const spacing = opts.spacing || 46;
    const redIndex = opts.redIndex; // 指定 index を赤（カプセル持ち）に
    for (let i = 0; i < count; i++) {
      game.enemies.push(
        new G.Enemy({
          type,
          x: SPAWN_X + i * spacing,
          y,
          baseY: y,
          amp: opts.amp || 60,
          freq: opts.freq || 2.2,
          speed: opts.speed || 150,
          hp: opts.hp,
          isRed: redIndex != null && i === redIndex,
        })
      );
    }
  }

  class Stage {
    constructor() {
      this.t = 0;
      this.idx = 0;
      this.warningTimer = 0;
      this.bossSpawned = false;
      this.cleared = false;

      const H = C.H;
      // { t: 出現時刻, fn: (game) => void }
      this.script = [
        { t: 1.5, fn: (g) => stream(g, "straight", 5, 150, { redIndex: 2 }) },
        { t: 4.0, fn: (g) => stream(g, "straight", 5, 420) },
        { t: 6.5, fn: (g) => stream(g, "sine", 6, 200, { amp: 90, redIndex: 5 }) },
        { t: 10.0, fn: (g) => stream(g, "tracker", 4, 120, { speed: 130 }) },
        { t: 10.5, fn: (g) => stream(g, "tracker", 4, 470, { speed: 130 }) },
        { t: 14.0, fn: (g) => stream(g, "straight", 6, 300, { redIndex: 0 }) },
        { t: 17.5, fn: (g) => stream(g, "turret", 1, 250, {}) },
        { t: 18.0, fn: (g) => stream(g, "straight", 4, 400) },
        { t: 21.5, fn: (g) => stream(g, "sine", 7, 300, { amp: 130, redIndex: 3 }) },
        { t: 25.5, fn: (g) => stream(g, "tracker", 6, 90, { speed: 150 }) },
        { t: 29.0, fn: (g) => stream(g, "turret", 1, 160, {}) },
        { t: 29.4, fn: (g) => stream(g, "turret", 1, 440, {}) },
        { t: 33.0, fn: (g) => stream(g, "straight", 6, 220, { redIndex: 5, speed: 180 }) },
        { t: 33.5, fn: (g) => stream(g, "straight", 6, 380, { speed: 180 }) },
        { t: 37.5, fn: (g) => stream(g, "sine", 8, 300, { amp: 140, freq: 2.6, redIndex: 4 }) },
        { t: 41.0, fn: (g) => stream(g, "tracker", 5, 300, { speed: 160 }) },
        { t: 41.5, fn: (g) => stream(g, "turret", 1, 300, { hp: 8 }) },
        { t: 45.0, fn: (g) => stream(g, "straight", 8, 180, { redIndex: 7, speed: 200 }) },
        { t: 45.5, fn: (g) => stream(g, "straight", 8, 460, { speed: 200 }) },
      ];
      this.lastWaveT = 48.0;
      this.warnAt = 49.0;
      this.bossAt = 52.0;
    }

    reset() {
      this.t = 0;
      this.idx = 0;
      this.warningTimer = 0;
      this.bossSpawned = false;
      this.cleared = false;
    }

    get warningActive() {
      return this.t >= this.warnAt && this.t < this.bossAt && !this.bossSpawned;
    }

    update(dt, game) {
      if (this.cleared) return;
      this.t += dt;

      // 予定ウェーブの消化
      while (this.idx < this.script.length && this.t >= this.script[this.idx].t) {
        this.script[this.idx].fn(game);
        this.idx++;
      }

      // WARNING 開始時に効果音
      if (this.t >= this.warnAt && !this._warned) {
        this._warned = true;
        G.audio.laser();
      }

      // ボス出現
      if (!this.bossSpawned && this.t >= this.bossAt) {
        this.bossSpawned = true;
        game.boss = new G.Boss();
        G.audio.bigExplode();
      }
    }
  }

  G.Stage = Stage;
})();
