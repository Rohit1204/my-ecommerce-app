/**
 * Cart state in localStorage — format: { pr<id>: [qty, name, price], ... }
 */
(function () {
  "use strict";

  function loadCart() {
    try {
      var raw = localStorage.getItem("cart");
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      return typeof parsed === "object" && parsed !== null ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateBadge(cart);
    renderPanel(cart);
  }

  function updateBadge(cart) {
    var el = document.getElementById("cart");
    if (!el) return;
    var sum = 0;
    for (var k in cart) {
      if (Object.prototype.hasOwnProperty.call(cart, k) && Array.isArray(cart[k])) {
        sum += cart[k][0];
      }
    }
    el.textContent = sum;
  }

  function renderPanel(cart) {
    var body = document.getElementById("cartPanelBody");
    if (!body) return;

    var keys = Object.keys(cart).filter(function (k) {
      return Array.isArray(cart[k]);
    });
    if (keys.length === 0) {
      body.innerHTML =
        '<p class="text-muted small mb-0">Your cart is empty.</p>';
      return;
    }

    var html = '<ul class="list-unstyled small mb-3">';
    var i = 1;
    keys.forEach(function (key) {
      var nameEl = document.getElementById("name" + key);
      var name = nameEl
        ? nameEl.textContent.trim()
        : cart[key][1] || "Item";
      var shortName =
        name.length > 22 ? name.slice(0, 22) + "…" : name;
      html +=
        "<li class=\"mb-2\"><strong>" +
        i +
        ".</strong> " +
        shortName +
        " <span class=\"text-muted\">×" +
        cart[key][0] +
        "</span></li>";
      i += 1;
    });
    html += "</ul>";
    html +=
      '<div class="d-grid gap-2">' +
      '<a class="btn btn-primary btn-sm" href="/checkout/">Checkout</a>' +
      '<button type="button" class="btn btn-outline-secondary btn-sm" id="cartPanelClear">Clear cart</button>' +
      "</div>";
    body.innerHTML = html;

    var clearBtn = document.getElementById("cartPanelClear");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        window.clearShopCart();
      });
    }
  }

  function cartCtlBtnClasses(wrap) {
    var sm = wrap.classList.contains("cart-ctl-sm");
    return sm ? "btn btn-sm btn-primary" : "btn btn-primary";
  }

  function setQtyControls(prId, qty) {
    var wrap = document.getElementById("divpr" + prId);
    if (!wrap) return;
    var btnCls = cartCtlBtnClasses(wrap);
    var midCls =
      "qty-cart-val d-flex align-items-center justify-content-center flex-grow-1 min-w-0 fw-semibold user-select-none border rounded bg-white px-2";
    wrap.innerHTML =
      '<div class="d-flex align-items-stretch gap-2 w-100 qty-cart-controls" role="group" aria-label="Quantity">' +
      '<button type="button" id="minuspr' +
      prId +
      '" class="' +
      btnCls +
      ' minus qty-cart-step" aria-label="Decrease quantity">−</button>' +
      '<span id="valpr' +
      prId +
      '" class="' +
      midCls +
      '">' +
      qty +
      "</span>" +
      '<button type="button" id="pluspr' +
      prId +
      '" class="' +
      btnCls +
      ' plus qty-cart-step" aria-label="Increase quantity">+</button>' +
      "</div>";
  }

  function setAddButton(prId) {
    var wrap = document.getElementById("divpr" + prId);
    if (!wrap) return;
    var btnCls = cartCtlBtnClasses(wrap);
    wrap.innerHTML =
      '<button type="button" id="pr' +
      prId +
      '" class="' +
      btnCls +
      ' cart w-100">Add to cart</button>';
  }

  function refreshLineItems(cart) {
    for (var key in cart) {
      if (!Object.prototype.hasOwnProperty.call(cart, key)) continue;
      if (!/^pr\d+$/.test(key)) continue;
      var id = key.slice(2);
      if (Array.isArray(cart[key]) && cart[key][0] > 0) {
        setQtyControls(id, cart[key][0]);
      }
    }
  }

  window.clearShopCart = function () {
    var cart = loadCart();
    for (var key in cart) {
      if (!Object.prototype.hasOwnProperty.call(cart, key)) continue;
      if (!/^pr\d+$/.test(key)) continue;
      var id = key.slice(2);
      setAddButton(id);
    }
    localStorage.removeItem("cart");
    saveCart({});
  };

  function addOrIncrement(idstr, cart) {
    var nameEl = document.getElementById("name" + idstr);
    var priceEl = document.getElementById("price" + idstr);
    if (!nameEl || !priceEl) return cart;

    var qty;
    if (cart[idstr] !== undefined && Array.isArray(cart[idstr])) {
      qty = cart[idstr][0] + 1;
    } else {
      qty = 1;
    }
    var name = nameEl.textContent.trim();
    var price = parseInt(priceEl.textContent.replace(/\D/g, ""), 10) || 0;
    cart[idstr] = [qty, name, price];
    return cart;
  }

  function bindDelegatedClicks() {
    document.body.addEventListener("click", function (ev) {
      var t = ev.target;
      if (!(t instanceof Element)) return;

      var cartBtn = t.closest("button.cart");
      if (cartBtn && cartBtn.id && cartBtn.id.indexOf("pr") === 0) {
        var idstr = cartBtn.id;
        var cart = loadCart();
        addOrIncrement(idstr, cart);
        saveCart(cart);
        var numId = idstr.slice(2);
        setQtyControls(numId, cart[idstr][0]);
        return;
      }

      var minus = t.closest("button.minus");
      if (minus && minus.id.indexOf("minuspr") === 0) {
        var a = minus.id.slice(7);
        var cart = loadCart();
        var ck = "pr" + a;
        if (!cart[ck]) return;
        cart[ck][0] = Math.max(0, cart[ck][0] - 1);
        if (cart[ck][0] === 0) {
          delete cart[ck];
          setAddButton(a);
        } else {
          var val = document.getElementById("valpr" + a);
          if (val) val.textContent = cart[ck][0];
        }
        saveCart(cart);
        return;
      }

      var plus = t.closest("button.plus");
      if (plus && plus.id.indexOf("pluspr") === 0) {
        var b = plus.id.slice(6);
        var cart2 = loadCart();
        var ck2 = "pr" + b;
        if (!cart2[ck2]) return;
        cart2[ck2][0] += 1;
        var val2 = document.getElementById("valpr" + b);
        if (val2) val2.textContent = cart2[ck2][0];
        saveCart(cart2);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var cart = loadCart();
    updateBadge(cart);
    refreshLineItems(cart);
    renderPanel(cart);
    bindDelegatedClicks();
  });
})();
