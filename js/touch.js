// touch.js — スマホ向けタッチ操作レイヤー
// 画面左半分ドラッグ = バーチャルスティック（8方向）、プレイ中は自動連射、
// POWER/PAUSE ボタン、タイトル等では画面タップ = スタート。
// すべて G.input の仮想入力APIへ流し込むだけで、ゲーム本体には手を入れない。

(function () {
  "use strict";
  const G = window.G;

  // タッチデバイス判定（PCでは何もしない）
  const isTouch =
    "ontouchstart" in window ||
    (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
  if (!isTouch) return;

  const DEAD = 12; // スティックのデッドゾーン（px）
  const KNOB_MAX = 40; // ノブの視覚上の最大移動半径（px）

  window.addEventListener("load", () => {
    const wrap = document.getElementById("stage-wrap");
    const ui = document.getElementById("touch-ui");
    const base = document.getElementById("stick-base");
    const knob = document.getElementById("stick-knob");
    const btnPower = document.getElementById("btn-power");
    const btnPause = document.getElementById("btn-pause");
    if (!wrap || !ui) return;

    document.body.classList.add("touch"); // CSSでタッチUIを表示

    let stickId = null; // スティック担当タッチの identifier
    let originX = 0,
      originY = 0;

    const setDirs = (dx, dy) => {
      G.input.virtualDown("left", dx < -DEAD);
      G.input.virtualDown("right", dx > DEAD);
      G.input.virtualDown("up", dy < -DEAD);
      G.input.virtualDown("down", dy > DEAD);
    };
    const clearDirs = () => setDirs(0, 0);

    const showStick = (x, y) => {
      base.style.transform = `translate(${x}px, ${y}px)`;
      knob.style.transform = `translate(${x}px, ${y}px)`;
      base.classList.add("on");
      knob.classList.add("on");
    };
    const moveKnob = (x, y) => {
      knob.style.transform = `translate(${x}px, ${y}px)`;
    };
    const hideStick = () => {
      base.classList.remove("on");
      knob.classList.remove("on");
    };

    const localPos = (touch) => {
      const r = wrap.getBoundingClientRect();
      return { x: touch.clientX - r.left, y: touch.clientY - r.top, w: r.width };
    };

    wrap.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        G.audio.resume();
        for (const t of e.changedTouches) {
          const p = localPos(t);
          // タイトル/リザルトでのタップスタート（プレイ中は無視される）
          G.input.virtualPress("start");
          // 左半分でスティック開始
          if (stickId === null && p.x < p.w / 2) {
            stickId = t.identifier;
            originX = p.x;
            originY = p.y;
            showStick(p.x, p.y);
            clearDirs();
          }
        }
      },
      { passive: false }
    );

    wrap.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        for (const t of e.changedTouches) {
          if (t.identifier !== stickId) continue;
          const p = localPos(t);
          const dx = p.x - originX;
          const dy = p.y - originY;
          setDirs(dx, dy);
          // ノブの視覚位置（最大半径でクランプ）
          const d = Math.hypot(dx, dy) || 1;
          const k = Math.min(d, KNOB_MAX) / d;
          moveKnob(originX + dx * k, originY + dy * k);
        }
      },
      { passive: false }
    );

    const endTouch = (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (t.identifier === stickId) {
          stickId = null;
          clearDirs();
          hideStick();
        }
      }
    };
    wrap.addEventListener("touchend", endTouch, { passive: false });
    wrap.addEventListener("touchcancel", endTouch, { passive: false });

    // ボタン（stage への伝播を止めて誤ってスティックを起動させない）
    const bindButton = (el, action) => {
      if (!el) return;
      el.addEventListener(
        "touchstart",
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          G.audio.resume();
          el.classList.add("active");
          G.input.virtualPress(action);
        },
        { passive: false }
      );
      el.addEventListener(
        "touchend",
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          el.classList.remove("active");
        },
        { passive: false }
      );
    };
    bindButton(btnPower, "power");
    bindButton(btnPause, "pause");

    // プレイ中は自動連射（毎フレーム状態を同期）
    const syncFire = () => {
      const playing = G.game && G.game.state === "playing";
      G.input.virtualDown("shot", !!playing);
      requestAnimationFrame(syncFire);
    };
    requestAnimationFrame(syncFire);
  });
})();
