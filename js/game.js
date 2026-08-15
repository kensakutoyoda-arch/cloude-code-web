// game.js — 状態機械（TITLE/PLAYING/PAUSED/GAMEOVER/CLEAR）、メインループ、当たり判定、HUD

(function () {
  "use strict";
  const G = window.G;
  const C = G.C;
  const COL = C.COL;
  const U = G.util;
  const HI_KEY = "neogradia_hi";

  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.ctx.imageSmoothingEnabled = false; // ドット絵をにじませない
      this.state = "title";
      this.t = 0;

      this.starfield = new G.Starfield();
      this.powerBar = new G.PowerBar();
      this.player = new G.Player();
      this.player.powerBar = this.powerBar;

      this.enemies = [];
      this.playerShots = [];
      this.enemyShots = [];
      this.capsules = [];
      this.boss = null;
      this.stage = new G.Stage();

      this.score = 0;
      this.lives = C.PLAYER_START_LIVES;
      this.highScore = this._loadHi();

      this.respawnTimer = 0;
      this.overlayTimer = 0; // gameover/clear へ移る前の間

      this._last = 0;
      this._raf = this._frame.bind(this);
    }

    _loadHi() {
      try {
        return parseInt(localStorage.getItem(HI_KEY) || "0", 10) || 0;
      } catch (e) {
        return 0;
      }
    }
    _saveHi() {
      try {
        localStorage.setItem(HI_KEY, String(this.highScore));
      } catch (e) {}
    }

    start() {
      requestAnimationFrame(this._raf);
    }

    startNewGame() {
      this.score = 0;
      this.lives = C.PLAYER_START_LIVES;
      this.enemies.length = 0;
      this.playerShots.length = 0;
      this.enemyShots.length = 0;
      this.capsules.length = 0;
      this.boss = null;
      this.stage.reset();
      this.powerBar.reset();
      this.player.reset(true);
      G.Particles.reset();
      this.respawnTimer = 0;
      this.overlayTimer = 0;
      this.state = "playing";
    }

    // ---- メインループ ---------------------------------------------------
    _frame(ts) {
      let dt = (ts - this._last) / 1000;
      this._last = ts;
      if (!isFinite(dt) || dt < 0) dt = 0;
      if (dt > 0.05) dt = 0.05; // 大きなフレーム跳びを抑制
      this.t += dt;

      this._update(dt);
      this._render();

      G.input.endFrame();
      requestAnimationFrame(this._raf);
    }

    _update(dt) {
      const inp = G.input;
      this.starfield.update(dt);

      switch (this.state) {
        case "title":
          if (inp.pressed("start")) {
            G.audio.resume();
            this.startNewGame();
          }
          break;

        case "playing":
          if (inp.pressed("pause")) {
            this.state = "paused";
            break;
          }
          this._updatePlaying(dt);
          break;

        case "paused":
          if (inp.pressed("pause")) this.state = "playing";
          break;

        case "gameover":
        case "clear":
          if (this.overlayTimer > 0) this.overlayTimer -= dt;
          else if (inp.pressed("start")) this.state = "title";
          break;
      }
    }

    _updatePlaying(dt) {
      const inp = G.input;
      const p = this.player;

      // パワーアップ適用
      if (p.alive && inp.pressed("power")) this.powerBar.apply(p);

      // 自機
      if (p.alive) {
        p.update(dt, this);
      } else {
        // 復帰待ち or ゲームオーバー待ち
        this.respawnTimer -= dt;
        if (this.respawnTimer <= 0) {
          if (this.lives > 0) {
            p.reset(false); // パワーアップ喪失で復帰
          } else {
            this.state = "gameover";
            this.overlayTimer = 1.0;
            if (this.score > this.highScore) {
              this.highScore = this.score;
              this._saveHi();
            }
          }
        }
      }

      this.powerBar.update(dt);

      // 更新
      for (const e of this.enemies) e.update(dt, this);
      for (const s of this.playerShots) s.update(dt);
      for (const s of this.enemyShots) s.update(dt);
      for (const c of this.capsules) c.update(dt);
      G.Particles.update(dt);
      this.stage.update(dt, this);
      if (this.boss) this.boss.update(dt, this);

      this._collide();
      this._cleanup();

      // ボス撃破 → ステージクリア
      if (this.boss && this.boss.dead) {
        this.score += this.boss.score;
        this.boss = null;
        this.state = "clear";
        this.overlayTimer = 1.2;
        if (this.score > this.highScore) {
          this.highScore = this.score;
          this._saveHi();
        }
      }
    }

    // ---- 当たり判定 -----------------------------------------------------
    _collide() {
      const p = this.player;

      // 自機弾 vs 敵
      for (const shot of this.playerShots) {
        if (shot.dead) continue;
        for (const e of this.enemies) {
          if (e.dead) continue;
          if (!U.hitRect(shot, e)) continue;
          if (shot.pierce) {
            if (!shot._hit) shot._hit = new Set();
            if (shot._hit.has(e)) continue;
            shot._hit.add(e);
          }
          e.hp -= shot.damage;
          G.Particles.burst(shot.x, e.y, COL.cyan, 4, 90, 2);
          if (e.hp <= 0) this._killEnemy(e);
          if (!shot.pierce) {
            shot.dead = true;
            break;
          }
        }
      }

      // 自機弾 vs ボス
      if (this.boss && this.boss.state !== "dying") {
        const boss = this.boss;
        const core = boss.coreRect();
        const body = boss.bodyRect();
        for (const shot of this.playerShots) {
          if (shot.dead) continue;
          if (U.hitRect(shot, core) && boss.coreVulnerable) {
            if (shot.pierce) {
              if (!shot._hit) shot._hit = new Set();
              if (shot._hit.has(boss)) continue;
              shot._hit.add(boss);
            }
            boss.damageCore(shot.damage);
            G.Particles.burst(core.x, core.y, COL.yellow, 6, 120, 3);
            G.audio.hitEnemy();
            if (!shot.pierce) shot.dead = true;
          } else if (U.hitRect(shot, body)) {
            // 装甲に吸収（貫通弾以外）
            G.Particles.burst(shot.x, shot.y, COL.purple, 3, 70, 2);
            if (!shot.pierce) shot.dead = true;
          }
        }
      }

      // 以降は自機が有効な時のみ
      const pv = p.alive && p.invuln <= 0;
      const hb = p.hitbox();

      // 敵弾 vs 自機
      if (p.alive) {
        for (const s of this.enemyShots) {
          if (s.dead) continue;
          if (U.hitRect(s, hb)) {
            s.dead = true;
            if (p.onHit()) this._killPlayer();
          }
        }
      }

      // 敵接触 vs 自機
      if (p.alive) {
        for (const e of this.enemies) {
          if (e.dead) continue;
          if (U.hitRect(e, hb)) {
            if (p.invuln <= 0 && p.shieldHp <= 0) {
              this._killEnemy(e);
              if (p.onHit()) this._killPlayer();
            } else if (p.onHit()) {
              // シールド/無敵で耐えた場合も敵は砕く
              this._killEnemy(e);
            }
          }
        }
      }

      // ボス接触 vs 自機
      if (p.alive && this.boss && this.boss.state === "battle") {
        if (U.hitRect(this.boss.bodyRect(), hb)) {
          if (p.onHit()) this._killPlayer();
        }
      }

      // カプセル vs 自機（取得しやすいよう本体全体で判定）
      if (p.alive) {
        for (const c of this.capsules) {
          if (c.dead) continue;
          if (U.hitRect(c, { x: p.x, y: p.y, w: p.w + 6, h: p.h + 6 })) {
            c.dead = true;
            this.powerBar.gainCapsule();
          }
        }
      }
      void pv;
    }

    _killEnemy(e) {
      if (e.dead) return;
      e.dead = true;
      this.score += e.score;
      G.Particles.explode(e.x, e.y, 1);
      G.audio.explode();
      if (e.isRed) this.capsules.push(new G.Capsule(e.x, e.y));
    }

    _killPlayer() {
      const p = this.player;
      if (!p.alive) return;
      p.alive = false;
      this.lives--;
      G.Particles.bigBurst(p.x, p.y);
      G.audio.playerDie();
      this.respawnTimer = 1.3;
    }

    _cleanup() {
      this.enemies = this.enemies.filter((e) => !e.dead);
      this.playerShots = this.playerShots.filter((s) => !s.dead);
      this.enemyShots = this.enemyShots.filter((s) => !s.dead);
      this.capsules = this.capsules.filter((c) => !c.dead);
    }

    // ---- 描画 -----------------------------------------------------------
    _render() {
      const ctx = this.ctx;
      ctx.fillStyle = "#01030a";
      ctx.fillRect(0, 0, C.W, C.H);

      this.starfield.draw(ctx);

      if (this.state === "title") {
        this._drawTitle(ctx);
        return;
      }

      // ゲーム世界
      for (const c of this.capsules) c.draw(ctx);
      for (const e of this.enemies) e.draw(ctx);
      if (this.boss) this.boss.draw(ctx);
      for (const s of this.playerShots) s.draw(ctx);
      for (const s of this.enemyShots) s.draw(ctx);
      this.player.options.draw(ctx);
      if (this.player.alive) this.player.draw(ctx);
      G.Particles.draw(ctx);

      this._drawHud(ctx);
      this.powerBar.draw(ctx, this.player);

      if (this.boss) this._drawBossHp(ctx);
      if (this.stage.warningActive) this._drawWarning(ctx);

      if (this.state === "paused") this._drawCenterMsg(ctx, "PAUSE", COL.cyan);
      if (this.state === "gameover")
        this._drawEndMsg(ctx, "GAME OVER", COL.red);
      if (this.state === "clear")
        this._drawEndMsg(ctx, "STAGE CLEAR!", COL.green);
    }

    _drawHud(ctx) {
      U.pxText(ctx, "SCORE " + String(this.score).padStart(7, "0"), 15, 9, {
        size: 12,
        color: COL.cyan,
      });
      U.pxText(
        ctx,
        "HI " + String(this.highScore).padStart(7, "0"),
        C.W - 15,
        9,
        { size: 12, color: COL.yellow, align: "right" }
      );
      // 残機（自機アイコン）
      for (let i = 0; i < Math.max(0, this.lives - 1); i++) {
        G.Sprites.blit(ctx, "lifeIcon", 36 + i * 40, 48);
      }
    }

    _drawBossHp(ctx) {
      const boss = this.boss;
      const PX = C.PX;
      const w = C.W - 120,
        x = U.snap(60),
        y = U.snap(72),
        h = PX * 3;
      ctx.save();
      // 背景と枠（フラット）
      ctx.fillStyle = "#181c24";
      ctx.fillRect(x - PX, y - PX, w + PX * 2, h + PX * 2);
      const ratio = Math.max(0, boss.hp / boss.maxHp);
      ctx.fillStyle = ratio > 0.4 ? COL.red : COL.orange;
      ctx.fillRect(x, y, U.snap(w * ratio), h);
      ctx.fillStyle = COL.white;
      ctx.fillRect(x - PX, y - PX, w + PX * 2, PX); // 上枠
      ctx.fillRect(x - PX, y + h, w + PX * 2, PX); // 下枠
      ctx.restore();
      U.pxText(ctx, "BOSS", x, y - PX * 5, { size: 10, color: COL.red });
    }

    _drawWarning(ctx) {
      if (Math.floor(this.t * 4) % 2 === 0) {
        U.pxText(ctx, "!! WARNING !!", C.W / 2, C.H / 2 - 72, {
          size: 20,
          color: COL.red,
          align: "center",
          shadow: "#4a0c14",
        });
        U.pxText(ctx, "A HUGE BATTLESHIP IS APPROACHING", C.W / 2, C.H / 2 - 12, {
          size: 9,
          color: COL.yellow,
          align: "center",
        });
      }
    }

    _drawCenterMsg(ctx, msg, color) {
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(0, 0, C.W, C.H);
      ctx.restore();
      U.pxText(ctx, msg, C.W / 2, C.H / 2 - 24, {
        size: 22,
        color,
        align: "center",
        shadow: "#181c24",
      });
    }

    _drawEndMsg(ctx, msg, color) {
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, C.W, C.H);
      ctx.restore();
      U.pxText(ctx, msg, C.W / 2, C.H / 2 - 78, {
        size: 22,
        color,
        align: "center",
        shadow: "#181c24",
      });
      U.pxText(
        ctx,
        "SCORE " + String(this.score).padStart(7, "0"),
        C.W / 2,
        C.H / 2 - 6,
        { size: 13, color: COL.cyan, align: "center" }
      );
      if (this.overlayTimer <= 0) {
        U.pxText(ctx, "PRESS ENTER TO RETURN TO TITLE", C.W / 2, C.H / 2 + 48, {
          size: 9,
          color: COL.white,
          align: "center",
          alpha: 0.6 + 0.4 * Math.sin(this.t * 6),
        });
      }
    }

    _drawTitle(ctx) {
      // SFCロゴ風の2色抜きタイトル
      U.pxText(ctx, "NEO GRADIA", C.W / 2, 150, {
        size: 32,
        color: COL.cyan,
        align: "center",
        shadow: "#1c3878",
      });
      U.pxText(ctx, "- 16BIT SHOOTING -", C.W / 2, 232, {
        size: 12,
        color: COL.mag,
        align: "center",
      });

      const lines = [
        "移動 : 方向キー / WASD",
        "ショット : Z / Space（連射）",
        "パワーアップ : X / Enter",
        "カプセルを集めて下のバーを進め、X で強化を選ぼう",
        "ポーズ : P",
      ];
      lines.forEach((l, i) => {
        U.pxText(ctx, l, C.W / 2, 306 + i * 30, {
          size: 9,
          color: "#9fd8ee",
          align: "center",
        });
      });

      U.pxText(ctx, "PRESS ENTER TO START", C.W / 2, 486, {
        size: 15,
        color: COL.yellow,
        align: "center",
        alpha: 0.5 + 0.5 * Math.sin(this.t * 5),
      });
      if (this.highScore > 0) {
        U.pxText(
          ctx,
          "HI-SCORE  " + String(this.highScore).padStart(7, "0"),
          C.W / 2,
          534,
          { size: 10, color: COL.green, align: "center" }
        );
      }
    }
  }

  // 起動
  window.addEventListener("load", () => {
    const canvas = document.getElementById("game");
    const game = new Game(canvas);
    G.game = game;
    // 最初の操作で音声を有効化
    window.addEventListener(
      "keydown",
      () => G.audio.resume(),
      { once: true }
    );
    game.start();
  });

  G.Game = Game;
})();
