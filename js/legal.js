document.addEventListener('DOMContentLoaded', () => {
  const content = window.VIAX_LEGAL || {};
  const roleContainer = document.querySelector('[data-role-tabs]');
  const docSwitch = document.querySelector('[data-doc-switch]');
  const titleNode = document.querySelector('[data-legal-title]');
  const introNode = document.querySelector('[data-legal-intro]');
  const bodyNode = document.querySelector('[data-legal-body]');

  const params = new URLSearchParams(window.location.search);
  let role = params.get('role') || 'cliente';
  let doc = params.get('doc') || 'terms';

  if (!content[role]) role = 'cliente';
  if (!['terms', 'privacy'].includes(doc)) doc = 'terms';

  function updateUrl() {
    const q = new URLSearchParams({ role, doc });
    history.replaceState(null, '', `${location.pathname}?${q.toString()}`);
  }

  function render() {
    roleContainer.innerHTML = '';

    Object.entries(content).forEach(([key, value]) => {
      const button = document.createElement('button');
      button.className = `tab ${key === role ? 'active' : ''}`;
      button.textContent = value.label;
      button.addEventListener('click', () => {
        role = key;
        render();
      });
      roleContainer.appendChild(button);
    });

    Array.from(docSwitch.querySelectorAll('button')).forEach((btn) => {
      const isActive = btn.dataset.doc === doc;
      btn.classList.toggle('active', isActive);
      btn.disabled = isActive;
    });

    const current = content[role][doc];
    titleNode.textContent = current.title;
    introNode.textContent = current.intro;

    bodyNode.innerHTML = '';
    current.sections.forEach((section) => {
      const wrap = document.createElement('section');
      wrap.className = 'legal-section';

      const h = document.createElement('h3');
      h.textContent = section.heading;
      wrap.appendChild(h);

      if (Array.isArray(section.paragraphs)) {
        section.paragraphs.forEach((paragraph) => {
          const p = document.createElement('p');
          p.textContent = paragraph;
          wrap.appendChild(p);
        });
      }

      if (Array.isArray(section.bullets)) {
        const ul = document.createElement('ul');
        section.bullets.forEach((bullet) => {
          const li = document.createElement('li');
          li.textContent = bullet;
          ul.appendChild(li);
        });
        wrap.appendChild(ul);
      }

      bodyNode.appendChild(wrap);
    });

    updateUrl();
  }

  docSwitch.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-doc]');
    if (!button) return;
    doc = button.dataset.doc;
    render();
  });

  render();
});
