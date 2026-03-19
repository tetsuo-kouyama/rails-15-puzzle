"use strict";  // 厳密なエラーチェックを行う

let isPlaying = false;  // ゲームプレイ中フラグ
let tiles = [];         // タイル配列
let timer = null;       // タイマー(停止用)
let startTime = null;   // 開始時刻
let gridSize = 0;       // パズルの1辺の値(3,4,5)
let lastIndex = 0;      // 空白マスのインデックス
let i18n = {};          // Railsから渡された翻訳データを格納する
let toastTimer;         // トースト表示の自動消去用タイマー

/*===================================
  Game Logic（盤面操作・判定・進行管理）
===================================*/

// (1) パズルのボードの初期化とタイルの生成
function init() {
  let board = document.getElementById("puzzle-board");
  const tileImageUrl = board.dataset.tileImageUrl;
  board.innerHTML = "";
  tiles = [];

  board.style.setProperty('--grid-size', gridSize);

  for (let i = 0; i < gridSize * gridSize; i++) {
    let row = Math.floor(i / gridSize);
    let col = i % gridSize;
    let tile = document.createElement("div");
    tile.className = "tile";
    tile.style.backgroundImage = `url('${tileImageUrl}')`;
    tile.dataset.index = i; // タイルの正解位置を保持
    tile.value = i;

    if (i === lastIndex) {
      tile.classList.add("empty");
      tile.textContent = "";
    } else {
      tile.textContent = i + 1;
    }

    board.appendChild(tile);
    tiles.push(tile);
  }
  // イベントリスナーの重複登録を防ぐため、一度削除してから登録
  board.removeEventListener("click", click);
  board.addEventListener("click", click);
}

// (2) 指定されたタイルが空白に隣接していれば入れ替える
function moveTile(i) {
  let moved = false;
  // 上にマスが存在し、そのマスが空白（valueがlastIndex）なら入れ替え
  if (i - gridSize >= 0 && tiles[i - gridSize].value === lastIndex) {
    swap(i, i - gridSize); moved = true;
  // 下にマスが存在し、そのマスが空白（valueがlastIndex）なら入れ替え
  } else if (i + gridSize < tiles.length && tiles[i + gridSize].value === lastIndex) {
    swap(i, i + gridSize); moved = true;
  // 左にマスが存在し、そのマスが空白（valueがlastIndex）なら入れ替え
  } else if (i % gridSize != 0 && tiles[i - 1].value === lastIndex) {
    swap(i, i - 1); moved = true;
  // 右にマスが存在し、そのマスが空白（valueがlastIndex）なら入れ替え
  } else if (i % gridSize != gridSize - 1 && tiles[i + 1].value === lastIndex) {
    swap(i, i + 1); moved = true;
  }
  return moved; // 移動したかを返す
}

// (3) スタート/リセットボタン押下時のハンドラ（ゲーム開始・リセット・タイマー制御）
function startButtonClick(e) {
  const startButton = e.currentTarget;
  if (!isPlaying) {  // スタート時
    init();
    shuffle();
    startTime = new Date();
    timer = setInterval(tick, 1000)
    isPlaying = true;
    startButton.textContent = i18n.resetButton;
  } else {           // リセット時
    if (timer) {
      stopTimer();
    }
    init();
    document.getElementById("time").textContent = "00:00";
    isPlaying = false;
    startButton.textContent = i18n.startButton;
  }
}

// (4) タイルクリック時のハンドラ（移動・クリア判定）
function click(e) {
  if (!isPlaying) return;
  if (!e.target.classList.contains("tile")) return;

  const i = Number(e.target.dataset.index);
  const moved = moveTile(i);

  if (moved) {
    if (checkWin()) {
      finishGame(); // 終了処理を呼び出す
    }
  }
}

// (5) クリア時の処理
function finishGame() {
  const startButton = document.getElementById("start-button");

  if (startButton) {
    startButton.textContent = i18n.startButton;
  }

  stopTimer();
  sendScore();
}

// (6) ランダムな合法手を繰り返してシャッフルする(常に解ける盤面になる)
function shuffle() {
  for (let i = 0; i < 1000; i++) {
    moveTile(Math.floor(Math.random() * tiles.length));
  }
}

// (7) タイルを入れ替える処理（i番目とj番目のタイルの値と表示を更新）
function swap(i, j) {
  let tmp = tiles[i].value;  // 変更先を一時退避
  tiles[i].value = tiles[j].value;
  tiles[j].value = tmp;
  tiles[i].textContent = tiles[i].value === lastIndex ? "" : tiles[i].value + 1;
  tiles[j].textContent = tiles[j].value === lastIndex ? "" : tiles[j].value + 1;
  tiles[i].classList.toggle("empty", tiles[i].value === lastIndex);
  tiles[j].classList.toggle("empty", tiles[j].value === lastIndex);
}

 // (8) 経過時間を更新する処理（１秒ごとに実行）
function tick() {
  let now = new Date();
  let elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
  const timeElement = document.getElementById("time");
  timeElement.textContent = formatTime(elapsed); // 経過時間を表示
  timeElement.dataset.seconds = elapsed;
}

