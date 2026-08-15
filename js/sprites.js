// sprites.js — SFC風ドット絵スプライトライブラリ
// 文字列アート（1文字=1ドット）を起動時にオフスクリーン canvas へ焼き込み、
// drawImage でブリットする。1ドット = PX×PX 画面ピクセル。
// SFC実機の流儀: 黒アウトライン＋金属的な多階調シェーディング＋差し色。

(function () {
  "use strict";
  const G = window.G;
  const PX = G.C.PX;
  const snap = G.util.snap;

  // ---- 共通カラー ------------------------------------------------------
  const C = {
    K: "#10141c", // アウトライン黒
    W: "#f8f8f8", // 白
    w: "#c8d0d8", // 明グレー
    l: "#98a0ac", // 中グレー
    e: "#687080", // やや暗グレー
    d: "#3c4250", // 暗グレー
    B: "#3878f8", // 青
    b: "#1c3878", // 暗青
    C: "#78d8f8", // 明シアン（ガラス）
    c: "#2890c0", // 暗シアン
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
    P: "#9878d8", // 紫
    p: "#584898", // 暗紫
  };

  // ---- スプライトビルダー ---------------------------------------------
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

  function swapPal(pal, swaps) {
    const out = Object.assign({}, pal);
    for (const k in swaps) out[k] = swaps[k];
    return out;
  }

  function whitePal(pal) {
    const out = {};
    for (const k in pal) out[k] = C.W;
    return out;
  }

  const SP = {};

  // ---- 自機 Vic Viper 風（38×17） -------------------------------------
  // 白い機体・青キャノピー・赤ストライプ・上下スタビライザー・黒アウトライン
  const SHIP_PAL = {
    k: C.K, W: C.W, w: C.w, l: C.l, d: C.d,
    C: C.C, c: C.c, b: C.b, R: C.R, O: C.O,
  };
  const SHIP_ROWS = [
    "........kk............................",
    "........kwk...........................",
    "........kwlwk....kkkk.................",
    "........kwllwk.kkCCCCkk...............",
    "......kkwwllwwkCCCCCCCCkk.............",
    "....kkwwwwllwwwcCCCCCcbbwkkk..........",
    "..kkwwwwwwwwwwwwbbbbbwwwwwwwkkkk......",
    ".kwwwWWWWWWWWWWWWWWWWWWWWWWWWWWWkkkk..",
    "kOOkwWRRRRRRRRRRRRWWWWWWWWWWWWWWWWWWWk",
    ".kwwwWWwwwwwwwwwwwwwwwwwwwwwwwwwkkkk..",
    "..kkwwwwwwwwwwwwddddddwwwwwwkkkk......",
    "....kkwwwwllwwwdddddddddwkkk..........",
    "......kkwwllwwkdddddddkk..............",
    "........kwllwk.kkdddkk................",
    "........kwlwk....kkk..................",
    "........kwk...........................",
    "........kk............................",
  ];
  SP.ship = makeSprite(SHIP_ROWS, SHIP_PAL);
  SP.shipWhite = makeSprite(SHIP_ROWS, whitePal(SHIP_PAL));
  // 残機アイコン（14×7 ミニ自機）
  SP.lifeIcon = makeSprite(
    [
      "...kk.........",
      "..kwwkkk......",
      ".kwWWWWWkkk...",
      "kOkWRRRWWWWWk.",
      ".kwWWWWWkkk...",
      "..kwwkkk......",
      "...kk.........",
    ],
    SHIP_PAL
  );

  // エンジン炎（9×5、2フレーム）
  const FLAME_PAL = { O: C.O, o: C.o, Y: C.Y, W: C.W };
  SP.flame0 = makeSprite(
    ["....ooOY.", "..oOYYYW.", ".oOYYWWW.", "..oOYYYW.", "....ooOY."],
    FLAME_PAL
  );
  SP.flame1 = makeSprite(
    ["......oO.", "...oOYYW.", "..oOYYWW.", "...oOYYW.", "......oO."],
    FLAME_PAL
  );

  // シールド（7×26 前方アーク、2フレーム）
  function shieldRows(inner) {
    const rows = [];
    const H = 26;
    for (let y = 0; y < H; y++) {
      const t = Math.abs(y - (H - 1) / 2) / ((H - 1) / 2); // 0中央→1端
      const x = Math.round(t * t * 5); // 端ほど左へ湾曲
      let row = "";
      for (let i = 0; i < 7; i++) {
        if (i === x) row += "B";
        else if (i === x + 1) row += inner;
        else row += ".";
      }
      rows.push(row);
    }
    return rows;
  }
  SP.shield0 = makeSprite(shieldRows("C"), { B: C.B, C: C.C });
  SP.shield1 = makeSprite(shieldRows("b"), { B: C.B, b: C.b });

  // ---- 雑魚敵（18×12、A=メイン a=暗 W=白 C=ガラス k=輪郭） ------------
  const ZAKO_ROWS = [
    "....k.............",
    "...kak......kk....",
    "...kAak....kaak...",
    "..kAAAkkkkkAAak...",
    ".kAWWAAAAAAAAaak..",
    "kAWCCWAAAAAAAAaak.",
    "kAWCCWAAAAAAAAaak.",
    ".kAWWAAAAAAAAaak..",
    "..kAAAkkkkkAAak...",
    "...kAak....kaak...",
    "...kak......kk....",
    "....k.............",
  ];
  const zpal = (main, dark) => ({
    k: C.K, A: main, a: dark, W: C.W, C: C.C,
  });
  SP.zakoCyan = makeSprite(ZAKO_ROWS, zpal("#48c8e8", "#1878a0"));
  SP.zakoMag = makeSprite(ZAKO_ROWS, zpal(C.M, C.m));
  SP.zakoRed = makeSprite(ZAKO_ROWS, zpal(C.R, C.r));

  // 追尾機（14×12 球型メカ・中央に暗い機関部）
  const TRACKER_ROWS = [
    "....kkkkkk....",
    "..kkGGGGGGkk..",
    ".kGWWGGGGGGgk.",
    ".kGWGGGGGGGgk.",
    "kGGGGGkkGGGGgk",
    "kGGGGkddkGGGgk",
    "kGGGGkddkGGGgk",
    "kGGGGGkkGGGGgk",
    ".kGGGGGGGGGgk.",
    ".kgGGGGGGGggk.",
    "..kkggggggkk..",
    "....kkkkkk....",
  ];
  const tpal = (main, dark) => ({
    k: C.K, G: main, g: dark, W: C.W, d: C.d,
  });
  SP.tracker = makeSprite(TRACKER_ROWS, tpal(C.G, C.g));
  SP.trackerRed = makeSprite(TRACKER_ROWS, tpal(C.R, C.r));

  // 砲台（22×16 ドーム＋左向き砲身＋基部）
  const TURRET_ROWS = [
    "......kkkkkkkk........",
    "....kkPPPPPPPPkk......",
    "...kPWWPPPPPPPPpk.....",
    "..kPPWPPPPPPPPPppk....",
    "kkkPPPPPkkkkPPPPppkk..",
    "lekPPPkkddddkkPPPppk..",
    "lekPPkkdWWWWdkkPPppk..",
    "lekPPkkdWWWWdkkPPppk..",
    "lekPPPkkddddkkPPPppk..",
    "kkkPPPPPkkkkPPPPppkk..",
    "..kPPPPPPPPPPPPPppk...",
    "...kpPPPPPPPPPPppk....",
    "....kkpppppppppkk.....",
    "...kkddddddddddddkk...",
    "..kddeeeeeeeeeeeddk...",
    "..kkkkkkkkkkkkkkkkk...",
  ];
  const TURRET_PAL = {
    k: C.K, P: C.P, p: C.p, l: C.l, e: C.e, d: C.d, W: C.O,
  };
  SP.turret = makeSprite(TURRET_ROWS, TURRET_PAL);
  SP.turretRed = makeSprite(TURRET_ROWS, swapPal(TURRET_PAL, { P: C.R, p: C.r }));

  // ---- パワーカプセル（12×10、点滅2フレーム） -------------------------
  const CAP_ROWS = [
    "...kkkkkk...",
    "..kRRRRRRk..",
    ".kRWWRRRRRk.",
    "kRWWRRRRRRrk",
    "kRWRRRRRRRrk",
    "kRRRRRRRRRrk",
    "kRRRRRRRRrrk",
    ".kRRRRRRrrk.",
    "..krrrrrrk..",
    "...kkkkkk...",
  ];
  SP.capsule0 = makeSprite(CAP_ROWS, { k: C.K, R: C.R, r: C.r, W: C.W });
  SP.capsule1 = makeSprite(CAP_ROWS, { k: C.K, R: C.O, r: C.o, W: C.W });

  // ---- 弾 --------------------------------------------------------------
  SP.pellet = makeSprite(
    [".YWWWWWW", "YWWWWWWW", ".YWWWWWW"],
    { W: C.W, Y: C.Y }
  );
  SP.double = makeSprite(
    ["..WW..", ".WCCW.", "WCCCCW", "WCCCCW", ".WCCW.", "..WW.."],
    { W: C.W, C: C.C }
  );
  (function () {
    const n = 30;
    const cRow = "c" + "C".repeat(n - 2) + "c";
    const wRow = "W".repeat(n);
    SP.laser = makeSprite([cRow, wRow, cRow], { W: C.W, C: C.C, c: C.c });
  })();
  SP.missile = makeSprite(
    ["...kkkkkW", "OOkddddWk", "OOkddddWk", "...kkkkkW"],
    { k: C.K, d: C.d, W: C.W, O: C.O }
  );
  SP.ebullet = makeSprite(
    [".kMMk.", "kMWWMk", "kMWWMk", ".kMMk."],
    { k: C.K, M: C.M, W: C.W }
  );
  SP.ebulletY = makeSprite(
    [".kYYk.", "kYWWYk", "kYWWYk", ".kYYk."],
    { k: C.K, Y: C.Y, W: C.W }
  );

  // ---- オプション（14×12、2フレーム） ---------------------------------
  const OPT_PAL = { k: C.K, O: C.O, o: C.o, Y: C.Y, W: C.W };
  SP.option0 = makeSprite(
    [
      "....kkkkkk....",
      "..kkOOOOOOkk..",
      ".kOYYOOOOOOok.",
      "kOYWWYOOOOOook",
      "kOYWWYOOOOOook",
      "kOOYYOOOOOOook",
      "kOOOOOOOOOOook",
      "kOOOOOOOOooook",
      ".kOOOOOOooook.",
      "..kkoooooookk.",
      "....kkkkkk....",
    ],
    OPT_PAL
  );
  SP.option1 = makeSprite(
    [
      "....kkkkkk....",
      "..kkOOOOOOkk..",
      ".kOOOOOYYOok..",
      "kOOOOOYWWYook.",
      "kOOOOOYWWYook.",
      "kOOOOOOYYOook.",
      "kOOOOOOOOOook.",
      "kOOOOOOOOoook.",
      ".kOOOOOOooook.",
      "..kkoooooookk.",
      "....kkkkkk....",
    ],
    OPT_PAL
  );

  // ---- 爆発アニメ（4フレーム） ----------------------------------------
  const EX_PAL = { k: C.K, W: C.W, Y: C.Y, O: C.O, o: C.o, l: C.l, d: C.d };
  SP.ex0 = makeSprite(
    [
      "...WW...",
      "..WWWW..",
      ".WWWWWW.",
      "WWWWWWWW",
      "WWWWWWWW",
      ".WWWWWW.",
      "..WWWW..",
      "...WW...",
    ],
    EX_PAL
  );
  SP.ex1 = makeSprite(
    [
      "....YYYY....",
      "..YYWWWWYY..",
      ".YWWWWWWWWY.",
      ".YWWWWWWWWY.",
      "YWWWWWWWWWWY",
      "YWWWWWWWWWWY",
      "YWWWWWWWWWWY",
      "YWWWWWWWWWWY",
      ".YWWWWWWWWY.",
      ".YWWWWWWWWY.",
      "..YYWWWWYY..",
      "....YYYY....",
    ],
    EX_PAL
  );
  SP.ex2 = makeSprite(
    [
      "...O..OOOO..O...",
      "..OOYYYYYYYOO...",
      ".OOYYOOOOYYYOO..",
      "OOYYOO..OOYYYOO.",
      "OYYO......OYYYO.",
      "OYO........OYYO.",
      "OYO........OOYO.",
      "OYYO......OOYYO.",
      "OOYYOO..OOYYOO..",
      ".OOYYOOOOYYOO...",
      "..OOYYYYYYOO....",
      "...OO.OOOO.O....",
    ],
    EX_PAL
  );
  SP.ex3 = makeSprite(
    [
      "...d...dd......",
      "..dlld..dld....",
      ".dl..ld..lld...",
      "dl....d....ld..",
      "d..........d...",
      ".dl..ld...dl...",
      "..ddd..ddd.....",
    ],
    EX_PAL
  );

  // ---- ボス戦艦（コード生成 84×75） -----------------------------------
  const BOSS_W = 84;
  const BOSS_H = 75;

  function bossRows(coreOpen) {
    const g = [];
    for (let y = 0; y < BOSS_H; y++) g.push(new Array(BOSS_W).fill("."));
    const set = (x, y, ch) => {
      if (x >= 0 && x < BOSS_W && y >= 0 && y < BOSS_H) g[y][x] = ch;
    };
    const get = (x, y) =>
      x >= 0 && x < BOSS_W && y >= 0 && y < BOSS_H ? g[y][x] : ".";

    // 陰影バンド（上=明 → 下=暗）
    const bandCh = (y) => (y < 21 ? "1" : y < 39 ? "2" : y < 57 ? "3" : "4");

    // 主船体
    for (let y = 9; y <= 65; y++) {
      for (let x = 24; x <= 74; x++) set(x, y, bandCh(y));
    }
    // 船首（左へ尖る楔形）
    for (let y = 15; y <= 60; y++) {
      const ext = Math.floor(Math.abs(y - 37.5) * 0.95);
      for (let x = 3 + ext; x < 24; x++) set(x, y, bandCh(y));
    }
    // 上部構造物（艦橋）
    for (let y = 3; y < 9; y++) for (let x = 39; x <= 60; x++) set(x, y, "1");
    for (let y = 0; y < 3; y++) for (let x = 45; x <= 54; x++) set(x, y, "1");
    // 下部フィン
    for (let y = 66; y < 72; y++) for (let x = 42; x <= 66; x++) set(x, y, "4");
    // エンジンブロック（右端・オレンジ発光スリット）
    for (let y = 18; y <= 57; y++) {
      for (let x = 75; x <= 81; x++) set(x, y, "e");
      if (y % 5 === 2) {
        set(78, y, "E");
        set(79, y, "E");
        set(80, y, "E");
      }
    }
    // パネル継ぎ目（縦）とリベット
    for (let x = 33; x <= 69; x += 12) {
      for (let y = 10; y <= 64; y++) set(x, y, "s");
      for (let y = 13; y <= 62; y += 8) set(x + 1, y, "v");
    }
    // 横継ぎ目
    for (const sy of [21, 39, 57]) {
      for (let x = 6; x < 75; x++) if (get(x, sy) !== ".") set(x, sy, "s");
    }
    // ダクト/ベント（暗いくぼみの列）
    for (let gy = 14; gy <= 60; gy += 14) {
      for (let gx = 40; gx <= 68; gx += 10) {
        for (let dx = 0; dx < 5; dx++) {
          set(gx + dx, gy, "s");
          set(gx + dx, gy + 1, "h");
        }
      }
    }
    // 砲塔の出っ張り（上下）
    for (let x = 30; x <= 36; x++) {
      set(x, 8, "2");
      set(x, 7, "s");
    }
    for (let x = 50; x <= 58; x++) set(x, 66, "3");
    // 警告色の斜めストライプ（艦首上）
    for (let i = 0; i < 12; i++) {
      const x = 26 + i,
        y = 11 + (i % 2);
      if (get(x, y) !== ".") set(x, y, i % 4 < 2 ? "E" : "s");
    }

    // コアソケット（中心 dot(13,37)、半径11）
    const cx = 13,
      cy = 37,
      R = 11;
    for (let y = cy - R; y <= cy + R; y++) {
      for (let x = cx - R; x <= cx + R; x++) {
        const d2 = (x - cx) * (x - cx) + (y - cy) * (y - cy);
        if (d2 <= R * R) {
          if (d2 > (R - 2) * (R - 2)) set(x, y, "s");
          else if (d2 > (R - 4) * (R - 4)) set(x, y, "h");
          else set(x, y, coreOpen ? "K" : "h");
        }
      }
    }
    if (!coreOpen) {
      for (let x = cx - R + 3; x <= cx + R - 3; x++) {
        set(x, cy - 3, "s");
        set(x, cy, "s");
        set(x, cy + 3, "s");
      }
    }

    // 輪郭パス（外周に接するドットを黒く）
    for (let y = 0; y < BOSS_H; y++) {
      for (let x = 0; x < BOSS_W; x++) {
        if (g[y][x] === ".") continue;
        if (
          get(x - 1, y) === "." ||
          get(x + 1, y) === "." ||
          get(x, y - 1) === "." ||
          get(x, y + 1) === "."
        ) {
          g[y][x] = "K";
        }
      }
    }
    return g.map((row) => row.join(""));
  }

  const BOSS_PAL = {
    1: "#a8a0b8", // 明装甲
    2: "#847a9c",
    3: "#5f5680",
    4: "#3f3860", // 暗装甲
    s: "#2a2444", // 継ぎ目
    h: "#4a445f", // くぼみ
    v: "#d8d0e0", // リベット
    e: "#3c4250", // エンジン枠
    E: C.O, // 発光部
    K: C.K, // 輪郭・コア穴
  };
  SP.bossOpen = makeSprite(bossRows(true), BOSS_PAL);
  SP.bossClosed = makeSprite(bossRows(false), BOSS_PAL);
  SP.bossWhite = makeSprite(bossRows(true), whitePal(BOSS_PAL));

  // コア（18×16、2フレーム明滅）
  SP.core0 = makeSprite(
    [
      ".....kkkkkk.....",
      "...kkrRRRRrkk...",
      "..krRRRRRRRRrk..",
      ".krRRWWWWRRRRrk.",
      ".kRRWWWWWWRRRRk.",
      "kRRWWWWWWWWRRRrk",
      "kRRWWWWWWWWRRRrk",
      ".kRRWWWWWWRRRRk.",
      ".krRRWWWWRRRRrk.",
      "..krRRRRRRRRrk..",
      "...kkrRRRRrkk...",
      ".....kkkkkk.....",
    ],
    { k: C.K, R: C.R, r: C.r, W: C.W }
  );
  SP.core1 = makeSprite(
    [
      ".....kkkkkk.....",
      "...kkrRRRRrkk...",
      "..krRRRRRRRRrk..",
      ".krRRRRRRRRRRrk.",
      ".kRRRRWWWWRRRRk.",
      "kRRRRWWWWWWRRRrk",
      "kRRRRWWWWWWRRRrk",
      ".kRRRRWWWWRRRRk.",
      ".krRRRRRRRRRRrk.",
      "..krRRRRRRRRrk..",
      "...kkrRRRRrkk...",
      ".....kkkkkk.....",
    ],
    { k: C.K, R: C.R, r: C.r, W: C.W }
  );

  // ---- 惑星（コード生成・帯＋ディザ＋陰） ------------------------------
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
        const t = y / size;
        let bi = Math.min(bands.length - 1, Math.floor(t * bands.length));
        const edge = t * bands.length - bi;
        if (edge < 0.22 && bi > 0 && (x + y) % 2 === 0) bi--;
        // 右下の陰（2段階）
        if (dx + dy > r * 1.05) bi = Math.min(bands.length - 1, bi + 2);
        else if (dx + dy > r * 0.75) bi = Math.min(bands.length - 1, bi + 1);
        row += String.fromCharCode(65 + bi); // A,B,C...
      }
      rows.push(row);
    }
    const pal = {};
    bands.forEach((c2, i) => (pal[String.fromCharCode(65 + i)] = c2));
    return makeSprite(rows, pal);
  }
  SP.planetBlue = planetSprite(30, [
    "#7890d8",
    "#5a78c8",
    "#46609e",
    "#344878",
    "#243254",
    "#182240",
  ]);
  SP.planetOrange = planetSprite(18, [
    "#d8a05a",
    "#c88a4a",
    "#a06a38",
    "#7a4c28",
    "#54321c",
  ]);

  // ---- 地形タイル（48×15、岩肌） --------------------------------------
  function terrainTile() {
    const W = 48,
      H = 15;
    const rows = [];
    const top = [];
    for (let x = 0; x < W; x++) {
      // 決定的なギザギザ（sin合成）
      const v =
        3 +
        Math.round(
          2.2 * Math.sin(x * 0.7) + 1.6 * Math.sin(x * 1.9 + 2) + 1.2
        );
      top.push(Math.max(0, Math.min(7, v)));
    }
    for (let y = 0; y < H; y++) {
      let row = "";
      for (let x = 0; x < W; x++) {
        if (y < top[x]) row += ".";
        else if (y === top[x]) row += "t";
        else if (y === top[x] + 1) row += "u";
        else row += (x + y) % 2 === 0 ? "a" : (x * 3 + y) % 7 === 0 ? "c" : "b";
      }
      rows.push(row);
    }
    return makeSprite(rows, {
      t: "#a8845c",
      u: "#7a5c40",
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
    blit(ctx, name, cx, cy) {
      const s = SP[name];
      if (!s) return;
      ctx.drawImage(s, snap(cx - s.width / 2), snap(cy - s.height / 2));
    },
    blitScaled(ctx, name, cx, cy, k) {
      const s = SP[name];
      if (!s) return;
      const w = s.width * k,
        h = s.height * k;
      ctx.drawImage(s, snap(cx - w / 2), snap(cy - h / 2), w, h);
    },
    blitAt(ctx, name, x, y) {
      const s = SP[name];
      if (!s) return;
      ctx.drawImage(s, snap(x), snap(y));
    },
  };
})();
