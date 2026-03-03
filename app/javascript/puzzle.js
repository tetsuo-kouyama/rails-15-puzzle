"use strict";  // 厳密なエラーチェックを行う

let isPlaying = false;
let tiles = [];  // タイル配列
let timer = NaN;
let startTime = null;
let gridSize;
let lastIndex;

// タイルの初期配置
function init() {
  let table = document.getElementById("table");  // ③<table>要素の参照
  table.innerHTML = "";
  tiles = [];

  // indexはタイルの並び順で、valueはタイルに描画されている数値
  for (let i = 0; i < gridSize; i++) {                  // 3行分ループ
    let tr = document.createElement("tr");       // <tr>要素の作成
    for (let j = 0; j < gridSize; j++) {                // 各列分ループ(3タイルずつ)
      let td = document.createElement("td");     // <td>要素の作成
      let index = i * gridSize + j;
      td.className = "tile";                     // classの設定
      td.index = index;                          // タイルの並び順
      td.value = index;                          // 描画されている値
      td.textContent = index === lastIndex ? "" : index + 1;  // 8は空欄に
      tr.appendChild(td);                        // ⑧行<tr>に列<td>を追加
      tiles.push(td);
    }
    table.appendChild(tr);                       // テーブルに行<tr>を追加
  }

  table.addEventListener("click", click);
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
  const btn = e.currentTarget;
  if (!isPlaying) {
    init();
    shuffle();
    startTime = new Date();
    timer = setInterval(tick, 1000)
    isPlaying = true;
    btn.innerText = "やりなおす"
    document.querySelector(".button").style.display = "none";
  } else {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    init();
    document.getElementById("time").textContent = "0";
    isPlaying = false;
    btn.innerText = "スタート"
    document.querySelector(".button").style.display = "inline";
  }
}

// どの場所がクリックされたか
function click(e) {
  if (!isPlaying) return;
  if (!e.target.classList.contains("tile")) return;

  const i = e.target.index;
  const moved = moveTile(i);

  if (moved) {
    if (checkWin()) {
      clearInterval(timer);
      finishGame(); // 終了処理を呼び出す
    }
  }
}

// クリア後の処理
function finishGame() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  isPlaying = false; // 終了状態にする

  const startButton = document.getElementById("start-button");
  if (startButton) startButton.innerText = "スタート";

  const elapsedTime = document.getElementById("time").textContent;
  sendScore(elapsedTime);
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
}

 // 経過時間計測用タイマー（１秒ごとに実行）
function tick() {
  let now = new Date();
  let elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
  document.getElementById("time").textContent = elapsed; // 経過時間を表示
}

// クリアを判定する関数
function checkWin() {
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i].value !== i) {
      return false;
    }
  }
  return true;
}
// Turboによるページ遷移完了時に処理を実行するイベントハンドラ
document.addEventListener("turbo:load", () => {
  const table = document.getElementById("table");
  const startButton = document.getElementById("start-button");
  const infoElement = document.getElementById("game-info");

  if (!infoElement) return;
  gridSize = parseInt(infoElement.dataset.gridSize, 10);
  lastIndex = gridSize * gridSize - 1;

  init();

  if (startButton) {
    startButton.removeEventListener("click", startButtonClick);
    startButton.addEventListener("click", startButtonClick);
  }
});

// クリア判定が true になった時に呼ぶ
const sendScore = async (elapsedTime) => {
  const token = document.querySelector('meta[name="csrf-token"]').content;
  const infoElement = document.getElementById("game-info");
  const difficulty = Number(infoElement.dataset.difficulty);

  try {
    const response = await fetch("/scores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": token
      },
      body: JSON.stringify({
        score: {
          clear_time: Number(elapsedTime),
          difficulty: difficulty
        }
      })
    });

    if (response.ok) {
      // 保存成功後、その難易度のランキングページへ遷移
      window.location.href = `/scores?difficulty=${difficulty}`;
    } else {
      console.error("保存に失敗しました");
    }
  } catch (error) {
    console.error("通信エラー:", error);
  }
};
