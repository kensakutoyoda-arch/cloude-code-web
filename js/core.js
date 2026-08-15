// core.js — グローバル名前空間 G、定数、共通ユーティリティ
// 各ファイルは window.G を共有する（classic script 読み込み）。

(function () {
  "use strict";

  const G = (window.G = window.G || {});

  // ---- 定数 -------------------------------------------------------------
  G.C = {
    W: 800, // 論理キャンバス幅
    H: 600, // 論理キャンバス高さ
    PX: 2, // 1ドットの画面ピクセル数（SFC風ドット絵の粒度）
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

    // 色（SFC風フラットパレット）
    COL: {
      cyan: "#40d8f0",
      mag: "#e858c8",
      yellow: "#f8d838",
      green: "#58d858",
      orange: "#f89020",
      red: "#f04858",
      white: "#f8f8f8",
      purple: "#9868e8",
      uiBlue: "#12244a",
      uiBorder: "#6a7a9a",
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

  // ドットグリッドへスナップ（SFC風の粒度を保つ）
  U.snap = (v) => Math.round(v / G.C.PX) * G.C.PX;

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

  // ---- ドット文字（低解像度で描いて拡大ブリット） ----------------------
  // 小さなオフスクリーン canvas に size px のフォントで描き、
  // smoothing off で PX 倍に拡大して「ドットフォント」化する。
  // 座標は (x, y) = 左上基準。align: left | center | right。
  let _tc = null,
    _tg = null;
  U.pxText = (ctx, str, x, y, opts = {}) => {
    const {
      size = 8,
      color = G.C.COL.white,
      align = "left",
      alpha = 1,
      shadow = null, // 影色（SFCロゴ風の2色抜き用）
    } = opts;
    if (!_tc) {
      _tc = document.createElement("canvas");
      _tg = _tc.getContext("2d");
    }
    const font = `bold ${size}px "Courier New", monospace`;
    _tg.font = font;
    const w = Math.ceil(_tg.measureText(str).width) + 2;
    const h = Math.ceil(size * 1.5);
    if (_tc.width < w || _tc.height < h) {
      _tc.width = Math.max(w, _tc.width);
      _tc.height = Math.max(h, _tc.height);
      _tg.font = font; // resize でリセットされるため再設定
    }
    _tg.clearRect(0, 0, _tc.width, _tc.height);
    _tg.textBaseline = "top";
    _tg.fillStyle = color;
    _tg.fillText(str, 1, 1);

    const PX = G.C.PX;
    let dx = x;
    if (align === "center") dx = x - (w * PX) / 2;
    else if (align === "right") dx = x - w * PX;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = false;
    if (shadow) {
      // 先に影を1ドットずらして焼く
      const sc = _tg.fillStyle;
      _tg.clearRect(0, 0, _tc.width, _tc.height);
      _tg.fillStyle = shadow;
      _tg.fillText(str, 1, 1);
      ctx.drawImage(_tc, 0, 0, w, h, U.snap(dx) + PX, U.snap(y) + PX, w * PX, h * PX);
      _tg.clearRect(0, 0, _tc.width, _tc.height);
      _tg.fillStyle = sc;
      _tg.fillStyle = color;
      _tg.fillText(str, 1, 1);
    }
    ctx.drawImage(_tc, 0, 0, w, h, U.snap(dx), U.snap(y), w * PX, h * PX);
    ctx.restore();
  };
})();