// (9) 現在の秒数を 00:00 形式の文字列に変換する処理
function formatTime(totalSeconds) {
  totalSeconds = Math.floor(totalSeconds); // 小数点を切り捨てる
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // padStart(2, '0') を使うことで、1桁の時に 0 を埋める
  const m = String(minutes).padStart(2, '0');
  const s = String(seconds).padStart(2, '0');

  return `${m}:${s}`;
}

// (10) タイマーを停止する処理
function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
    isPlaying = false;
  }
}

document.addEventListener("turbo:before-visit", stopTimer);
document.addEventListener("turbo:before-cache", stopTimer);

// (11) すべてのタイルが正しい位置にあるかを判定（クリア判定）する処理
function checkWin() {
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i].value !== i) {
      return false;
    }
  }
  return true;
}

// (12) DOMに埋め込まれたゲーム設定（i18n・盤面サイズ）を取得する処理
function getGameSettings() {
  const master = document.getElementById("game-master");
  if (!master) return null;

  return {
    i18n: JSON.parse(master.dataset.i18n || "{}"),
    gridSize: parseInt(master.dataset.gridSize, 10),
  };
}

/*=================================================
  UI / Presentation（トースト表示・画面遷移・イベント）
=================================================*/

// (13) クリアメッセージを作成してトースト表示する処理
function showClearToast(elapsedTime, rank) {
  if (!i18n || !i18n.clearMessage) return;
  const timeText = formatTime(elapsedTime);
  const message = i18n.clearMessage
    .replace("%{rank}", rank)
    .replace("%{time}", timeText);

  displayToast(message);
}

// (14) トーストを表示する処理（メッセージ設定・エラースタイル切替・3秒後に自動非表示）
function displayToast(message, isError = false) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");

  if (!toast || !toastMessage) return;

  if (isError) {
    toast.classList.add("is-error");
  } else {
    toast.classList.remove("is-error");
  }

  toastMessage.textContent = message;
  toast.classList.add("is-visible");

  // 前のタイマーを止めて、表示時間をリセットする
  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    hideToast();
  }, 3000);  // 3秒間表示
}

// (15) トーストを非表示にして状態をリセットする処理
function hideToast() {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.classList.remove("is-visible");
  toast.classList.remove("is-error");

  clearTimeout(toastTimer);
}

// (16) ランキング画面に遷移する処理（Turbo対応・未対応時は通常遷移）
function redirectToRanking(difficulty, scoreId) {
  const url = `/scores?difficulty=${difficulty}&new_score_id=${scoreId}`;
  if (window.Turbo) {
    window.Turbo.visit(url);
  } else {
    window.location.href = url;
  }
}

// (17) ページ表示時の初期化処理（設定取得・ゲーム初期化・イベント再登録）
document.addEventListener("turbo:load", () => {
  const settings = getGameSettings();
  if (!settings) return;
  i18n = settings.i18n;
  gridSize = settings.gridSize;
  lastIndex = gridSize * gridSize - 1;

  init()

  const startButton = document.getElementById("start-button");
  if (startButton) {
    startButton.removeEventListener("click", startButtonClick);
    startButton.addEventListener("click", startButtonClick);
  }

  const closeButton = document.getElementById("close-toast");
  if (closeButton) {
    closeButton.removeEventListener("click", hideToast);
    closeButton.addEventListener("click", hideToast);
  }
});

// (18) クリア後の処理を行う（スコア送信・トースト表示・ランキング遷移）
const sendScore = async () => {
  const token = document.querySelector('meta[name="csrf-token"]').content;
  const container = document.getElementById("game-master");

  const timeElement = document.getElementById("time");
  if (!timeElement || !container) return;

  const seconds = Number(timeElement.dataset.seconds);
  const difficulty = Number(container.dataset.difficulty);
  let transitionTimer; // 遷移用のタイマー

  try {
    // スコアをサーバーに送信
    const response = await fetch("/scores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": token
      },
      body: JSON.stringify({
        score: {
          clear_time: seconds,
          difficulty: difficulty
        }
      })
    });

    if (response.ok) {
      const data = await response.json();  // サーバーから返されたJSONを受け取る

      // クリアメッセージを表示（順位・タイム）
      showClearToast(data.time, data.rank);

      transitionTimer = setTimeout(() => {
        redirectToRanking(difficulty, data.id);
      }, 3500)  // // トースト表示後、少し待ってランキング画面へ遷移

      const closeButton = document.getElementById("close-toast");
      if (closeButton) {
        closeButton.addEventListener("click", () => {
          // 閉じるボタン押下時は待たずに即遷移（タイマーはキャンセル）
          clearTimeout(transitionTimer);
          redirectToRanking(difficulty, data.id);
        }, { once: true });
      }
    } else {
      // 保存失敗時の処理
      stopTimer();
      console.error("Save failed");
      displayToast(i18n.saveError, true);
    }
  } catch (error) {
    // 通信エラー時の処理
    stopTimer()
    console.error("Communication error:", error.message);
    displayToast(i18n.networkError, true);
  }
};
