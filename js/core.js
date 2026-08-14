// core.js — グローバル名前空間 G、定数、共通ユーティリティ
// 各ファイルは window.G を共有する（classic script 読み込み）。

(function () {
  "use strict";

  const G = (window.G = window.G || {});

  // ---- 定数 -------------------------------------------------------------
  G.C = {
    W: 800, // 論理キャンバス幅
    H: 600, // 論理キャンバス高さ
    PLAYER_START_LIVES: 3,

    // パワーアップバーのスロット順（グラディウス準拠）
    POWER_SLOTS: ["SPEED", "MISSILE", "DOUBLE", "LASER", "OPTION", "SHIELD"],
    POWER_LABELS: {
      SPEED: "SPEED",
      MISSILE: "MISSILE",
      DOUBLE: "DOUBLE",
      LASER: "LASER",
      OPTION: "OPTION",
      SHIELD: "SHIELD",
    },

    MAX_SPEED_LEVEL: 5,
    MAX_OPTIONS: 4,

    // 色（ネオレトロ）
    COL: {
      cyan: "#38f6ff",
      mag: "#ff3cc7",
      yellow: "#ffe14d",
      green: "#6bff8f",
      orange: "#ff8a3c",
      red: "#ff4d5e",
      white: "#eaffff",
      purple: "#b06bff",
    },
  };

  // ---- ユーティリティ ---------------------------------------------------
  const U = (G.util = {});

  U.clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
  U.rand = (a, b) => a + Math.random() * (b - a);
  U.randInt = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  U.choice = (arr) => arr[Math.floor(Math.random() * arr.length)];
  U.dist2 = (ax, ay, bx, by) => {
    const dx = ax - bx,
      dy = ay - by;
    return dx * dx + dy * dy;
  };

  // 円 vs 円（半径ベースの当たり判定）
  U.hitCircle = (a, b) => {
    const r = (a.r || 0) + (b.r || 0);
    return U.dist2(a.x, a.y, b.x, b.y) <= r * r;
  };

  // 軸並行矩形の当たり判定（x,y は中心、w,h は全幅/全高）
  U.hitRect = (a, b) => {
    return (
      Math.abs(a.x - b.x) * 2 < a.w + b.w &&
      Math.abs(a.y - b.y) * 2 < a.h + b.h
    );
  };

  // 発光つき円を描く
  U.glowCircle = (ctx, x, y, r, color, blur = 12) => {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // 発光つきの塗り（任意のパス描画コールバック）
  U.glow = (ctx, color, blur, drawFn) => {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    drawFn(ctx);
    ctx.restore();
  };

  // ネオン調テキスト
  U.text = (ctx, str, x, y, opts = {}) => {
    const {
      size = 18,
      color = G.C.COL.cyan,
      align = "left",
      blur = 8,
      weight = "bold",
      alpha = 1,
    } = opts;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `${weight} ${size}px "Courier New", monospace`;
    ctx.textAlign = align;
    ctx.textBaseline = "alphabetic";
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.fillStyle = color;
    ctx.fillText(str, x, y);
    ctx.restore();
  };
})();
