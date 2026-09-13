(function () {
  var LOGIN = '/login';

  function hideBoot() {
    document.documentElement.classList.remove('auth-pending');
    document.documentElement.classList.add('auth-ok');
    var b = document.getElementById('boot-loader');
    if (b) b.style.display = 'none';
    try { window.dispatchEvent(new Event('auth-ready')); } catch (e) {}
  }

  function toLogin() { window.location.replace(LOGIN); }

  async function ensure() {
    try {
      var r = await fetch('/api/auth/me', { credentials: 'include' });
      var d = await r.json();
      if (!d || !d.ok) { toLogin(); return; }
      var nameEl = document.getElementById('user-name');
      if (nameEl) nameEl.textContent = (d.user && d.user.email) ? d.user.email.split('@')[0] : 'Usuario';
      hideBoot();
    } catch (e) {
      toLogin();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensure);
  else ensure();
})();
