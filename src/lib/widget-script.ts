export function createWidgetScript() {
  return `(function () {
  "use strict";
  if (window.__botforgeWidgetLoaded && window.initWidget) return;
  window.__botforgeWidgetLoaded = true;

  var scriptOrigin = (function () {
    try {
      var scripts = document.getElementsByTagName("script");
      for (var i = scripts.length - 1; i >= 0; i--) {
        var src = scripts[i].src || "";
        if (src.indexOf("/widget.js") !== -1) return new URL(src).origin;
      }
    } catch (e) {}
    return window.location.origin;
  })();

  function mount(config) {
    config = config || {};
    var botId = config.botId;
    var origin = config.origin || scriptOrigin;
    if (!botId) {
      console.error("[Botforge] initWidget requires a botId");
      return;
    }
    if (document.getElementById("botforge-widget-" + botId)) return;

    var root = document.createElement("div");
    root.id = "botforge-widget-" + botId;
    root.style.cssText =
      "position:fixed;bottom:20px;right:20px;z-index:2147483647;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;";

    var button = document.createElement("button");
    button.setAttribute("aria-label", "Open chat");
    button.type = "button";
    button.style.cssText =
      "width:60px;height:60px;border-radius:9999px;border:0;cursor:pointer;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;box-shadow:0 10px 30px rgba(79,70,229,0.45);display:flex;align-items:center;justify-content:center;transition:transform .2s ease, box-shadow .2s ease;";
    button.innerHTML =
      '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    button.onmouseenter = function () {
      button.style.transform = "scale(1.06)";
      button.style.boxShadow = "0 14px 34px rgba(79,70,229,0.55)";
    };
    button.onmouseleave = function () {
      button.style.transform = "scale(1)";
      button.style.boxShadow = "0 10px 30px rgba(79,70,229,0.45)";
    };

    var panel = document.createElement("div");
    panel.style.cssText =
      "position:absolute;bottom:76px;right:0;width:380px;max-width:calc(100vw - 40px);height:560px;max-height:calc(100vh - 120px);border-radius:16px;overflow:hidden;background:#fff;box-shadow:0 24px 60px rgba(15,23,42,0.25);transform-origin:bottom right;transform:scale(.92);opacity:0;pointer-events:none;transition:transform .18s ease, opacity .18s ease;";

    var iframe = document.createElement("iframe");
    iframe.title = "Chat";
    iframe.style.cssText = "width:100%;height:100%;border:0;background:#fff;";
    iframe.allow = "clipboard-write";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    panel.appendChild(iframe);

    var open = false;
    function setOpen(next) {
      open = next;
      if (open) {
        if (!iframe.src) iframe.src = origin.replace(/\\/$/, "") + "/embed/" + encodeURIComponent(botId);
        panel.style.transform = "scale(1)";
        panel.style.opacity = "1";
        panel.style.pointerEvents = "auto";
      } else {
        panel.style.transform = "scale(.92)";
        panel.style.opacity = "0";
        panel.style.pointerEvents = "none";
      }
    }
    button.addEventListener("click", function () { setOpen(!open); });

    root.appendChild(panel);
    root.appendChild(button);

    function attach() { document.body.appendChild(root); }
    if (document.body) attach();
    else document.addEventListener("DOMContentLoaded", attach);
  }

  window.initWidget = mount;

  try {
    var current = document.currentScript;
    var auto = current && current.getAttribute("data-bot-id");
    if (auto) mount({ botId: auto });
  } catch (e) {}
})();
`;
}