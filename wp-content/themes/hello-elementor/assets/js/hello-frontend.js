(function(){class e{constructor(){this.initSettings(),this.initElements(),this.bindEvents()}initSettings(){this.settings={selectors:{menuToggle:".site-header .site-navigation-toggle",menuToggleHolder:".site-header .site-navigation-toggle-holder",dropdownMenu:".site-header .site-navigation-dropdown"}}}initElements(){this.elements={window,menuToggle:document.querySelector(this.settings.selectors.menuToggle),menuToggleHolder:document.querySelector(this.settings.selectors.menuToggleHolder),dropdownMenu:document.querySelector(this.settings.selectors.dropdownMenu)}}bindEvents(){var _a;this.elements.menuToggleHolder&&!((_a=this.elements.menuToggleHolder)!=null&&_a.classList.contains("hide"))&&(this.elements.menuToggle.addEventListener("click",()=>this.handleMenuToggle()),this.elements.dropdownMenu.querySelectorAll(".menu-item-has-children > a").forEach(e2=>e2.addEventListener("click",e3=>this.handleMenuChildren(e3))))}closeMenuItems(){this.elements.menuToggleHolder.classList.remove("elementor-active"),this.elements.window.removeEventListener("resize",()=>this.closeMenuItems())}handleMenuToggle(){const e2=!this.elements.menuToggleHolder.classList.contains("elementor-active");this.elements.menuToggle.setAttribute("aria-expanded",e2),this.elements.dropdownMenu.setAttribute("aria-hidden",!e2),this.elements.dropdownMenu.inert=!e2,this.elements.menuToggleHolder.classList.toggle("elementor-active",e2),this.elements.dropdownMenu.querySelectorAll(".elementor-active").forEach(e3=>e3.classList.remove("elementor-active")),e2?this.elements.window.addEventListener("resize",()=>this.closeMenuItems()):this.elements.window.removeEventListener("resize",()=>this.closeMenuItems())}handleMenuChildren(e2){const t=e2.currentTarget.parentElement;t!=null&&t.classList&&t.classList.toggle("elementor-active")}}document.addEventListener("DOMContentLoaded",()=>{new e})})();

/* ==========================================================================
   BYD Nelson — live contact details + admin link
   Fills the "Visit Us" and "Opening Hours" blocks from data/settings.json so
   the owner can edit them in the admin panel, and adds a small Admin link to
   the footer so the panel is always reachable.
   ========================================================================== */
(function () {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function telHref(phone) {
    var d = String(phone || '').replace(/[^0-9+]/g, '').replace(/\+/g, '');
    if (d.charAt(0) === '0') d = '+64' + d.slice(1);
    return d;
  }

  function addAdminLink() {
    var footer = document.querySelector('footer.elementor-location-footer');
    if (!footer || footer.querySelector('.byd-admin-link')) return;

    /* Put the link INSIDE the footer's dark container, otherwise white text
       lands on the white page background and is invisible. */
    var host = footer.querySelector('.e-con-inner') || footer;
    var inners = footer.querySelectorAll('.e-con-inner');
    if (inners.length) host = inners[inners.length - 1];

    var wrap = document.createElement('div');
    wrap.className = 'byd-admin-link';
    wrap.style.cssText = 'text-align:center;padding:14px 0 10px;width:100%;';
    wrap.innerHTML = '<a href="admin/index.html" style="color:#ffffff;opacity:.7;font-size:13px;' +
      'text-decoration:underline;letter-spacing:.4px;">Admin</a>';
    host.appendChild(wrap);
  }

  function applySettings() {
    fetch('data/settings.json?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (s) {
        if (!s) return;

        var visit = document.querySelector('.elementor-element-59cda7b .elementor-widget-container');
        if (visit && (s.address || s.phone || s.email)) {
          var h = '';
          if (s.address) h += '<p>' + esc(s.address) + '</p>';
          if (s.phone) h += '<p><a href="tel:' + esc(telHref(s.phone)) + '"><span style="color: #ffffff;">' + esc(s.phone) + '</span></a></p>';
          if (s.email) h += '<p><span style="color: #ffffff;"><a style="color: #ffffff;" href="mailto:' + esc(s.email) + '">' + esc(s.email) + '</a></span></p>';
          visit.innerHTML = h;
        }

        var hours = document.querySelector('.elementor-element-cbff087 .elementor-widget-container');
        if (hours && (s.hours_weekday || s.hours_saturday || s.hours_sunday)) {
          var g = '';
          if (s.hours_weekday) g += '<p><strong>Monday &#8211; Friday:</strong></p><p><em>' + esc(s.hours_weekday) + '</em></p>';
          if (s.hours_saturday) g += '<p><strong>Saturday:</strong></p><p><em>' + esc(s.hours_saturday) + '</em></p>';
          if (s.hours_sunday) g += '<p><strong>Sunday:</strong></p><p><i>' + esc(s.hours_sunday) + '</i></p>';
          hours.innerHTML = g;
        }
      })
      .catch(function () { /* keep the built-in text if the file is missing */ });
  }

  document.addEventListener('DOMContentLoaded', function () {
    addAdminLink();
    applySettings();
  });
})();
