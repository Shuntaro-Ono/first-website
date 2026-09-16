/* ==========================================================================
   Shuntaro's Post Office — 挙動
   ========================================================================== */

(function () {
  "use strict";

  /* ---------- 時計 ---------- */

  function updateClock(el, timeZone) {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).formatToParts(now);

    const get = (type) => Number(parts.find((p) => p.type === type).value);
    const h = get("hour") % 24;
    const m = get("minute");
    const s = get("second");

    const hourDeg = (h % 12) * 30 + m * 0.5;
    const minuteDeg = m * 6 + s * 0.1;
    const secondDeg = s * 6;

    el.querySelector(".hour").style.transform = `rotate(${hourDeg}deg)`;
    el.querySelector(".minute").style.transform = `rotate(${minuteDeg}deg)`;
    el.querySelector(".second").style.transform = `rotate(${secondDeg}deg)`;
  }

  function startClocks() {
    const tokyo = document.getElementById("clockTokyo");
    const chiangMai = document.getElementById("clockChiangMai");
    const tick = () => {
      updateClock(tokyo, "Asia/Tokyo");
      updateClock(chiangMai, "Asia/Bangkok"); // Chiang Mai = same zone as Bangkok (ICT, UTC+7)
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- 棚 ---------- */

  function renderShelf() {
    const shelf = document.getElementById("shelf");
    shelf.innerHTML = SHELF_ITEMS.map((item) => `
      <div class="shelf-item">
        <div class="frame">
          <div class="frame-inner" data-fallback="${item.emoji || "🖼️"}">
            <img src="${item.image}" alt="${item.label}"
                 onerror="this.parentElement.textContent = this.parentElement.dataset.fallback; this.remove();">
          </div>
        </div>
        <div class="caption">${item.label}</div>
      </div>
    `).join("");
  }

  /* ---------- 郵便ボックス ---------- */

  function renderPostboxes() {
    const wrap = document.getElementById("postboxes");
    wrap.innerHTML = POST_BOX_NUMBERS.map((num, i) => `
      <div class="postbox${i === 0 ? " active" : ""}" data-num="${num}">
        <div class="slot-icon"></div>
        <div class="num">${num}</div>
      </div>
    `).join("");
  }

  function highlightPostbox(num) {
    document.querySelectorAll(".postbox").forEach((el) => {
      el.classList.toggle("active", el.dataset.num === num);
    });
  }

  /* ---------- ターミナル（名前 → ボックス番号） ---------- */

  let visitorName = "";

  function initTerminal() {
    const stepName = document.getElementById("stepName");
    const stepBox = document.getElementById("stepBox");
    const nameInput = document.getElementById("nameInput");
    const nameSubmit = document.getElementById("nameSubmit");
    const boxInput = document.getElementById("boxInput");
    const boxSubmit = document.getElementById("boxSubmit");
    const backToName = document.getElementById("backToName");
    const boxError = document.getElementById("boxError");

    function goToBoxStep() {
      const name = nameInput.value.trim();
      if (!name) {
        nameInput.focus();
        return;
      }
      visitorName = name;
      stepName.classList.add("hidden");
      stepBox.classList.remove("hidden");
      boxInput.value = "";
      boxError.classList.add("hidden");
      boxInput.focus();
    }

    function goToNameStep() {
      stepBox.classList.add("hidden");
      stepName.classList.remove("hidden");
      nameInput.focus();
    }

    function findLetter(name, box) {
      // 名前は完全一致（前後の空白は無視）、レターボックス番号もその人に
      // 割り当てられた番号と一致している必要があります。
      const key = Object.keys(LETTERS).find((k) => k.trim() === name.trim());
      if (!key) return null;
      const letter = LETTERS[key];
      if (String(letter.box).trim() !== String(box).trim()) return null;
      return letter;
    }

    function tryOpenBox() {
      const num = boxInput.value.trim();
      const letter = findLetter(visitorName, num);
      if (!letter) {
        boxError.classList.remove("hidden");
        return;
      }
      boxError.classList.add("hidden");
      highlightPostbox(num);
      openLetter(num, letter);
    }

    nameSubmit.addEventListener("click", goToBoxStep);
    nameInput.addEventListener("keydown", (e) => { if (e.key === "Enter") goToBoxStep(); });

    boxSubmit.addEventListener("click", tryOpenBox);
    boxInput.addEventListener("keydown", (e) => { if (e.key === "Enter") tryOpenBox(); });

    backToName.addEventListener("click", goToNameStep);
  }

  /* ---------- 手紙モーダル ---------- */

  let currentBoxNum = null;

  function openLetter(num, letter) {
    currentBoxNum = num;
    document.getElementById("letterDate").textContent = letter.date || "";
    document.getElementById("letterBody").innerHTML = letter.body
      .map((paragraph) => `<p>${paragraph}</p>`)
      .join("");
    document.getElementById("letterSignature").textContent = letter.signature || "";
    document.getElementById("letterModal").classList.remove("hidden");
  }

  function closeLetter() {
    document.getElementById("letterModal").classList.add("hidden");
  }

  function initLetterModal() {
    document.getElementById("closeLetterModal").addEventListener("click", closeLetter);
    document.getElementById("letterModal").addEventListener("click", (e) => {
      if (e.target.id === "letterModal") closeLetter();
    });

    document.getElementById("replyBtn").addEventListener("click", () => {
      document.getElementById("replyName").value = visitorName;
      document.getElementById("replyStatus").textContent = "";
      document.getElementById("replyModal").classList.remove("hidden");
    });
  }

  /* ---------- 返信モーダル（Formspree） ---------- */

  function initReplyModal() {
    const modal = document.getElementById("replyModal");
    const form = document.getElementById("replyForm");
    const status = document.getElementById("replyStatus");
    const submitBtn = document.getElementById("replySubmit");

    document.getElementById("closeReplyModal").addEventListener("click", () => {
      modal.classList.add("hidden");
    });
    modal.addEventListener("click", (e) => {
      if (e.target.id === "replyModal") modal.classList.add("hidden");
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!FORMSPREE_ENDPOINT || FORMSPREE_ENDPOINT.includes("REPLACE_ME")) {
        status.textContent = "（Formspreeの設定がまだのため送信できません。data.js の FORMSPREE_ENDPOINT を設定してください）";
        return;
      }

      const data = new FormData(form);
      data.append("レターボックス番号", currentBoxNum || "");

      submitBtn.disabled = true;
      status.textContent = "送信中…";

      try {
        const res = await fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: data,
        });
        if (res.ok) {
          status.textContent = "返信を送りました。ありがとうございます！";
          form.reset();
        } else {
          status.textContent = "送信に失敗しました。時間をおいて再度お試しください。";
        }
      } catch (err) {
        status.textContent = "送信に失敗しました。ネットワークをご確認ください。";
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  /* ---------- init ---------- */

  document.addEventListener("DOMContentLoaded", () => {
    startClocks();
    renderShelf();
    renderPostboxes();
    initTerminal();
    initLetterModal();
    initReplyModal();
  });
})();
