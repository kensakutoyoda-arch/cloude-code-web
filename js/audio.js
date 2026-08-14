// audio.js — WebAudio による手続き的な効果音（外部音源なし）
// ブラウザの自動再生制限のため、最初のユーザー操作で resume する。

(function () {
  "use strict";
  const G = window.G;

  let ctx = null;
  let master = null;
  let enabled = true;

  function ensure() {
    if (ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) {
        enabled = false;
        return;
      }
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.18;
      master.connect(ctx.destination);
    } catch (e) {
      enabled = false;
    }
  }

  // 単発トーン
  function tone(freq, dur, type = "square", vol = 1, sweepTo = null) {
    if (!enabled) return;
    ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (sweepTo != null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, sweepTo), t0 + dur);
    }
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  // ノイズ（爆発用）
  function noise(dur, vol = 1) {
    if (!enabled) return;
    ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1400;
    src.connect(lp);
    lp.connect(g);
    g.connect(master);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }

  G.audio = {
    resume() {
      ensure();
      if (ctx && ctx.state === "suspended") ctx.resume();
    },
    setEnabled(v) {
      enabled = v;
    },
    shot() {
      tone(880, 0.07, "square", 0.5, 320);
    },
    laser() {
      tone(1200, 0.12, "sawtooth", 0.4, 700);
    },
    missile() {
      tone(300, 0.1, "triangle", 0.5, 120);
    },
    powerup() {
      tone(520, 0.06, "square", 0.6);
      setTimeout(() => tone(780, 0.09, "square", 0.6), 60);
    },
    capsule() {
      tone(1046, 0.06, "square", 0.5);
    },
    hitEnemy() {
      tone(200, 0.05, "square", 0.35, 120);
    },
    explode() {
      noise(0.35, 0.9);
      tone(120, 0.3, "triangle", 0.5, 40);
    },
    bigExplode() {
      noise(0.9, 1.0);
      tone(90, 0.7, "triangle", 0.6, 30);
    },
    playerDie() {
      noise(0.6, 0.9);
      tone(400, 0.5, "sawtooth", 0.6, 60);
    },
  };
})();
