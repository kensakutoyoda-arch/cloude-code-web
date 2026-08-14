// input.js — キーボード入力管理
// G.input.down(name) で押下中判定、G.input.pressed(name) でこのフレームの押し始めを判定。

(function () {
  "use strict";
  const G = window.G;

  // 論理アクション名 -> 対応する KeyboardEvent.code / key
  const MAP = {
    up: ["ArrowUp", "KeyW"],
    down: ["ArrowDown", "KeyS"],
    left: ["ArrowLeft", "KeyA"],
    right: ["ArrowRight", "KeyD"],
    shot: ["KeyZ", "Space"],
    power: ["KeyX", "Enter"],
    pause: ["KeyP"],
    start: ["Enter"],
  };

  const held = new Set(); // 現在押下中の code
  const justPressed = new Set(); // このフレームで押し始めた code
  const consumedEdge = new Set(); // pressed() 判定で消費済みの code

  function codeIsAction(code, action) {
    return MAP[action] && MAP[action].indexOf(code) !== -1;
  }

  window.addEventListener("keydown", (e) => {
    // ゲーム操作キーのスクロール等を抑止
    for (const a in MAP) {
      if (codeIsAction(e.code, a)) {
        e.preventDefault();
        break;
      }
    }
    if (!held.has(e.code)) {
      held.add(e.code);
      justPressed.add(e.code);
      consumedEdge.delete(e.code);
    }
  });

  window.addEventListener("keyup", (e) => {
    held.delete(e.code);
    justPressed.delete(e.code);
    consumedEdge.delete(e.code);
  });

  // フォーカスを失ったら全キー解除（押しっぱなし事故防止）
  window.addEventListener("blur", () => {
    held.clear();
    justPressed.clear();
    consumedEdge.clear();
  });

  G.input = {
    // 押下中か
    down(action) {
      const codes = MAP[action] || [];
      for (const c of codes) if (held.has(c)) return true;
      return false;
    },
    // このフレームで押し始めたか（1回だけ true を返す＝エッジ検出）
    pressed(action) {
      const codes = MAP[action] || [];
      for (const c of codes) {
        if (justPressed.has(c) && !consumedEdge.has(c)) {
          consumedEdge.add(c);
          return true;
        }
      }
      return false;
    },
    // フレーム終端で呼ぶ：エッジ状態をクリア
    endFrame() {
      justPressed.clear();
    },
  };
})();
