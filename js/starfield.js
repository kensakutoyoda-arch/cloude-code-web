// starfield.js — 多層パララックス星背景（ネオレトロ）

(function () {
  "use strict";
  const G = window.G;
  const { W, H } = G.C;
  const U = G.util;

  function makeLayer(count, speed, size, color) {
    const stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({ x: U.rand(0, W), y: U.rand(0, H), t: U.rand(0, 1) });
    }
    return { stars, speed, size, color };
  }

  class Starfield {
    constructor() {
      this.layers = [
        makeLayer(60, 30, 1, "#2a3b6b"),
        makeLayer(40, 70, 1.5, "#4f6cc0"),
        makeLayer(24, 130, 2, "#a9c6ff"),
      ];
      // 遠景の淡い星雲ブロック
      this.nebula = [];
      for (let i = 0; i < 5; i++) {
        this.nebula.push({
          x: U.rand(0, W),
          y: U.rand(0, H),
          r: U.rand(80, 180),
          hue: U.choice([200, 280, 320]),
          speed: U.rand(8, 18),
        });
      }
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
      for (const n of this.nebula) {
        n.x -= n.speed * dt;
        if (n.x < -n.r) {
          n.x = W + n.r;
          n.y = U.rand(0, H);
        }
      }
    }

    draw(ctx) {
      // 星雲
      for (const n of this.nebula) {
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        grad.addColorStop(0, `hsla(${n.hue}, 70%, 55%, 0.10)`);
        grad.addColorStop(1, "hsla(0,0%,0%,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      // 星
      for (const layer of this.layers) {
        ctx.fillStyle = layer.color;
        for (const s of layer.stars) {
          ctx.fillRect(s.x, s.y, layer.size, layer.size);
        }
      }
    }
  }

  G.Starfield = Starfield;
})();
