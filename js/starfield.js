// starfield.js — SFC風の多重スクロール背景
// グリッドに揃えた星 ＋ ディザ縞の惑星 ＋ 画面下部のスクロール地形帯。

(function () {
  "use strict";
  const G = window.G;
  const { W, H, PX } = G.C;
  const U = G.util;

  function makeLayer(count, speed, size, color) {
    const stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({ x: U.rand(0, W), y: U.rand(0, H) });
    }
    return { stars, speed, size, color };
  }

  class Starfield {
    constructor() {
      // 3層パララックス（奥ほど暗く小さく遅い）
      this.layers = [
        makeLayer(60, 30, PX, "#2a3b6b"),
        makeLayer(40, 70, PX, "#4f6cc0"),
        makeLayer(24, 130, PX * 2, "#a9c6ff"),
      ];
      // 惑星（低速視差の大ドット絵）
      this.planets = [
        { name: "planetBlue", x: W * 0.7, y: 130, speed: 12 },
        { name: "planetOrange", x: W * 1.25, y: 420, speed: 20 },
      ];
      // 地形帯スクロール量
      this.terrainX = 0;
      this.terrainSpeed = 90;
    }

    update(dt) {
      for (const layer of this.layers) {
        for (const s of layer.stars) {
          s.x -= layer.speed * dt;
          if (s.x < 0) {
            s.x = W + U.rand(0, 20);
            s.y = U.rand(0, H);
          }
        }
      }
      for (const p of this.planets) {
        p.x -= p.speed * dt;
        const spr = G.Sprites.get(p.name);
        const half = spr ? spr.width / 2 : 40;
        if (p.x < -half) {
          p.x = W + half + U.rand(0, 200);
          p.y = U.rand(80, H - 160);
        }
      }
      this.terrainX -= this.terrainSpeed * dt;
      const tile = G.Sprites.get("terrain");
      if (tile && this.terrainX <= -tile.width) this.terrainX += tile.width;
    }

    draw(ctx) {
      // 惑星（最奥）
      for (const p of this.planets) {
        G.Sprites.blit(ctx, p.name, p.x, p.y);
      }
      // 星（ドットグリッドに揃える）
      for (const layer of this.layers) {
        ctx.fillStyle = layer.color;
        for (const s of layer.stars) {
          ctx.fillRect(U.snap(s.x), U.snap(s.y), layer.size, layer.size);
        }
      }
      // 地形帯（最下部・ミサイルが這う床の視覚表現）
      const tile = G.Sprites.get("terrain");
      if (tile) {
        const y = H - tile.height;
        for (let x = this.terrainX; x < W; x += tile.width) {
          G.Sprites.blitAt(ctx, "terrain", x, y);
        }
      }
    }
  }

  G.Starfield = Starfield;
})();
