// sprites.js — SFC風ドット絵スプライトライブラリ
// 文字列アート（1文字=1ドット）を起動時にオフスクリーン canvas へ焼き込み、
// drawImage でブリットする。1ドット = PX×PX 画面ピクセル。
// アートはSFC実機の作法（黒輪郭・左上光源・多階調金属ランプ・差し色）で制作。

(function () {
  "use strict";
  const G = window.G;
  const PX = G.C.PX;
  const snap = G.util.snap;

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

  // ---- スプライトデータ（ドット絵本体） ------------------------------
  const SPRITE_DATA = {
    "ship": {
      rows: ["......KKK.............................",".....KWwlK............................","......KWwlK...........................",".......KWwlK......KKKKKK..............","........KWwlK....KCWCcccK.............",".....KKKWWWWWKKKKCCCcccbK.............","KKKKKwWWWeWWWWeWWwwwwwwwWKKKKK........","KOoodwwwwwwwwwewwwlllwwwweYywwKKKKK...","KYOodlRRRRRRRRrRRRRRRRRRrllllllllwlKKK","KooodeeeeeoOoedeeeeeeeeedeeeeeKKKKK...","KKKKKdddedddddddddeddddddKKKKK........",".....KKKKKKKKKKKKKKKKKKKK.............","........KwwllleeKKK..KeedK............",".......KwlleeKKK......KKK.............","......KleeKKK.........................",".....KeeKK............................","....KKKK.............................."],
      pal: {"K":"#10141c","W":"#f8f8f8","w":"#c8d0d8","l":"#98a0ac","e":"#687080","d":"#3c4250","C":"#78d8f8","c":"#2890c0","b":"#1c3878","R":"#f04858","r":"#982838","O":"#f89020","o":"#b85010","Y":"#f8d838","y":"#b09018"},
    },
    "flame0": {
      rows: [".....ooO.","..oOOYYWW","ooOOYYWWW","..ooOYYWW","....ooOO."],
      pal: {"W":"#f8f8f8","O":"#f89020","o":"#b85010","Y":"#f8d838"},
    },
    "flame1": {
      rows: ["......oO.","....oOYWW","...oOYYWW",".....oOYW",".......oO"],
      pal: {"W":"#f8f8f8","O":"#f89020","o":"#b85010","Y":"#f8d838"},
    },
    "lifeIcon": {
      rows: ["..KK..........",".KWwK.KKK.....",".KKKKKCCcKKK..","KOwWwwlwRRwlKK","KoeeeederreKK.",".KKKKKKKKKK...","...KK........."],
      pal: {"K":"#10141c","W":"#f8f8f8","w":"#c8d0d8","l":"#98a0ac","e":"#687080","d":"#3c4250","C":"#78d8f8","c":"#2890c0","R":"#f04858","r":"#982838","O":"#f89020","o":"#b85010"},
    },
    "tracker": {
      rows: [".K...KKKK...K.","..KKhhhGGGKK..","..KhWWhGGGgK..","..KhWhGGGGgK..",".KhhGGdddGggK.",".KhGGdWkkdggK.",".KGGGdkRkdggK.",".KGgGdkkkdgfK.","..KGGGdddgfK..","..KGGggfgffK..","..KKggggffKK..",".K...KKKK...K."],
      pal: {"K":"#10141c","G":"#58d858","g":"#288828","h":"#a0f0a0","f":"#145c1c","d":"#3c4250","k":"#202634","W":"#f8f8f8","R":"#f04858","e":"#687080"},
    },
    "turret": {
      rows: [".........KKKKKK.......",".......KQWWQPPPpK.....","......KQWQQPPpPPpK....",".....KQQQPPPPpPPRpK...","KKK.KQPPPPwPPpPPrppK..","KwlKKKKKKpPPPpPPPppK..","KklwllllKpPPPpPPPPpK..","KkeeeeeeKppPPpPPPPpK..","KeeKKKKKKppPPpPPPppK..","KKK.KPPPpPPppppppppK..","....KKKKKKKKKKKKKKKK..",".....KlllllleeeeeeK...","...KleedeedeedeedeedK.","..KeddKKdddKKdddKKdddK","..KdddKKdddKKdddKKdddK","..KKKKKKKKKKKKKKKKKKKK"],
      pal: {"K":"#10141c","P":"#9878d8","p":"#584898","Q":"#c8a8f8","W":"#f8f8f8","w":"#c8d0d8","l":"#98a0ac","e":"#687080","d":"#3c4250","k":"#1c2230","R":"#f04858","r":"#982838"},
    },
    "bossOpen": {
      rows: ["..................................................KKKKKKKKKKKKK.....................","............................................KKK...KWRRWWWWWWWWK.....................","............................................KWK...KwwwwwwwwwwwK.....................","............................................KwwKKKwwwwwwwwwwwwwKKKK.................","............................................KwwWWWCCwwCCwwCCwwCCWWK.................","....................................KKKKKKKKwwwwwwccwwccwwccwwccwwK.KKKKKKK.........","............................KKKKKKKKWWWWWWWWwwwwwwwwwwwwwwwwwwwwwwK.KWWWWWK.........","............................KWWWWWWWwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwK.KwllllK.........","............................KKKKKKllwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwKwwwwwwwKK.......","..................................KwewnnnnwwwwnnnnwwwwnnnnwwewnnnnwWwwnnnnwWK.......","..................................KwewKKKKwwwwKKKKwwwwKKKKwwewKKKKwwwwKKKKwwK.......","..................................KwewnnnnwwwwnnnnwwwwnnnnwwewnnnnwwwwnnnnwwK.......","..................................KwlllllllllllllllllllllllllllllllllllllllwK.......","..................................KwewwlwlwlwlwlewwlwlwlwlwlewwlwlwlwlwlewwlK.......","..........................KKKKKKKKlwdwlwlwlwlwlwdwlwlwlwlwlwdwlwlwlwlwlwdwlwlKKK....","..........................KWRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRllWWK....","..........................KwrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrldeeeKKK.","..............KKKKKKKKKKKKlllllllllldwlllllllllldwlllllllllldwlllllllllldwlldeeeWWK.","..............KWWWWWWWWWWWlllllllllldwlllllllllldwlllllllllldwlllllllllldwlldeeeeeK.","..............KwlllllllllllllllllllldwlllllllllldwlllllllllldwlllllllllldwlldeeeeeK.","..............KwdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddldoOYOoK.","..KKKKKKKKKKKKllwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwldooOooK.","..KWYYYlllYYYldllllllllllllllllllllldwlllllllllldwlllllllllldwlllllllllldwlldeeeeelK","..KwdYYYdddYYYdlllwdlllllwdlllllwdlldwlwlllllwlldwlwlllllwlldwlwlllllwlldwlwdeeeeelK","..KwnnyyydddyyyllllllllllllllllllllldwlllllllllldwlllllllllldwlllllllllldwlldeeeeelK","..KKKKKKleleleleleleleleleleleleleledlleleleleledlleleleleledlleleleleledlleddededlK","........KweleKelelelelelelelelelelelnwelelelelelnwelelelelelnwelelelelelnwelnoOYOoeK","........KKKKKWKKKKeeeeeeeeenKneeeeeenleeeeeeeeeenleeeeeeeeeenleeeeeeeeeenleenooOooeK",".....KKKKWWWWWWWWwKKeeweeeenKneeeeeenleeelllleeenleeelllleeenleeelllleeenleendddddK.",".....KKWWWWWWnWWwwwwKeneeeeeeeeeeeeenleeedKKdeeenleeedKKdeeenleeedKKdeeenleendddddK.","..KKKKWWWWnnnKnnnwwweKeeeeeeeeeReeeenleeeddddeeenleeeddddeeenleeeddddeeenleendddddK.","..KWKWWWnnKKKKKKKnneeeKeeeeeeeereeeenleeeeeeeeeenleeeeeeeeeenleeeeeeeeeenleendddddK.","..KwKWWnnKKKKKKKKKnneeKeeweeeeeeeeeenleeeeeeeeeenleeeeeeeeeenleeeeeeeeeenleenoOYOoK.",".KwKWWWnKKKKKKKKKKKneedKnnnnKnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnenooOooK.",".KwKWWnKKKKKKKKKKKKKnddKlllnKnlllllllllllllllllllllllllllllllllllllllllllllendddddK.",".KwKWWnKKKKKKKKKKKKKnddKeeeeeeeeeeeenleeeeeeeeeenleeeeeeeeeenleeeeeeeeeenleendddddK.",".KwKWWnKKKKKKKKKKKKKnddKeeeeeeeeeweenlewnnnnnweenleweeeeeweenleweeeeeweenlewndddddK.",".KKWWnKKKKKKKKKKKKKKKnddKeweeeeeeeeenleeKKKKKeeenleeeeeeeeeenleeeeeeeeeenleendddddK.",".KwKWWnKKKKKKKKKKKKKnddKeeneeeeeeeeenleennnnneeenleeeeeeeeeenleeeeeeeeeenleenoOYOoeK",".KwKWWnKKKKKKKKKKKKKnddKedenKnedededneedededededneedededededneedededededneednooOooeK",".KlKWwnKKKKKKKKKKKKKnddKdednKndededenldededededenldededededenldededededenldendndnddK",".KlKwwwnKKKKKKKKKKKndddKddddddddddddneddddddddddneddddddddddneddddddddddneddnnnnnndK","..KlKwwnnKKKKKKKKKnnddKddwddddddddddneddddddddddneddddddddddneddddddddddneddnnnnnndK","..KlKwwennKKKKKKKnndddKddndddddRddddnedddeeeedddnedddeeeedddnedddeeeedddneddnnnnnndK","..KKKKeeeennnKnnnddddKdddddddddrddddnedddnKKndddnedddnKKndddnedddnKKndddneddnoOYOoK.",".....KKneedddnddddddKddddddnKnddddddnedddnnnndddnedddnnnndddnedddnnnndddneddnooOooK.",".....KKKKdddddddddKKddwddddnKnddddddneddddddddddneddddddddddneddddddddddneddnnnnnnK.","........KKKKKdKKKKnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnndnnnnnnK.","........KleeeKeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeednnnnnnK.","..KKKKKKddddddddddddddddddddddddddddneddddddddddneddddddddddneddddddddddneddnnnnnnK.","..KlYlllYYYdddYddddddddddddddddddlddnedldddddlddnedldddddlddnedldddddlddnedlnoOYOoK.","..KlYYdddYYYddddddeKdddddeKdddddeKddneddddddddddneddddddddddneddddddddddneddnooOooK.","..KlyyynnnyyynddndndndndndndndndndndnendndeKndndnendndeKndndnendndeKndndnendnnnnnnnK","..KKKKKKKKKKKKdndndndndndndndndndndnnddndndndndnnddndndndndnnddndndndndnnddnnnnnnndK","..............KennnnnnnnnnnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnK","..............KennnnnnnnnnnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnK","..............KennnnnnnnnnnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnnndnnnoOYOonK","..............KKKKKKKKKKKKnnnnnnnnnnndKKKKnnnnnnKKKKnnnnnnKKKKnnnnnnKKKKndnnnooOoonK","..........................KennnnnnnnndOOOOnnnnnnOOOOnnnnnnOOOOnnnnnnOOOOndnnnnnnnnK.","..........................KennnnnnnnndoooonnnnnnoooonnnnnnoooonnnnnnoooondnnnnnnnnK.","..........................KKKKKKKKnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnK.","..................................KldddddddddddddddddddddddddddddddddddddddnnKKKKKK.","..................................KendnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnnndnnK.......","..................................KendnennnnnennndnennnnnennndnennnnnennndneK.......","..................................KendnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnnndnnK.......","..................................KendnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnnnnnnK.......","..........................KKKKKKKKnnnnnnnnnKKKnnnnnnnnnnnnnnnnnnnnnnnKKKKKKKK.......","..........................KeeeeeeennnnnnnnK...KennKnnnnKnnnnKnnnnKnnK...............","..........................KKKKKKKKKKKKKKKKK...KennKnnnnKnnnnKnnnnKnnK...............","..............................................KKKKKKnnnKnnnnKnnnnKKKK...............","....................................................KennKnnnKnnnK...................","....................................................KennKnnnKnnnK...................","....................................................KKKKnnnnnKKKK...................","........................................................KennK.......................","........................................................KKKKK......................."],
      pal: {"K":"#10141c","W":"#f8f8f8","w":"#c8d0d8","l":"#98a0ac","e":"#687080","d":"#3c4250","n":"#262c3a","O":"#f89020","o":"#b85010","Y":"#f8d838","y":"#b09018","R":"#f04858","r":"#982838","C":"#78d8f8","c":"#2890c0"},
    },
    "bossClosed": {
      rows: ["..................................................KKKKKKKKKKKKK.....................","............................................KKK...KWRRWWWWWWWWK.....................","............................................KWK...KwwwwwwwwwwwK.....................","............................................KwwKKKwwwwwwwwwwwwwKKKK.................","............................................KwwWWWCCwwCCwwCCwwCCWWK.................","....................................KKKKKKKKwwwwwwccwwccwwccwwccwwK.KKKKKKK.........","............................KKKKKKKKWWWWWWWWwwwwwwwwwwwwwwwwwwwwwwK.KWWWWWK.........","............................KWWWWWWWwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwK.KwllllK.........","............................KKKKKKllwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwKwwwwwwwKK.......","..................................KwewnnnnwwwwnnnnwwwwnnnnwwewnnnnwWwwnnnnwWK.......","..................................KwewKKKKwwwwKKKKwwwwKKKKwwewKKKKwwwwKKKKwwK.......","..................................KwewnnnnwwwwnnnnwwwwnnnnwwewnnnnwwwwnnnnwwK.......","..................................KwlllllllllllllllllllllllllllllllllllllllwK.......","..................................KwewwlwlwlwlwlewwlwlwlwlwlewwlwlwlwlwlewwlK.......","..........................KKKKKKKKlwdwlwlwlwlwlwdwlwlwlwlwlwdwlwlwlwlwlwdwlwlKKK....","..........................KWRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRllWWK....","..........................KwrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrldeeeKKK.","..............KKKKKKKKKKKKlllllllllldwlllllllllldwlllllllllldwlllllllllldwlldeeeWWK.","..............KWWWWWWWWWWWlllllllllldwlllllllllldwlllllllllldwlllllllllldwlldeeeeeK.","..............KwlllllllllllllllllllldwlllllllllldwlllllllllldwlllllllllldwlldeeeeeK.","..............KwdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddldoOYOoK.","..KKKKKKKKKKKKllwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwldooOooK.","..KWYYYlllYYYldllllllllllllllllllllldwlllllllllldwlllllllllldwlllllllllldwlldeeeeelK","..KwdYYYdddYYYdlllwdlllllwdlllllwdlldwlwlllllwlldwlwlllllwlldwlwlllllwlldwlwdeeeeelK","..KwnnyyydddyyyllllllllllllllllllllldwlllllllllldwlllllllllldwlllllllllldwlldeeeeelK","..KKKKKKleleleleleleleleleleleleleledlleleleleledlleleleleledlleleleleledlleddededlK","........KweleKelelelelelelelelelelelnwelelelelelnwelelelelelnwelelelelelnwelnoOYOoeK","........KKKKKWKKKKeeeeeeeeenKneeeeeenleeeeeeeeeenleeeeeeeeeenleeeeeeeeeenleenooOooeK",".....KKKKWWWWWWWWwKKeeweeeenKneeeeeenleeelllleeenleeelllleeenleeelllleeenleendddddK.",".....KKWWWWWWnWWwwwwKeneeeeeeeeeeeeenleeedKKdeeenleeedKKdeeenleeedKKdeeenleendddddK.","..KKKKWWWWnnnnnnnwwweKeeeeeeeeeReeeenleeeddddeeenleeeddddeeenleeeddddeeenleendddddK.","..KWKWWWnnnnnnnnnnneeeKeeeeeeeereeeenleeeeeeeeeenleeeeeeeeeenleeeeeeeeeenleendddddK.","..KwKWWnnlllwnllllnneeKeeweeeeeeeeeenleeeeeeeeeenleeeeeeeeeenleeeeeeeeeenleenoOYOoK.",".KwKWWWnllllwnlllllneedKnnnnKnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnenooOooK.",".KwKWWnnnnnnnnnnnnnnnddKlllnKnlllllllllllllllllllllllllllllllllllllllllllllendddddK.",".KwKWWneeeeelneeeeeenddKeeeeeeeeeeeenleeeeeeeeeenleeeeeeeeeenleeeeeeeeeenleendddddK.",".KwKWWneeeeeRReeeeeenddKeeeeeeeeeweenlewnnnnnweenleweeeeeweenleweeeeeweenlewndddddK.",".KKWWnnnnnnnrrnnnnnnnnddKeweeeeeeeeenleeKKKKKeeenleeeeeeeeeenleeeeeeeeeenleendddddK.",".KwKWWneeeeelneeeeeenddKeeneeeeeeeeenleennnnneeenleeeeeeeeeenleeeeeeeeeenleenoOYOoeK",".KwKWWndddddlnddddddnddKedenKnedededneedededededneedededededneedededededneednooOooeK",".KlKWwnnnnnnnnnnnnnnnddKdednKndededenldededededenldededededenldededededenldendndnddK",".KlKwwwnddddlndddddndddKddddddddddddneddddddddddneddddddddddneddddddddddneddnnnnnndK","..KlKwwnndddlnddddnnddKddwddddddddddneddddddddddneddddddddddneddddddddddneddnnnnnndK","..KlKwwennnnnnnnnnndddKddndddddRddddnedddeeeedddnedddeeeedddnedddeeeedddneddnnnnnndK","..KKKKeeeennnnnnnddddKdddddddddrddddnedddnKKndddnedddnKKndddnedddnKKndddneddnoOYOoK.",".....KKneedddnddddddKddddddnKnddddddnedddnnnndddnedddnnnndddnedddnnnndddneddnooOooK.",".....KKKKdddddddddKKddwddddnKnddddddneddddddddddneddddddddddneddddddddddneddnnnnnnK.","........KKKKKdKKKKnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnndnnnnnnK.","........KleeeKeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeednnnnnnK.","..KKKKKKddddddddddddddddddddddddddddneddddddddddneddddddddddneddddddddddneddnnnnnnK.","..KlYlllYYYdddYddddddddddddddddddlddnedldddddlddnedldddddlddnedldddddlddnedlnoOYOoK.","..KlYYdddYYYddddddeKdddddeKdddddeKddneddddddddddneddddddddddneddddddddddneddnooOooK.","..KlyyynnnyyynddndndndndndndndndndndnendndeKndndnendndeKndndnendndeKndndnendnnnnnnnK","..KKKKKKKKKKKKdndndndndndndndndndndnnddndndndndnnddndndndndnnddndndndndnnddnnnnnnndK","..............KennnnnnnnnnnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnK","..............KennnnnnnnnnnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnK","..............KennnnnnnnnnnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnnndnnnoOYOonK","..............KKKKKKKKKKKKnnnnnnnnnnndKKKKnnnnnnKKKKnnnnnnKKKKnnnnnnKKKKndnnnooOoonK","..........................KennnnnnnnndOOOOnnnnnnOOOOnnnnnnOOOOnnnnnnOOOOndnnnnnnnnK.","..........................KennnnnnnnndoooonnnnnnoooonnnnnnoooonnnnnnoooondnnnnnnnnK.","..........................KKKKKKKKnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnK.","..................................KldddddddddddddddddddddddddddddddddddddddnnKKKKKK.","..................................KendnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnnndnnK.......","..................................KendnennnnnennndnennnnnennndnennnnnennndneK.......","..................................KendnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnnndnnK.......","..................................KendnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnnnnnnK.......","..........................KKKKKKKKnnnnnnnnnKKKnnnnnnnnnnnnnnnnnnnnnnnKKKKKKKK.......","..........................KeeeeeeennnnnnnnK...KennKnnnnKnnnnKnnnnKnnK...............","..........................KKKKKKKKKKKKKKKKK...KennKnnnnKnnnnKnnnnKnnK...............","..............................................KKKKKKnnnKnnnnKnnnnKKKK...............","....................................................KennKnnnKnnnK...................","....................................................KennKnnnKnnnK...................","....................................................KKKKnnnnnKKKK...................","........................................................KennK.......................","........................................................KKKKK......................."],
      pal: {"K":"#10141c","W":"#f8f8f8","w":"#c8d0d8","l":"#98a0ac","e":"#687080","d":"#3c4250","n":"#262c3a","O":"#f89020","o":"#b85010","Y":"#f8d838","y":"#b09018","R":"#f04858","r":"#982838","C":"#78d8f8","c":"#2890c0"},
    },
    "core0": {
      rows: [".....KKKKKK.....","...KKwWWwleKK...","..KwWrRRRRrleK..",".KwWRRWWRRRrleK.",".KwRWWWWWRRRrdK.","KwRRWWWWWRRRrrdK","KlRRWWWWRRRRrrdK",".KeRRWWRRRRrrdK.",".KeRRRRRRRrrrdK.","..KerRRRRrrrdK..","...KKdrrrrdKK...",".....KKKKKK....."],
      pal: {"K":"#10141c","W":"#f8f8f8","w":"#c8d0d8","l":"#98a0ac","e":"#687080","d":"#3c4250","R":"#f04858","r":"#982838"},
    },
    "core1": {
      rows: [".....KKKKKK.....","...KKwWwlleKK...","..KwWrrRRrrleK..",".KwWrRRRRRrrleK.",".KwRRWWWRRRrrdK.","KwRrRWWWRRRrrrdK","KlRrRWWWRRRrrrdK",".KeRRWWRRRrrrdK.",".KeRrRRRRrrrrdK.","..KerrRRrrrrdK..","...KKdrrrrdKK...",".....KKKKKK....."],
      pal: {"K":"#10141c","W":"#f8f8f8","w":"#c8d0d8","l":"#98a0ac","e":"#687080","d":"#3c4250","R":"#f04858","r":"#982838"},
    },
    "pellet": {
      rows: ["..yYWWW.",".yYWWWWW","..yYWWW."],
      pal: {"W":"#f8f8f8","Y":"#f8d838","y":"#b09018"},
    },
    "double": {
      rows: ["..CC..",".CWWC.","CWWWCc","CWWCcc",".CCcc.","..cc.."],
      pal: {"W":"#f8f8f8","C":"#78d8f8","c":"#2890c0"},
    },
    "laser": {
      rows: ["...cCCCCCCCCCCCCCCCCCCCCCCc...",".cCWWWWWWWWWWWWWWWWWWWWWWWWCc.","...cCCCCCCCCCCCCCCCCCCCCCCc..."],
      pal: {"W":"#f8f8f8","C":"#78d8f8","c":"#2890c0"},
    },
    "missile": {
      rows: ["..KKKKKK.","OYKwlleWW","oYKdeedWK","..KKKKK.."],
      pal: {"K":"#10141c","W":"#f8f8f8","w":"#c8d0d8","l":"#98a0ac","e":"#687080","d":"#3c4250","O":"#f89020","o":"#b85010","Y":"#f8d838"},
    },
    "ebullet": {
      rows: ["..MM..",".WWMM.","MWWMMm","MMMMmm",".Mmmm.","..mm.."],
      pal: {"M":"#e858c8","m":"#903078","W":"#f8f8f8"},
    },
    "capsule0": {
      rows: ["...KKKKKK...","..KRRWWRrK..",".KRWWRRRRrK.","KRWWRRRRRrrK","KRRRRRRRRrrK","KRRRRRrRRrrK","KrRRRRRrrrrK",".KwRRRrrrrK.","..KrrrrrrK..","...KKKKKK..."],
      pal: {"K":"#10141c","W":"#f8f8f8","w":"#c8d0d8","R":"#f04858","r":"#982838"},
    },
    "capsule1": {
      rows: ["...KKKKKK...","..KOYWWYoK..",".KOWWYOOOoK.","KYWWYOOOOooK","KYOOOOOOOooK","KOOOOOyOOooK","KoOOOOOooooK",".KwOOOooooK.","..KooooooK..","...KKKKKK..."],
      pal: {"K":"#10141c","W":"#f8f8f8","w":"#c8d0d8","Y":"#f8d838","y":"#b09018","O":"#f89020","o":"#b85010"},
    },
    "option0": {
      rows: [".....KKKK.....","...KKYYYOKK...","..KYWWYYOOoK..",".KYWWWYOOOooK.",".KYYWWYOOOooK.","KyYYYYOOOOoorK",".KyYYOOOOoorK.",".KoOOOOooorrK.","..KoOOooorrK..","...KKoorrKK...",".....KKKK....."],
      pal: {"K":"#10141c","W":"#f8f8f8","Y":"#f8d838","y":"#b09018","O":"#f89020","o":"#b85010","r":"#982838"},
    },
    "option1": {
      rows: [".....KKKK.....","...KKYWWYKK...","..KYYWWWYOoK..",".KyYYWWYYOOoK.",".KoYYYYOOOOoK.","KoYYYYOOOOOorK",".KoYYOOOOOorK.",".KoOOOOooorrK.","..KoOOooorrK..","...KKoorrKK...",".....KKKK....."],
      pal: {"K":"#10141c","W":"#f8f8f8","Y":"#f8d838","y":"#b09018","O":"#f89020","o":"#b85010","r":"#982838"},
    },
    "ex0": {
      rows: ["...WW...",".W.WWW..","..WWWW.W","WWWWYWW.",".WWYWWWW","W.WWWW..","..WWW.W.","...WW..."],
      pal: {"W":"#f8f8f8","Y":"#f8d838"},
    },
    "ex1": {
      rows: ["....O..O....","..O.OYYO....","...OYYYYO...",".O.OYWWYYO..",".OYYWWWWYO..","OYYWWYWWYYO.",".OYWWWWWWYO.",".OYYWWWWYO.O","..OYYWWYYO..","...OYYYYO...","..O.OYYO.O..",".....O..O..."],
      pal: {"W":"#f8f8f8","Y":"#f8d838","O":"#f89020"},
    },
    "ex2": {
      rows: ["...o..W..o......","....oOOOOOOo..o.","...oOOYWYYOOo...","..oOOYYYYYYOOoo.",".oOOYY....YYOOo.","ooOOY......YOOo.",".oOY........YOoo","oOOY........YOOo","roOY........YOor",".ooY........Yoo.","oooOY......YOoo.",".ooOYY....YYOoor","..ooOYYYYYYOoo..","...ooOYWYYOoo...","..o.ooOOOOoo....","......o..o...o.."],
      pal: {"W":"#f8f8f8","Y":"#f8d838","O":"#f89020","o":"#b85010","r":"#982838"},
    },
    "ex3": {
      rows: [".lle...lee....","leddel.ledde..","ledde..eddd.e.",".ee.o...ee....","....O..o...ll.",".le...o..ledde","ledde....edd..",".lee......e..."],
      pal: {"l":"#98a0ac","e":"#687080","d":"#3c4250","O":"#f89020","o":"#b85010"},
    },
    "planetBlue": {
      rows: ["..........................KKKKKKKKK..........................","......................KKKKKKKKKKKKKKKKK......................","...................KKKKK0000000000000KKKKK...................",".................KKK000000000000000000100KKK.................","...............KKK0000000000000000000000000KKK...............",".............KKK10101120202020202020202020202KKK.............","............KKK1010202020202120202020202020202KKK............","...........KK11112222222222222222223222222222222KK...........","..........KK1112222222222222222222222222223222222KK..........",".........KK111222232222222222222222222222222222223KK.........","........KK11122222222222232222222222222222222222222KK........",".......KK1112222222222222222222232222222222222222222KK.......","......KK211222222222222222222222222222232222222222222KK......",".....KK11122222322222222222222222222222222222232222222KK.....",".....KK01121212121212131212121212121212121212121212122KK.....","....KK0112121212121212121212131212121333121212121212121KK....","....K100111111111111111111111111111133232111111111111121K....","...KK001111121111111111111111111111332212212111111111212KK...","...K00011111111111121111111111111113221112111111112121212K...","..KK00111111111111111111112111111113311122111111111212122KK..","..K2021313131313131313131313131314132212231313131323232424K..","..K0213132313131313131313131313131313222413131313232324242K..",".KK2233333333333433333333333333333333333333333344343444444KK.",".KK2233333333333333333343333333333333333333333343434445444KK.",".K223333333333333333333333333343333333333333334343444444444K.",".K223343333333333333333333333333333334333333343434444444444K.","KK203131313132313131313131313131313131313131514142424242424KK","KK021313131313131313231313131313131313131314141424252424242KK","KK001111111111111111111111121111111111111121212222222222224KK","KK011111111111111111111111111111112111111212122222222222232KK","KK001111112111111111111111111111111111112221222222222222323KK","KK001111111111111211111111111111111111121212222232222223233KK","KK011212121212121212444442121212121212222223232323232334343KK","KK102121212121212124433343212122212122222232323232323333434KK","KK122223222222222244333323322222222232423333333333334344444KK",".K222222222222322243333222322222222323233333343333343444444K.",".K222222222222222243332222322222223232333333333333435444444K.",".KK2222222222222224332222132322223232333333333333434444444KK.",".KK2322222222222224422221332222232333333333333334344444444KK.","..K2222222232222222332213322222323233333334333343444444444K..","..K3232323232323233333333323233333343434343434444545454545K..","..KK32323232323232323232333233333343434343434444545454545KK..","...K33333333333333333333333343435444444444445455555555555K...","...KK333433333333333333333343434444444454445455555555555KK...","....K333333333343333333333434344444444444454555555555555K....","....KK3333333333333333433434344444444444454555555555555KK....",".....KK33333333333333333434345444444444454555555555555KK.....",".....KK34343434343434344444454545454545555555555555555KK.....","......KK343444343434344444454545454545555555555555555KK......",".......KK4444444444545454555555555555555555555555555KK.......","........KK44444444445454555555555555555555555555555KK........",".........KK444444445454555555555555555555555555555KK.........","..........KK4444445454555555555555555555555555555KK..........","...........KK44455454555555555555555555555555555KK...........","............KKK4545455555555555555555555555555KKK............",".............KKK45455555555555555555555555555KKK.............","...............KKK5555555555555555555555555KKK...............",".................KKK555555555555555555555KKK.................","...................KKKKK5555555555555KKKKK...................","......................KKKKKKKKKKKKKKKKK......................","..........................KKKKKKKKK.........................."],
      pal: {"0":"#d8f0f8","1":"#78d8f8","2":"#2890c0","3":"#3878f8","4":"#1c3878","5":"#0c1c44","K":"#10141c"},
    },
    "planetOrange": {
      rows: ["...............KKKKKKK...............","............KKKKKKKKKKKKK............","..........KKK00000000111KKK..........","........KKK000010000111111KKK........",".......KK0000011111111211111KK.......","......KK000111111111111111111KK......",".....KK00010101010101010101010KK.....","....KK0001011101010101010101010KK....","...KK000000222000001000000000000KK...","...K00000221112100000000001000000K...","..KK00000211110100000000000000001KK..","..K0000021111000100000000000000101K..",".KK0000021110000100000000000001011KK.",".K000000211000001000000100000101111K.",".K000101020000010101013331011122121K.","KK001020111000111010333233311121212KK","KK001111111111111113322222322222222KK","KK001111111111111113222222132222222KK","KK001111111111111133222221233222223KK","KK011111111111111132222212213222233KK","KK021212122212121233222122233323333KK","KK212121212121212223221222133233334KK",".K222222222222222223312221333343444K.",".K222222222224442223233133333434444K.",".KK2222322224444323233333333434444KK.","..K2222222244332342333333334344444K..","..KK23232324432243343434344444444KK..","...K32323234422334434343444444444K...","...KK333333333434444444444444444KK...","....KK3333343434444444444444444KK....",".....KK33333434444444444444444KK.....","......KK333434444444444444444KK......",".......KK3434444444444444444KK.......","........KKK444444444444444KKK........","..........KKK44444444444KKK..........","............KKKKKKKKKKKKK............","...............KKKKKKK..............."],
      pal: {"0":"#f8d838","1":"#f89020","2":"#b85010","3":"#982838","4":"#601c08","K":"#10141c"},
    },
    "terrain": {
      rows: ["................................................","......................................w.ww......",".................w..w..............wwwlwld......","........w.ww..w.wlw.w.ww...........wllllllw.....",".....wwwe.wlwwe.wllwlwle..........wllleleee.w...","....wllllwlllllwlelKelllw.w.....w.wddddeeelwe...","..w.KllleeeellelddeKeleelwe.....wwleeedeeedle.w.","wwlwKeeedldededleeeKedddlle.wwwwllKededeeeeldwlw","llllKdeddddKddddededKdeeelewlllldlKeddddeKedelll","lldldKdddddKdddddddddededYdKllelddKddddddKeddldl","dddddddYdddKddddddeddddddddKdddddddKdddddKdKdCdd","KdddddddddKdKdKdddddddKddeKKKdKCdddKddKdKdKKKdKd","KKdKdKKdKKKKKKKdCddKdKKKKdKKKKdKKddKdKYKKdKdKKdK","dKKdKKKKdKKdKdKKdKKKKdKKdKdKKdKKKKdKKdKdKKdKKKKd","KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK"],
      pal: {"K":"#10141c","w":"#c8d0d8","l":"#98a0ac","e":"#687080","d":"#3c4250","Y":"#f8d838","C":"#78d8f8"},
    },
    "shield0": {
      rows: [".....BC","....BC.","....BC.","...BC..","..BC...","..BC...",".BC....",".BC....",".BC....","BC.....","BC.....","BC.....","BC.....","BC.....","BC.....","BC.....","BC.....",".BC....",".BC....",".BC....","..BC...","..BC...","...BC..","....BC.","....BC.",".....BC"],
      pal: {"B":"#3878f8","C":"#78d8f8"},
    },
    "shield1": {
      rows: [".....Bb","....Bb.","....Bb.","...Bb..","..Bb...","..Bb...",".Bb....",".Bb....",".Bb....","Bb.....","Bb.....","Bb.....","Bb.....","Bb.....","Bb.....","Bb.....","Bb.....",".Bb....",".Bb....",".Bb....","..Bb...","..Bb...","...Bb..","....Bb.","....Bb.",".....Bb"],
      pal: {"B":"#3878f8","b":"#1c3878"},
    },
    "zakoCyan": {
      rows: ["............KK....","...........KAaK...","..........KAAaK...","....KKKKKKAAAaaK..","..KKAWWAAAAAAaaK..",".KACCAAAAlwlAAaaK.","KACcAAaAAlelAeeKo.","KKAeeAAAAAaaaaKYOo",".KKKKAAaaaKKKKKOo.","......KAAaaK......",".......KAaaK......","........KKKK......"],
      pal: {"K":"#10141c","A":"#3878f8","a":"#1c3878","W":"#f8f8f8","w":"#c8d0d8","l":"#98a0ac","e":"#687080","C":"#78d8f8","c":"#2890c0","O":"#f89020","o":"#b85010","Y":"#f8d838"},
    },
    "zakoMag": {
      rows: ["............KK....","...........KAaK...","..........KAAaK...","....KKKKKKAAAaaK..","..KKAWWAAAAAAaaK..",".KACCAAAAlwlAAaaK.","KACcAAaAAlelAeeKo.","KKAeeAAAAAaaaaKYOo",".KKKKAAaaaKKKKKOo.","......KAAaaK......",".......KAaaK......","........KKKK......"],
      pal: {"K":"#10141c","A":"#e858c8","a":"#903078","W":"#f8f8f8","w":"#c8d0d8","l":"#98a0ac","e":"#687080","C":"#78d8f8","c":"#2890c0","O":"#f89020","o":"#b85010","Y":"#f8d838"},
    },
    "zakoRed": {
      rows: ["............KK....","...........KAaK...","..........KAAaK...","....KKKKKKAAAaaK..","..KKAWWAAAAAAaaK..",".KACCAAAAlwlAAaaK.","KACcAAaAAlelAeeKo.","KKAeeAAAAAaaaaKYOo",".KKKKAAaaaKKKKKOo.","......KAAaaK......",".......KAaaK......","........KKKK......"],
      pal: {"K":"#10141c","A":"#f04858","a":"#982838","W":"#f8f8f8","w":"#c8d0d8","l":"#98a0ac","e":"#687080","C":"#78d8f8","c":"#2890c0","O":"#f89020","o":"#b85010","Y":"#f8d838"},
    },
    "trackerRed": {
      rows: [".K...KKKK...K.","..KKhhhGGGKK..","..KhWWhGGGgK..","..KhWhGGGGgK..",".KhhGGdddGggK.",".KhGGdWkkdggK.",".KGGGdkRkdggK.",".KGgGdkkkdgfK.","..KGGGdddgfK..","..KGGggfgffK..","..KKggggffKK..",".K...KKKK...K."],
      pal: {"K":"#10141c","G":"#f04858","g":"#982838","h":"#f89aa4","f":"#5c1420","d":"#3c4250","k":"#202634","W":"#f8f8f8","R":"#f04858","e":"#687080"},
    },
    "turretRed": {
      rows: [".........KKKKKK.......",".......KQWWQPPPpK.....","......KQWQQPPpPPpK....",".....KQQQPPPPpPPRpK...","KKK.KQPPPPwPPpPPrppK..","KwlKKKKKKpPPPpPPPppK..","KklwllllKpPPPpPPPPpK..","KkeeeeeeKppPPpPPPPpK..","KeeKKKKKKppPPpPPPppK..","KKK.KPPPpPPppppppppK..","....KKKKKKKKKKKKKKKK..",".....KlllllleeeeeeK...","...KleedeedeedeedeedK.","..KeddKKdddKKdddKKdddK","..KdddKKdddKKdddKKdddK","..KKKKKKKKKKKKKKKKKKKK"],
      pal: {"K":"#10141c","P":"#f04858","p":"#982838","Q":"#f8a0a8","W":"#f8f8f8","w":"#c8d0d8","l":"#98a0ac","e":"#687080","d":"#3c4250","k":"#1c2230","R":"#f04858","r":"#982838"},
    },
    "ebulletY": {
      rows: ["..MM..",".WWMM.","MWWMMm","MMMMmm",".Mmmm.","..mm.."],
      pal: {"M":"#f8d838","m":"#b09018","W":"#f8f8f8"},
    },
    "shipWhite": {
      rows: ["......KKK.............................",".....KWwlK............................","......KWwlK...........................",".......KWwlK......KKKKKK..............","........KWwlK....KCWCcccK.............",".....KKKWWWWWKKKKCCCcccbK.............","KKKKKwWWWeWWWWeWWwwwwwwwWKKKKK........","KOoodwwwwwwwwwewwwlllwwwweYywwKKKKK...","KYOodlRRRRRRRRrRRRRRRRRRrllllllllwlKKK","KooodeeeeeoOoedeeeeeeeeedeeeeeKKKKK...","KKKKKdddedddddddddeddddddKKKKK........",".....KKKKKKKKKKKKKKKKKKKK.............","........KwwllleeKKK..KeedK............",".......KwlleeKKK......KKK.............","......KleeKKK.........................",".....KeeKK............................","....KKKK.............................."],
      pal: {"K":"#f8f8f8","W":"#f8f8f8","w":"#f8f8f8","l":"#f8f8f8","e":"#f8f8f8","d":"#f8f8f8","C":"#f8f8f8","c":"#f8f8f8","b":"#f8f8f8","R":"#f8f8f8","r":"#f8f8f8","O":"#f8f8f8","o":"#f8f8f8","Y":"#f8f8f8","y":"#f8f8f8"},
    },
    "bossWhite": {
      rows: ["..................................................KKKKKKKKKKKKK.....................","............................................KKK...KWRRWWWWWWWWK.....................","............................................KWK...KwwwwwwwwwwwK.....................","............................................KwwKKKwwwwwwwwwwwwwKKKK.................","............................................KwwWWWCCwwCCwwCCwwCCWWK.................","....................................KKKKKKKKwwwwwwccwwccwwccwwccwwK.KKKKKKK.........","............................KKKKKKKKWWWWWWWWwwwwwwwwwwwwwwwwwwwwwwK.KWWWWWK.........","............................KWWWWWWWwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwK.KwllllK.........","............................KKKKKKllwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwKwwwwwwwKK.......","..................................KwewnnnnwwwwnnnnwwwwnnnnwwewnnnnwWwwnnnnwWK.......","..................................KwewKKKKwwwwKKKKwwwwKKKKwwewKKKKwwwwKKKKwwK.......","..................................KwewnnnnwwwwnnnnwwwwnnnnwwewnnnnwwwwnnnnwwK.......","..................................KwlllllllllllllllllllllllllllllllllllllllwK.......","..................................KwewwlwlwlwlwlewwlwlwlwlwlewwlwlwlwlwlewwlK.......","..........................KKKKKKKKlwdwlwlwlwlwlwdwlwlwlwlwlwdwlwlwlwlwlwdwlwlKKK....","..........................KWRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRllWWK....","..........................KwrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrldeeeKKK.","..............KKKKKKKKKKKKlllllllllldwlllllllllldwlllllllllldwlllllllllldwlldeeeWWK.","..............KWWWWWWWWWWWlllllllllldwlllllllllldwlllllllllldwlllllllllldwlldeeeeeK.","..............KwlllllllllllllllllllldwlllllllllldwlllllllllldwlllllllllldwlldeeeeeK.","..............KwdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddldoOYOoK.","..KKKKKKKKKKKKllwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwldooOooK.","..KWYYYlllYYYldllllllllllllllllllllldwlllllllllldwlllllllllldwlllllllllldwlldeeeeelK","..KwdYYYdddYYYdlllwdlllllwdlllllwdlldwlwlllllwlldwlwlllllwlldwlwlllllwlldwlwdeeeeelK","..KwnnyyydddyyyllllllllllllllllllllldwlllllllllldwlllllllllldwlllllllllldwlldeeeeelK","..KKKKKKleleleleleleleleleleleleleledlleleleleledlleleleleledlleleleleledlleddededlK","........KweleKelelelelelelelelelelelnwelelelelelnwelelelelelnwelelelelelnwelnoOYOoeK","........KKKKKWKKKKeeeeeeeeenKneeeeeenleeeeeeeeeenleeeeeeeeeenleeeeeeeeeenleenooOooeK",".....KKKKWWWWWWWWwKKeeweeeenKneeeeeenleeelllleeenleeelllleeenleeelllleeenleendddddK.",".....KKWWWWWWnWWwwwwKeneeeeeeeeeeeeenleeedKKdeeenleeedKKdeeenleeedKKdeeenleendddddK.","..KKKKWWWWnnnKnnnwwweKeeeeeeeeeReeeenleeeddddeeenleeeddddeeenleeeddddeeenleendddddK.","..KWKWWWnnKKKKKKKnneeeKeeeeeeeereeeenleeeeeeeeeenleeeeeeeeeenleeeeeeeeeenleendddddK.","..KwKWWnnKKKKKKKKKnneeKeeweeeeeeeeeenleeeeeeeeeenleeeeeeeeeenleeeeeeeeeenleenoOYOoK.",".KwKWWWnKKKKKKKKKKKneedKnnnnKnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnenooOooK.",".KwKWWnKKKKKKKKKKKKKnddKlllnKnlllllllllllllllllllllllllllllllllllllllllllllendddddK.",".KwKWWnKKKKKKKKKKKKKnddKeeeeeeeeeeeenleeeeeeeeeenleeeeeeeeeenleeeeeeeeeenleendddddK.",".KwKWWnKKKKKKKKKKKKKnddKeeeeeeeeeweenlewnnnnnweenleweeeeeweenleweeeeeweenlewndddddK.",".KKWWnKKKKKKKKKKKKKKKnddKeweeeeeeeeenleeKKKKKeeenleeeeeeeeeenleeeeeeeeeenleendddddK.",".KwKWWnKKKKKKKKKKKKKnddKeeneeeeeeeeenleennnnneeenleeeeeeeeeenleeeeeeeeeenleenoOYOoeK",".KwKWWnKKKKKKKKKKKKKnddKedenKnedededneedededededneedededededneedededededneednooOooeK",".KlKWwnKKKKKKKKKKKKKnddKdednKndededenldededededenldededededenldededededenldendndnddK",".KlKwwwnKKKKKKKKKKKndddKddddddddddddneddddddddddneddddddddddneddddddddddneddnnnnnndK","..KlKwwnnKKKKKKKKKnnddKddwddddddddddneddddddddddneddddddddddneddddddddddneddnnnnnndK","..KlKwwennKKKKKKKnndddKddndddddRddddnedddeeeedddnedddeeeedddnedddeeeedddneddnnnnnndK","..KKKKeeeennnKnnnddddKdddddddddrddddnedddnKKndddnedddnKKndddnedddnKKndddneddnoOYOoK.",".....KKneedddnddddddKddddddnKnddddddnedddnnnndddnedddnnnndddnedddnnnndddneddnooOooK.",".....KKKKdddddddddKKddwddddnKnddddddneddddddddddneddddddddddneddddddddddneddnnnnnnK.","........KKKKKdKKKKnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnndnnnnnnK.","........KleeeKeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeednnnnnnK.","..KKKKKKddddddddddddddddddddddddddddneddddddddddneddddddddddneddddddddddneddnnnnnnK.","..KlYlllYYYdddYddddddddddddddddddlddnedldddddlddnedldddddlddnedldddddlddnedlnoOYOoK.","..KlYYdddYYYddddddeKdddddeKdddddeKddneddddddddddneddddddddddneddddddddddneddnooOooK.","..KlyyynnnyyynddndndndndndndndndndndnendndeKndndnendndeKndndnendndeKndndnendnnnnnnnK","..KKKKKKKKKKKKdndndndndndndndndndndnnddndndndndnnddndndndndnnddndndndndnnddnnnnnnndK","..............KennnnnnnnnnnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnK","..............KennnnnnnnnnnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnK","..............KennnnnnnnnnnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnnndnnnoOYOonK","..............KKKKKKKKKKKKnnnnnnnnnnndKKKKnnnnnnKKKKnnnnnnKKKKnnnnnnKKKKndnnnooOoonK","..........................KennnnnnnnndOOOOnnnnnnOOOOnnnnnnOOOOnnnnnnOOOOndnnnnnnnnK.","..........................KennnnnnnnndoooonnnnnnoooonnnnnnoooonnnnnnoooondnnnnnnnnK.","..........................KKKKKKKKnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnK.","..................................KldddddddddddddddddddddddddddddddddddddddnnKKKKKK.","..................................KendnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnnndnnK.......","..................................KendnennnnnennndnennnnnennndnennnnnennndneK.......","..................................KendnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnnndnnK.......","..................................KendnnnnnnnnnnndnnnnnnnnnnndnnnnnnnnnnnnnnK.......","..........................KKKKKKKKnnnnnnnnnKKKnnnnnnnnnnnnnnnnnnnnnnnKKKKKKKK.......","..........................KeeeeeeennnnnnnnK...KennKnnnnKnnnnKnnnnKnnK...............","..........................KKKKKKKKKKKKKKKKK...KennKnnnnKnnnnKnnnnKnnK...............","..............................................KKKKKKnnnKnnnnKnnnnKKKK...............","....................................................KennKnnnKnnnK...................","....................................................KennKnnnKnnnK...................","....................................................KKKKnnnnnKKKK...................","........................................................KennK.......................","........................................................KKKKK......................."],
      pal: {"K":"#f8f8f8","W":"#f8f8f8","w":"#f8f8f8","l":"#f8f8f8","e":"#f8f8f8","d":"#f8f8f8","n":"#f8f8f8","O":"#f8f8f8","o":"#f8f8f8","Y":"#f8f8f8","y":"#f8f8f8","R":"#f8f8f8","r":"#f8f8f8","C":"#f8f8f8","c":"#f8f8f8"},
    },
  };

  const SP = {};
  for (const [name, s] of Object.entries(SPRITE_DATA)) {
    SP[name] = makeSprite(s.rows, s.pal);
  }

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
