"use strict";  // 厳密なエラーチェックを行う

let isPlaying = false;
let tiles = [];  // タイル配列
let timer = NaN;
let startTime = null;

// タイルの初期配置
function init() {
  let table = document.getElementById("table");  // ③<table>要素の参照
  table.innerHTML = "";
  tiles = [];

  // indexはタイルの並び順で、valueはタイルに描画されている数値
  for (let i = 0; i < 3; i++) {                  // 3行分ループ
    let tr = document.createElement("tr");       // <tr>要素の作成
    for (let j = 0; j < 3; j++) {                // 各列分ループ(3タイルずつ)
      let td = document.createElement("td");     // <td>要素の作成
      let index = i * 3 + j;
      td.className = "tile";                     // classの設定
      td.index = index;                          // タイルの並び順
      td.value = index;                          // 描画されている値
      td.textContent = index == 8 ? "" : index + 1;  // 8は空欄に
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
  if (i - 3 >= 0 && tiles[i - 3].value == 8) {
    swap(i, i - 3); moved = true;           // 上と入れ替え
    // 下にタイルが存在する場合に比較
  } else if (i + 3 < 9 && tiles[i + 3].value == 8) {
    swap(i, i + 3); moved = true;           // 下と入れ替え
    // 左にタイルが存在する場合に比較
  } else if (i % 3 != 0 && tiles[i - 1].value == 8) {
    swap(i, i - 1); moved = true;           // 左と入れ替え
    // 右にタイルが存在する場合に比較
  } else if (i % 3 != 2 && tiles[i + 1].value == 8) {
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
    moveTile(Math.floor(Math.random() * 9));
  }
}

// i番目のタイルとj番目のタイルの番号を入れ替える
function swap(i, j) {
  let tmp = tiles[i].value;                     // 変更先を一時退避
  tiles[i].value = tiles[j].value;
  tiles[j].value = tmp;
  tiles[i].textContent = tiles[i].value == 8 ? "" : tiles[i].value + 1;
  tiles[j].textContent = tiles[j].value == 8 ? "" : tiles[j].value + 1;
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
  const startButton = document.getElementById("start-button")

  if (table) {
    init()
  }

  if (startButton) {
    startButton.removeEventListener("click", startButtonClick);
    startButton.addEventListener("click", startButtonClick);
  }
}, { onse: false });

// puzzle.js 内のクリア判定が true になった時に呼ぶ
const sendScore = async (elapsedTime) => {
  const token = document.querySelector('meta[name="csrf-token"]').content;

  try {
    const response = await fetch("/scores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": token
      },
      body: JSON.stringify({
        score: {
          user_name: "ゲストユーザー",
          clear_time: Number(elapsedTime)
        }
      })
    });

    const data = await response.json();

    if (data.id) {
      alert("記録を保存しました！");
      window.location.href = "/scores";
    } else {
      alert("保存に失敗しました" + JSON.stringify(data));
    }

  } catch (error) {
    console.error(error);
    alert("ネットワークエラーが発生しました。もう一度お試しください。");
  }
};
