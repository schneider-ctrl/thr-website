/* ==========================================================
   Bewerbungs-Assistent – Schritt-für-Schritt mit Gamification
   ========================================================== */
(function () {
  const wizard = document.querySelector('[data-wizard]');
  if (!wizard) return;

  const steps = Array.from(wizard.querySelectorAll('.wizard__step'));
  const order = ['start', '1', '2', '3', '4', '5', '6', 'success'];
  const totalQuestions = 6;
  const answers = {};
  let currentIdx = 0;

  const progress = wizard.querySelector('[data-progress]');
  const progressFill = wizard.querySelector('[data-progress-fill]');
  const progressLabel = wizard.querySelector('[data-progress-label]');
  const progressPercent = wizard.querySelector('[data-progress-percent]');
  const backBtn = wizard.querySelector('[data-back]');

  function show(idx) {
    currentIdx = idx;
    const id = order[idx];
    steps.forEach((s) => {
      const active = s.dataset.step === id;
      s.classList.toggle('is-active', active);
      if (active) {
        s.classList.remove('slide-in');
        void s.offsetWidth; // Animation neu starten
        s.classList.add('slide-in');
      }
    });
    // Fortschritt
    const qIdx = parseInt(id, 10);
    const isQuestion = !isNaN(qIdx);
    progress.hidden = !isQuestion;
    backBtn.hidden = !isQuestion;
    if (isQuestion) {
      const pct = Math.round(((qIdx - 1) / totalQuestions) * 100);
      progressFill.style.width = pct + '%';
      progressLabel.textContent = 'Schritt ' + qIdx + ' von ' + totalQuestions;
      progressPercent.textContent = pct + '%';
    }
    if (id === 'success') {
      progress.hidden = false;
      progressFill.style.width = '100%';
      progressLabel.textContent = 'Geschafft!';
      progressPercent.textContent = '100%';
      backBtn.hidden = true;
      confetti();
    }
    const focusTarget = steps[idx].querySelector('h1, h2');
    if (focusTarget) focusTarget.setAttribute('tabindex', '-1'), focusTarget.focus({ preventScroll: true });
    wizard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function next() { show(Math.min(currentIdx + 1, order.length - 1)); }
  backBtn.addEventListener('click', () => show(Math.max(currentIdx - 1, 1)));

  /* Start */
  wizard.querySelector('[data-start]').addEventListener('click', () => show(1));

  /* Einfachauswahl: Klick auf Karte = Antwort + weiter */
  wizard.querySelectorAll('[data-answer]').forEach((card) => {
    card.addEventListener('click', () => {
      const key = card.dataset.answer;
      answers[key] = card.dataset.value;
      // Auswahl kurz zeigen, dann weiter
      card.parentElement.querySelectorAll('.option-card').forEach((c) => c.classList.remove('is-selected'));
      card.classList.add('is-selected');
      setTimeout(next, 350);
    });
  });

  /* PLZ */
  const plzStep = wizard.querySelector('[data-step="2"]');
  const plzInput = plzStep.querySelector('[data-input="plz"]');
  const plzError = plzStep.querySelector('[data-error]');
  function submitPlz() {
    const ok = /^\d{5}$/.test(plzInput.value.trim());
    plzError.hidden = ok;
    if (ok) {
      answers.plz = plzInput.value.trim();
      next();
    } else {
      plzInput.focus();
    }
  }
  plzStep.querySelector('[data-next-input]').addEventListener('click', submitPlz);
  plzInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitPlz(); });

  /* Mehrfachauswahl */
  const multiStep = wizard.querySelector('[data-step="3"]');
  const chips = Array.from(multiStep.querySelectorAll('[data-chip]'));
  const multiNext = multiStep.querySelector('[data-next-multi]');
  chips.forEach((chip) =>
    chip.addEventListener('click', () => {
      chip.classList.toggle('is-selected');
      chip.setAttribute('aria-pressed', chip.classList.contains('is-selected'));
      multiNext.disabled = !chips.some((c) => c.classList.contains('is-selected'));
    })
  );
  multiNext.addEventListener('click', () => {
    answers.wichtig = chips.filter((c) => c.classList.contains('is-selected')).map((c) => c.dataset.value).join(', ');
    next();
  });

  /* Kontakt + Absenden */
  const contactStep = wizard.querySelector('[data-step="6"]');
  const contactError = contactStep.querySelector('[data-error]');
  contactStep.querySelector('[data-submit]').addEventListener('click', () => {
    const name = contactStep.querySelector('[data-input="name"]').value.trim();
    const phone = contactStep.querySelector('[data-input="telefon"]').value.trim();
    const email = contactStep.querySelector('[data-input="email"]').value.trim();
    const privacy = contactStep.querySelector('[data-input="datenschutz"]').checked;
    const ok = name.length > 1 && phone.length > 5 && privacy;
    contactError.hidden = ok;
    if (!ok) return;
    answers.name = name;
    answers.telefon = phone;
    answers.email = email;
    send();
  });

  function send() {
    const data = new URLSearchParams();
    data.append('form-name', 'bewerbung');
    ['fuehrerschein', 'plz', 'wichtig', 'starttermin', 'erreichbar', 'name', 'telefon', 'email'].forEach((k) =>
      data.append(k, answers[k] || '')
    );
    // Auf Netlify wird die Bewerbung gespeichert; lokal zeigen wir direkt den Erfolg
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: data.toString() })
      .catch(() => {})
      .finally(() => show(order.indexOf('success')));
  }

  /* Konfetti in Markenfarben */
  function confetti() {
    const host = wizard.querySelector('[data-confetti]');
    if (!host || host.childElementCount) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const colors = ['#008B55', '#FCEA1C', '#220C10', '#FFFDEB'];
    for (let i = 0; i < 80; i++) {
      const p = document.createElement('i');
      p.style.left = Math.random() * 100 + '%';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = Math.random() * 0.9 + 's';
      p.style.animationDuration = 2.2 + Math.random() * 1.6 + 's';
      p.style.width = p.style.height = 6 + Math.random() * 8 + 'px';
      if (i % 3 === 0) p.style.borderRadius = '50%';
      host.appendChild(p);
    }
    setTimeout(() => host.replaceChildren(), 5000);
  }
})();
