"use strict";  // 厳密なエラーチェックを行う

let isPlaying = false;
let tiles = [];  // タイル配列
let timer = NaN;
let startTime = null;
let gridSize;
let lastIndex;
let i18n = {};
let toastTimer;


function init() {
  let board = document.getElementById("puzzle-board"); // <table>ではなく<div>を想定
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
    tile.dataset.index = i; // カスタムデータ属性を使用
    tile.value = i;

    if (i === lastIndex) {
      tile.classList.add("empty");
      tile.textContent = "";
    } else {
      //tile.style.backgroundImage = `url(${window.tileImageUrl})`;
      tile.textContent = i + 1;
    }

    board.appendChild(tile);
    tiles.push(tile);
  }

  board.addEventListener("click", click); // イベントリスナー
}


function moveTile(i) {
  let moved = false;
  // index-3が0以上であるかを最初にチェックし、それがtrueの場合、
  // すなわち上にタイルが存在する場合に限り「tiles[i-3].value」が０か比較している
  if (i - gridSize >= 0 && tiles[i - gridSize].value === lastIndex) {
    swap(i, i - gridSize); moved = true;           // 上と入れ替え
    // 下にタイルが存在する場合に比較
  } else if (i + gridSize < tiles.length && tiles[i + gridSize].value === lastIndex) {
    swap(i, i + gridSize); moved = true;           // 下と入れ替え
    // 左にタイルが存在する場合に比較
  } else if (i % gridSize != 0 && tiles[i - 1].value === lastIndex) {
    swap(i, i - 1); moved = true;           // 左と入れ替え
    // 右にタイルが存在する場合に比較
  } else if (i % gridSize != gridSize - 1 && tiles[i + 1].value === lastIndex) {
    swap(i, i + 1); moved = true;           // 右と入れ替え
  }
  return moved; // 移動したかを返す
}

// ボタン押下時のハンドラ
function startButtonClick(e) {
  const startButton = e.currentTarget;
  if (!isPlaying) {
    init();
    shuffle();
    startTime = new Date();
    timer = setInterval(tick, 1000)
    isPlaying = true;
    startButton.textContent = i18n.resetButton;
  } else {
    if (timer) {
      stopTimer();
    }
    init();
    document.getElementById("time").textContent = "00:00";
    isPlaying = false;
    startButton.textContent = i18n.startButton;
  }
}


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

// クリア後の処理
function finishGame() {
  const startButton = document.getElementById("start-button");

  if (startButton) {
    startButton.textContent = i18n.startButton;
  }

  stopTimer();
  sendScore();
}

// タイルをシャッフル
function shuffle() {
  for (let i = 0; i < 1000; i++) {
    moveTile(Math.floor(Math.random() * tiles.length));
  }
}

// i番目のタイルとj番目のタイルの番号を入れ替える
function swap(i, j) {
  let tmp = tiles[i].value;                     // 変更先を一時退避
  tiles[i].value = tiles[j].value;
  tiles[j].value = tmp;
  tiles[i].textContent = tiles[i].value === lastIndex ? "" : tiles[i].value + 1;
  tiles[j].textContent = tiles[j].value === lastIndex ? "" : tiles[j].value + 1;
  tiles[i].classList.toggle("empty", tiles[i].value === lastIndex);
  tiles[j].classList.toggle("empty", tiles[j].value === lastIndex);
}

 // 経過時間計測用タイマー（１秒ごとに実行）
function tick() {
  let now = new Date();
  let elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
  const timeElement = document.getElementById("time");
  timeElement.textContent = formatTime(elapsed); // 経過時間を表示
  timeElement.dataset.seconds = elapsed;
}

// 現在の秒数を 00:00 形式の文字列にする関数
function formatTime(totalSeconds) {
  totalSeconds = Math.floor(totalSeconds); // 小数点を切り捨てる
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // padStart(2, '0') を使うと、1桁の時に 0 を埋める
  const m = String(minutes).padStart(2, '0');
  const s = String(seconds).padStart(2, '0');

  return `${m}:${s}`;
}

// ページ遷移時にタイマーを停止
function stopTimer() {
  if (!isNaN(timer)) {
    clearInterval(timer);
    timer = NaN;
    isPlaying = false;
  }
}

document.addEventListener("turbo:before-visit", stopTimer);
document.addEventListener("turbo:before-cache", stopTimer);

// クリアを判定する関数
function checkWin() {
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i].value !== i) {
      return false;
    }
  }
  return true;
}

// 共通データを取得する関数
function getGameSettings() {
  const master = document.getElementById("game-master");
  if (!master) return null;

  return {
    i18n: JSON.parse(master.dataset.i18n || "{}"),
    gridSize: parseInt(master.dataset.gridSize, 10),
  };
}

// メッセージを作る関数
function showClearToast(elapsedTime, rank) {
  if (!i18n || !i18n.clearMessage) return;
  const timeText = formatTime(elapsedTime);
  const message = i18n.clearMessage
    .replace("%{rank}", rank)
    .replace("%{time}", timeText);

  displayToast(message);
}

// トーストを表示するロジック
function displayToast(message) {
  const toast = document.getElementById("success-toast");
  const toastMessage = document.getElementById("toast-message");

  if (!toast || !toastMessage) return;

  toastMessage.textContent = message;
  toast.classList.add("is-visible");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    hideToast();
  }, 3000);
}

// トーストを隠す共通関数
function hideToast() {
  const toast = document.getElementById("success-toast");
  if (toast) toast.classList.remove("is-visible");

  clearTimeout(toastTimer);
}

// Turboによるページ遷移完了時に処理を実行するイベントハンドラ
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
    // ページ読み込み時に一度だけ「消す機能」をセット
    closeButton.removeEventListener("click", hideToast);
    closeButton.addEventListener("click", hideToast);
  }
});

// クリア判定が true になった時に呼ぶ
const sendScore = async () => {
  const token = document.querySelector('meta[name="csrf-token"]').content;
  const container = document.getElementById("game-master");
  
  const timeElement = document.getElementById("time");
  if (!timeElement || !container) return;

  const seconds = Number(timeElement.dataset.seconds);
  const difficulty = Number(container.dataset.difficulty);

  try {
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
      const data = await response.json();
      showClearToast(data.time, data.rank);
      // 保存成功後、その難易度のランキングページへ遷移
      setTimeout(() => {
        window.location.href = `/scores?difficulty=${difficulty}`;
      }, 3000);
    } else {
      const error = await response.json();
      console.error("保存に失敗しました");
    }
  } catch (error) {
    console.error("通信エラー:", error);
  }
};
