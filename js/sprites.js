// sprites.js — SFC風ドット絵スプライトライブラリ
// 文字列アート（1文字=1ドット）を起動時にオフスクリーン canvas へ焼き込み、
// drawImage でブリットする。1ドット = PX×PX 画面ピクセル。発光は使わない。

(function () {
  "use strict";
  const G = window.G;
  const PX = G.C.PX;
  const snap = G.util.snap;

  // ---- 共通カラー ------------------------------------------------------
  const C = {
    W: "#f8f8f8", // 白
    w: "#b8c0c8", // 明グレー
    l: "#888f98", // 中グレー
    d: "#4a505a", // 暗グレー
    k: "#181c24", // ほぼ黒
    B: "#3878f8", // 青（キャノピー）
    b: "#1c3878", // 暗青
    C: "#40d8f0", // シアン
    c: "#1878a0", // 暗シアン
    R: "#f04858", // 赤
    r: "#982838", // 暗赤
    O: "#f89020", // 橙
    o: "#b85010", // 暗橙
    Y: "#f8d838", // 黄
    y: "#b09018", // 暗黄
    G: "#58d858", // 緑
    g: "#288828", // 暗緑
    M: "#e858c8", // マゼンタ
    m: "#903078", // 暗マゼンタ
    P: "#9868e8", // 紫
    p: "#583898", // 暗紫
  };

  // ---- スプライトビルダー ---------------------------------------------
  // rows: 文字列配列（'.' と ' ' は透明）、pal: {文字: 色}
  function makeSprite(rows, pal) {
    const h = rows.length;
    let w = 0;
    for (const r of rows) w = Math.max(w, r.length);
    const cv = document.createElement("canvas");
    cv.width = w * PX;
    cv.height = h * PX;
    const g = cv.getContext("2d");
    for (let y = 0; y < h; y++) {
      const row = rows[y];
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (ch === "." || ch === " ") continue;
        const col = pal[ch];
        if (!col) continue;
        g.fillStyle = col;
        g.fillRect(x * PX, y * PX, PX, PX);
      }
    }
    return cv;
  }

  // パレット差し替え（例: 赤バージョンの敵）
  function swapPal(pal, swaps) {
    const out = Object.assign({}, pal);
    for (const k in swaps) out[k] = swaps[k];
    return out;
  }

  // 全色を白に（被弾フラッシュ用）
  function whitePal(pal) {
    const out = {};
    for (const k in pal) out[k] = C.W;
    return out;
  }

  const SP = {}; // name -> canvas

  // ---- 自機 Vic Viper 風（24×12） -------------------------------------
  const SHIP_PAL = { W: C.W, w: C.w, l: C.l, d: C.d, B: C.B, b: C.b, R: C.R };
  const SHIP_ROWS = [
    "........................",
    "..........ddd...........",
    ".........dwwld..........",
    "....dddddwwBBld.........",
    "..ddwwwwwwwBBbldd.......",
    ".dwwlllllllllllldddd....",
    "dwlRRRRRRRRlllllllllwWWW",
    ".dwllllllllllllllldddd..",
    "...ddlllllllllllldd.....",
    "......ddddwwlldd........",
    ".........dwld...........",
    "..........d.............",
  ];
  SP.ship = makeSprite(SHIP_ROWS, SHIP_PAL);
  SP.shipWhite = makeSprite(SHIP_ROWS, whitePal(SHIP_PAL));
  // 残機アイコン（小型 10×5）
  SP.lifeIcon = makeSprite(
    ["....dd....", ".ddwwld...", "dwllllllWW", ".ddwwld...", "....dd...."],
    SHIP_PAL
  );

  // エンジン炎（2フレーム）
  const FLAME_PAL = { O: C.O, Y: C.Y, o: C.o };
  SP.flame0 = makeSprite(["..OY", "OYYY", "..OY"], FLAME_PAL);
  SP.flame1 = makeSprite(["..oO", ".OYY", "..oO"], FLAME_PAL);

  // シールド（前方アーク 5×17、2フレーム）
  SP.shield0 = makeSprite(
    [
      "...BB",
      "..BW.",
      ".BW..",
      ".BW..",
      "BW...",
      "BW...",
      "BW...",
      "BW...",
      "BW...",
      "BW...",
      "BW...",
      "BW...",
      "BW...",
      ".BW..",
      ".BW..",
      "..BW.",
      "...BB",
    ],
    { B: C.B, W: C.W }
  );
  SP.shield1 = makeSprite(
    [
      "...bB",
      "..Bb.",
      ".Bb..",
      ".Bb..",
      "Bb...",
      "Bb...",
      "Bb...",
      "Bb...",
      "Bb...",
      "Bb...",
      "Bb...",
      "Bb...",
      "Bb...",
      ".Bb..",
      ".Bb..",
      "..Bb.",
      "...bB",
    ],
    { B: C.B, b: C.b }
  );

  // ---- 雑魚敵（12×9、A=メイン a=暗 W=白） -----------------------------
  const ZAKO_ROWS = [
    "a.....aa....",
    "aa..aaAAa...",
    "aAaaAAAAAa..",
    ".aAAWWAAAAa.",
    "aAAWWWWAAAAa",
    ".aAAWWAAAAa.",
    "aAaaAAAAAa..",
    "aa..aaAAa...",
    "a.....aa....",
  ];
  SP.zakoCyan = makeSprite(ZAKO_ROWS, { A: C.C, a: C.c, W: C.W });
  SP.zakoMag = makeSprite(ZAKO_ROWS, { A: C.M, a: C.m, W: C.W });
  SP.zakoRed = makeSprite(ZAKO_ROWS, { A: C.R, a: C.r, W: C.Y });

  // 追尾機（10×10 球型）
  const TRACKER_ROWS = [
    "...gggg...",
    "..gGGGGg..",
    ".gGGGGGGg.",
    "gGGGkkGGGg",
    "gGGkkkkGGg",
    "gGGkkkkGGg",
    "gGGGkkGGGg",
    ".gGGGGGGg.",
    "..gGGGGg..",
    "...gggg...",
  ];
  SP.tracker = makeSprite(TRACKER_ROWS, { G: C.G, g: C.g, k: C.k });
  SP.trackerRed = makeSprite(TRACKER_ROWS, { G: C.R, g: C.r, k: C.k });

  // 砲台（14×9、砲身は左向き）
  const TURRET_ROWS = [
    "......pppppp..",
    "....ppPPPPPPp.",
    ".lllpPPkkPPPp.",
    "llllpPkWWkPPp.",
    "llllpPkWWkPPp.",
    ".lllpPPkkPPPp.",
    "....ppPPPPPPp.",
    "......pppppp..",
    ".....dddddddd.",
  ];
  const TURRET_PAL = { P: C.P, p: C.p, l: C.l, d: C.d, k: C.k, W: C.W };
  SP.turret = makeSprite(TURRET_ROWS, TURRET_PAL);
  SP.turretRed = makeSprite(
    TURRET_ROWS,
    swapPal(TURRET_PAL, { P: C.R, p: C.r })
  );

  // ---- パワーカプセル（8×7、点滅2フレーム） ---------------------------
  const CAP_ROWS = [
    ".rRRRRr.",
    "rRRWWRRr",
    "RRRWRWRR",
    "RRRWWRRR",
    "RRRWRRRR",
    "rRRWRRRr",
    ".rRRRRr.",
  ];
  SP.capsule0 = makeSprite(CAP_ROWS, { R: C.R, r: C.r, W: C.W });
  SP.capsule1 = makeSprite(CAP_ROWS, { R: C.O, r: C.o, W: C.W });

  // ---- 弾 --------------------------------------------------------------
  SP.pellet = makeSprite(["YWWWWW", "YWWWWW"], { W: C.W, Y: C.Y });
  SP.double = makeSprite([".WW.", "WCCW", "WCCW", ".WW."], { W: C.W, C: C.C });
  SP.laser = makeSprite(
    [
      "cCCCCCCCCCCCCCCCCCCc",
      "WWWWWWWWWWWWWWWWWWWW",
      "cCCCCCCCCCCCCCCCCCCc",
    ],
    { W: C.W, C: C.C, c: C.c }
  );
  SP.missile = makeSprite(["..ddd.", "OOddlW", "..ddd."], {
    d: C.d,
    l: C.l,
    W: C.W,
    O: C.O,
  });
  SP.ebullet = makeSprite([".MM.", "MWWM", "MWWM", ".MM."], {
    M: C.M,
    W: C.W,
  });
  SP.ebulletY = makeSprite([".YY.", "YWWY", "YWWY", ".YY."], {
    Y: C.Y,
    W: C.W,
  });

  // ---- オプション（10×10、2フレーム） ---------------------------------
  SP.option0 = makeSprite(
    [
      "...oooo...",
      "..oOOOOo..",
      ".oOYYOOOo.",
      "oOYWWYOOOo",
      "oOYWWYOOOo",
      ".oOYYOOOo.",
      "..oOOOOo..",
      "...oooo...",
    ],
    { O: C.O, o: C.o, Y: C.Y, W: C.W }
  );
  SP.option1 = makeSprite(
    [
      "...oooo...",
      "..oOOOOo..",
      ".oOOOYYOo.",
      "oOOOYWWYOo",
      "oOOOYWWYOo",
      ".oOOOYYOo.",
      "..oOOOOo..",
      "...oooo...",
    ],
    { O: C.O, o: C.o, Y: C.Y, W: C.W }
  );

  // ---- 爆発アニメ（4フレーム） ----------------------------------------
  const EX_PAL = { W: C.W, Y: C.Y, O: C.O, o: C.o, l: C.l, d: C.d };
  SP.ex0 = makeSprite(
    ["..W..", ".WWW.", "WWWWW", ".WWW.", "..W.."],
    EX_PAL
  );
  SP.ex1 = makeSprite(
    [
      "...YY...",
      ".YYWWYY.",
      ".YWWWWY.",
      "YWWWWWWY",
      "YWWWWWWY",
      ".YWWWWY.",
      ".YYWWYY.",
      "...YY...",
    ],
    EX_PAL
  );
  SP.ex2 = makeSprite(
    [
      "..O.OOO..O..",
      ".OOYYYYYOO..",
      "OYYOOOOYYO..",
      "OYO....OYYO.",
      "OYO.....OYO.",
      "OYYO...OOYO.",
      ".OYYOOOYYO..",
      "..OOYYYOO...",
      "...OOOOO.O..",
    ],
    EX_PAL
  );
  SP.ex3 = makeSprite(
    [
      "..d..dd.....",
      ".dlld.dld...",
      "dl..ld..ld..",
      "d....d...d..",
      ".dl.ld..dl..",
      "..ddd..dd...",
    ],
    EX_PAL
  );

  // ---- ボス戦艦（コード生成 56×50） -----------------------------------
  // 紫グレー装甲・帯状の陰影・パネル継ぎ目・左舷にコアソケット。
  const BOSS_W = 56;
  const BOSS_H = 50;

  function bossRows(coreOpen) {
    // 空グリッド
    const g = [];
    for (let y = 0; y < BOSS_H; y++) g.push(new Array(BOSS_W).fill("."));
    const set = (x, y, ch) => {
      if (x >= 0 && x < BOSS_W && y >= 0 && y < BOSS_H) g[y][x] = ch;
    };

    // 陰影バンド（上=明 → 下=暗）
    const bandCh = (y) => (y < 14 ? "1" : y < 26 ? "2" : y < 38 ? "3" : "4");

    // 主船体（x16..49, y6..43）
    for (let y = 6; y <= 43; y++) {
      for (let x = 16; x <= 49; x++) set(x, y, bandCh(y));
    }
    // 船首（左へ尖る楔形）
    for (let y = 10; y <= 40; y++) {
      const ext = Math.floor(Math.abs(y - 25) * 0.9); // 中央ほど左へ
      for (let x = 2 + ext; x < 16; x++) set(x, y, bandCh(y));
    }
    // 上部構造物
    for (let y = 2; y < 6; y++) for (let x = 26; x <= 40; x++) set(x, y, "1");
    for (let y = 0; y < 2; y++) for (let x = 30; x <= 36; x++) set(x, y, "1");
    // 下部フィン
    for (let y = 44; y < 48; y++) for (let x = 28; x <= 44; x++) set(x, y, "4");
    // エンジンブロック（右端）
    for (let y = 12; y <= 38; y++) {
      for (let x = 50; x <= 54; x++) set(x, y, "e");
      if (y % 4 === 1) {
        set(52, y, "E");
        set(53, y, "E");
      }
    }
    // パネル継ぎ目（縦線）とリベット
    for (let x = 22; x <= 46; x += 8) {
      for (let y = 7; y <= 42; y++) set(x, y, "s");
      for (let y = 9; y <= 41; y += 6) set(x + 1, y, "v");
    }
    // 横方向のディザ（バンド境界を市松でなじませる）
    for (const by of [14, 26, 38]) {
      for (let x = 4; x < 50; x++) {
        if (g[by][x] !== "." && x % 2 === 0) set(x, by, bandCh(by - 1));
      }
    }
    // 砲塔の出っ張り（上下）
    for (let x = 20; x <= 24; x++) set(x, 5, "2");
    for (let x = 34; x <= 38; x++) set(x, 44, "3");

    // コアソケット（中心 dot(9,25)、半径7）
    const cx = 9,
      cy = 25,
      R = 7;
    for (let y = cy - R; y <= cy + R; y++) {
      for (let x = cx - R; x <= cx + R; x++) {
        const d2 = (x - cx) * (x - cx) + (y - cy) * (y - cy);
        if (d2 <= R * R) {
          if (d2 > (R - 2) * (R - 2)) set(x, y, "s"); // リング
          else set(x, y, coreOpen ? "k" : "h"); // 開=穴 / 閉=ハッチ
        }
      }
    }
    if (!coreOpen) {
      // ハッチのシャッター線
      for (let x = cx - R + 2; x <= cx + R - 2; x++) {
        set(x, cy - 2, "s");
        set(x, cy + 2, "s");
      }
    }
    return g.map((row) => row.join(""));
  }

  const BOSS_PAL = {
    1: "#9a8ac0", // 明
    2: "#7a68a8",
    3: "#584888",
    4: "#3c2f68", // 暗
    s: "#241a48", // 継ぎ目
    v: C.W, // リベット
    e: "#4a505a", // エンジン枠
    E: C.O, // エンジン光
    k: C.k, // コア穴
    h: "#6a6f78", // 閉ハッチ
  };
  SP.bossOpen = makeSprite(bossRows(true), BOSS_PAL);
  SP.bossClosed = makeSprite(bossRows(false), BOSS_PAL);
  SP.bossWhite = makeSprite(bossRows(true), whitePal(BOSS_PAL));

  // コア（12×12、開いた時に上へ重ねる。2フレーム明滅）
  SP.core0 = makeSprite(
    [
      "...rrrr...",
      "..rRRRRr..",
      ".rRRWWRRr.",
      "rRRWWWWRRr",
      "rRRWWWWRRr",
      ".rRRWWRRr.",
      "..rRRRRr..",
      "...rrrr...",
    ],
    { R: C.R, r: C.r, W: C.W }
  );
  SP.core1 = makeSprite(
    [
      "...rrrr...",
      "..rRRRRr..",
      ".rRRRRRRr.",
      "rRRRWWRRRr",
      "rRRRWWRRRr",
      ".rRRRRRRr.",
      "..rRRRRr..",
      "...rrrr...",
    ],
    { R: C.R, r: C.r, W: C.W }
  );

  // ---- 惑星（コード生成・帯＋ディザ） ---------------------------------
  function planetSprite(r, bands) {
    const size = r * 2 + 1;
    const rows = [];
    for (let y = 0; y < size; y++) {
      let row = "";
      for (let x = 0; x < size; x++) {
        const dx = x - r,
          dy = y - r;
        const d2 = dx * dx + dy * dy;
        if (d2 > r * r) {
          row += ".";
          continue;
        }
        // 横縞バンド＋境界の市松ディザ
        const t = y / size;
        let bi = Math.min(bands.length - 1, Math.floor(t * bands.length));
        const edge = t * bands.length - bi;
        if (edge < 0.18 && bi > 0 && (x + y) % 2 === 0) bi--;
        // 右下を暗く（陰）
        if (dx + dy > r * 0.9) bi = Math.min(bands.length - 1, bi + 1);
        row += String(bi);
      }
      rows.push(row);
    }
    const pal = {};
    bands.forEach((c2, i) => (pal[String(i)] = c2));
    return makeSprite(rows, pal);
  }
  SP.planetBlue = planetSprite(20, ["#5a78c8", "#46609e", "#344878", "#243254"]);
  SP.planetOrange = planetSprite(12, ["#c88a4a", "#a06a38", "#7a4c28", "#54321c"]);

  // ---- 地形タイル（32×10、岩肌） --------------------------------------
  function terrainTile() {
    const W = 32,
      H = 10;
    const top = [3, 2, 2, 1, 2, 3, 4, 4, 3, 2, 1, 1, 2, 3, 3, 4, 5, 4, 3, 3, 2, 2, 3, 4, 4, 3, 2, 2, 1, 2, 3, 3];
    const rows = [];
    for (let y = 0; y < H; y++) {
      let row = "";
      for (let x = 0; x < W; x++) {
        if (y < top[x]) {
          row += ".";
        } else if (y === top[x]) {
          row += "t"; // 稜線（明）
        } else {
          // 本体はディザで2色
          row += (x + y) % 2 === 0 ? "a" : (x * 3 + y) % 5 === 0 ? "c" : "b";
        }
      }
      rows.push(row);
    }
    return makeSprite(rows, {
      t: "#8a6a48",
      a: "#5a4430",
      b: "#463424",
      c: "#2e2218",
    });
  }
  SP.terrain = terrainTile();

  // ---- 公開 API --------------------------------------------------------
  G.Sprites = {
    get(name) {
      return SP[name];
    },
    // 中心座標指定でグリッドスナップしてブリット
    blit(ctx, name, cx, cy) {
      const s = SP[name];
      if (!s) return;
      ctx.drawImage(s, snap(cx - s.width / 2), snap(cy - s.height / 2));
    },
    // 整数倍スケール付きブリット（爆発の拡大などに）
    blitScaled(ctx, name, cx, cy, k) {
      const s = SP[name];
      if (!s) return;
      const w = s.width * k,
        h = s.height * k;
      ctx.drawImage(s, snap(cx - w / 2), snap(cy - h / 2), w, h);
    },
    // 左上座標指定（背景タイル用）
    blitAt(ctx, name, x, y) {
      const s = SP[name];
      if (!s) return;
      ctx.drawImage(s, snap(x), snap(y));
    },
  };
})();
