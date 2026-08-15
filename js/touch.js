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

  const DEAD = 6; // スティックのデッドゾーン（px）
  const RANGE = 40; // フル入力になる半径（px）＝ノブの最大移動半径
  const FOLLOW = 40; // これを超えて引くと原点が指を追いかける（追従式）

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

    // 指の変位 → アナログベクトル（デッドゾーン付き・大きさ1でクランプ）
    const applyStick = (dx, dy) => {
      const d = Math.hypot(dx, dy);
      if (d < DEAD) {
        G.input.setAnalog(0, 0);
        return;
      }
      // デッドゾーンを除いた距離を RANGE で正規化
      const m = Math.min(1, (d - DEAD) / (RANGE - DEAD));
      G.input.setAnalog((dx / d) * m, (dy / d) * m);
    };
    const clearStick = () => G.input.setAnalog(null);

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
            G.input.setAnalog(0, 0);
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
          let dx = p.x - originX;
          let dy = p.y - originY;
          // 追従式: 指が FOLLOW を超えて離れたら原点を指方向へ引きずる。
          // これにより方向転換が最小の指移動で即反映される。
          const d = Math.hypot(dx, dy);
          if (d > FOLLOW) {
            const pull = (d - FOLLOW) / d;
            originX += dx * pull;
            originY += dy * pull;
            dx = p.x - originX;
            dy = p.y - originY;
            base.style.transform = `translate(${originX}px, ${originY}px)`;
          }
          applyStick(dx, dy);
          // ノブの視覚位置（最大半径でクランプ）
          const d2 = Math.hypot(dx, dy) || 1;
          const k = Math.min(d2, RANGE) / d2;
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
          clearStick();
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
