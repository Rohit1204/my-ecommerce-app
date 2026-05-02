/**
 * Wraps every password input in a relative container and adds a show/hide toggle.
 * Safe to load once per page; skips inputs already inside .password-input-wrap.
 */
(function () {
  function setIcon(btn, hidden) {
    btn.innerHTML = hidden
      ? '<i class="bi bi-eye-slash fs-5" aria-hidden="true"></i>'
      : '<i class="bi bi-eye fs-5" aria-hidden="true"></i>';
    btn.setAttribute("aria-label", hidden ? "Hide password" : "Show password");
    btn.setAttribute("aria-pressed", hidden ? "true" : "false");
  }

  function enhance(input) {
    if (!input || input.closest(".password-input-wrap")) return;

    var wrap = document.createElement("div");
    wrap.className = "password-input-wrap position-relative";
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    input.classList.add("pe-5");

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className =
      "btn btn-link position-absolute end-0 top-50 translate-middle-y py-0 px-2 border-0 text-secondary password-toggle-btn";
    btn.style.lineHeight = "1";
    setIcon(btn, false);

    btn.addEventListener("click", function () {
      var hide = input.type === "password";
      input.type = hide ? "text" : "password";
      setIcon(btn, hide);
    });

    wrap.appendChild(btn);
  }

  function run() {
    document.querySelectorAll('input[type="password"]').forEach(enhance);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
