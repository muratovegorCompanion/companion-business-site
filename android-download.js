(function () {
  const makeLink = (platform) => {
    const link = document.createElement("a");
    link.className = `btn btn-${platform} platform-download`;
    const label = platform === "android" ? "Завантажити для Android" : "Завантажити для iPhone";
    const icon = platform === "android"
      ? '<svg class="platform-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7.2 8.7h9.6v8.1c0 .7-.5 1.2-1.2 1.2h-.8v2.2h-1.4V18h-2.8v2.2H9.2V18h-.8c-.7 0-1.2-.5-1.2-1.2V8.7Zm1.7-1.4 1-1.7-.5-.3 1.1 1.8c.5-.2 1.1-.3 1.7-.3s1.2.1 1.7.3L15 5.3l-.5.3 1 1.7h.4c.7 0 1.2.5 1.2 1.2H7.3c0-.7.5-1.2 1.2-1.2h.4ZM9.5 10v2h1v-2h-1Zm4 0v2h1v-2h-1ZM5.8 9.2h.8v5.9h-.8c-.7 0-1.2-.5-1.2-1.2v-3.5c0-.7.5-1.2 1.2-1.2Zm12.4 0h.8c.7 0 1.2.5 1.2 1.2v3.5c0 .7-.5 1.2-1.2 1.2h-.8V9.2Z"/></svg>'
      : '<svg class="platform-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.7 12.7c0-2 1.6-3 1.7-3.1-.9-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.3.7-2.9.7-.6 0-1.5-.7-2.5-.7-1.3 0-2.5.8-3.2 1.9-1.4 2.4-.4 6 1 8 .7 1 1.5 2.1 2.6 2 .9 0 1.3-.6 2.5-.6s1.5.6 2.5.6c1.1 0 1.8-1 2.5-2 .8-1.1 1.1-2.2 1.1-2.2s-2.3-.9-2.3-3Zm-1.9-5.9c.5-.7.9-1.7.8-2.7-.8 0-1.8.5-2.3 1.2-.5.6-.9 1.6-.8 2.5.9.1 1.8-.4 2.3-1Z"/></svg>';
    link.innerHTML = `${icon}<span>${label}</span>`;
    if (platform === "android") {
      link.href = "https://app.sb-companion.com/companion-android.apk";
      link.download = "Companion-Android.apk";
    } else {
      link.href = "#ios-not-ready";
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const notice = document.querySelector(".download-notice") || document.body.appendChild(Object.assign(document.createElement("div"), { className: "download-notice" }));
        notice.textContent = "В процесі розробки";
        notice.classList.add("is-visible");
        window.clearTimeout(notice.hideTimer);
        notice.hideTimer = window.setTimeout(() => notice.classList.remove("is-visible"), 2800);
      });
    }
    return link;
  };

  // Reuse the Android buttons already present in the page markup.
  for (const actions of document.querySelectorAll('.hero .actions, .final .actions')) {
    if (!actions.querySelector('.btn-android')) actions.append(makeLink('android'));
    if (!actions.querySelector('.btn-ios')) actions.append(makeLink('ios'));
  }
})();
