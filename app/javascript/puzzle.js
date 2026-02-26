"use strict";  // ①厳密なエラーチェックを行う

const tiles = [];  // タイル配列
let timer = NaN;
let startTime = null;

function init() {  // ②初期化を行う
  let table = document.getElementById("table");  // ③<table>要素の参照

  // indexはタイルの並び順で、valueはタイルに描画されている数値
  for (let i = 0; i < 3; i++) {                  // ④４行分ループ
    let tr = document.createElement("tr");       // ⑤<tr>要素の作成
    for (let j = 0; j < 3; j++) {                // ⑥各列分ループ(４タイルずつ)
      let td = document.createElement("td");     // ⑦<td>要素の作成
      let index = i * 3 + j;
      td.className = "tile";                     // classの設定
      td.index = index;                          // タイルの並び順
      td.value = index;                          // 描画されている値
      td.textContent = index == 8 ? "" : index + 1;  // 8は空欄に
      //td.textContent = index == 15 ? "" : index;
      td.onclick = click;                        // クリック時のハンドラ登録
      tr.appendChild(td);                        // ⑧行<tr>に列<td>を追加
      tiles.push(td);
    }
    table.appendChild(tr);                       // テーブルに行<tr>を追加
  }

   // 1000回、擬似的にランダムにクリックして並べ替え
  for (let i = 0; i < 1000; i++) {
    click({ target: { index: Math.floor(Math.random() * 9) } });
  }

  alert("準備はいいですか？ スタート!");
  startTime = new Date();               // ゲーム開始時刻を保存
  timer = setInterval(tick, 1000);
}

function click(e) {                              // ⑨どの場所がクリックされたか
  let i = e.target.index                         // ⑩クリックしたindexを取得
  let moved = false;
  // index-4が0以上であるかを最初にチェックし、それがtrueの場合、
  // すなわち上にタイルが存在する場合に限り「tiles[i-4].value」が０か比較している
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

  if (moved && startTime !== null) {
    if (checkWin()) {
      clearInterval(timer);
      const elapsedTime = document.getElementById("time").textContent;
      sendScore(elapsedTime);
    }
  }
}

// i番目のタイルとj番目のタイルの番号を入れ替える関数
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
  const puzzle = document.getElementById("table");
  if (!puzzle) return;
  init();
});

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

