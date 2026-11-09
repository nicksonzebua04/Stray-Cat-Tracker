(() => {
  'use strict';

  const apiUrl = 'api.php';
  let csrfToken = '';
  let currentUser = null;
  let editingReportId = null;
  let editingCareId = null;
  let activeFilter = 'all';
  let searchTerm = '';
  let sortMode = 'recent';

  const reportForm = document.getElementById('strayReportForm');
  const reportModal = document.getElementById('reportModal');
  const reportGrid = document.getElementById('cardsGrid');
  const demoCards = Array.from(reportGrid.querySelectorAll('.sighting-card:not(.api-report-card)'));
  const reportPhoto = document.getElementById('reportPhoto');
  const dropZone = document.getElementById('dropZone');
  const reportSuccess = document.getElementById('modalSuccessState');
  const reportFormContainer = document.getElementById('strayReportForm');
  const noResultsState = document.getElementById('noResultsState');
  const toast = document.getElementById('toastNotification');
  const toastTitle = document.getElementById('toastTitle');
  const toastBody = document.getElementById('toastBody');

  function createElement(tagName) {
    return document.createElementNS(document.documentElement.namespaceURI, tagName);
  }

  const accountModal = createElement('div');
  accountModal.id = 'accountModal';
  accountModal.className = 'fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl opacity-0 pointer-events-none transition-all duration-300';
  accountModal.setAttribute('role', 'dialog');
  accountModal.setAttribute('aria-modal', 'true');
  accountModal.setAttribute('aria-hidden', 'true');
  accountModal.innerHTML = `
    <section class="w-full max-w-md rounded-3xl bg-surface-container-high border border-surface-container-highest p-6 shadow-2xl">
      <div class="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 class="font-headline-sm text-xl text-on-surface font-bold" id="accountTitle">Akun Warga</h2>
          <p class="font-body-sm text-sm text-on-surface-variant mt-1" id="accountSubtitle">Masuk untuk mengelola laporan dan catatan perawatan.</p>
        </div>
        <button class="w-9 h-9 rounded-xl bg-surface-container hover:bg-surface-bright text-on-surface flex items-center justify-center" id="closeAccountModal" type="button" aria-label="Tutup">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div id="accountContent"></div>
      <p class="mt-4 text-sm text-error hidden" id="accountError" role="alert"></p>
    </section>`;
  document.body.appendChild(accountModal);

  const careSection = createElement('section');
  careSection.id = 'careWorkspace';
  careSection.className = 'w-full px-margin lg:px-margin-desktop py-space-xl scroll-mt-20';
  careSection.innerHTML = `
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-6">
      <div>
        <div class="inline-flex items-center gap-1.5 text-primary text-xs sm:text-sm font-bold uppercase tracking-wider mb-1">
          <span class="material-symbols-outlined text-base">volunteer_activism</span>
          <span>Catatan Relawan</span>
        </div>
        <h2 class="font-headline-lg text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">Aktivitas Perawatan Kucing</h2>
      </div>
      <p class="font-body-sm text-sm text-on-surface-variant max-w-md">Catat pemberian makan, obat, vaksin, dan kegiatan perawatan yang Anda lakukan.</p>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <form class="lg:col-span-2 p-5 rounded-3xl bg-surface-container border border-surface-container-high flex flex-col gap-3" id="careForm">
        <h3 class="font-title-md text-on-surface font-bold" id="careFormTitle">Tambah catatan perawatan</h3>
        <label class="font-label-md text-sm text-on-surface">Nama kucing
          <input class="w-full mt-1 px-3 py-2 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest" name="cat_name" required="required" maxlength="80"/>
        </label>
        <label class="font-label-md text-sm text-on-surface">Lokasi
          <input class="w-full mt-1 px-3 py-2 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest" name="location" required="required" maxlength="180"/>
        </label>
        <div class="grid grid-cols-2 gap-3">
          <label class="font-label-md text-sm text-on-surface">Aktivitas
            <select class="w-full mt-1 px-3 py-2 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest" name="activity">
              <option value="makan">Memberi makan</option><option value="minum">Memberi minum</option><option value="obat">Memberi obat</option><option value="steril">Sterilisasi</option><option value="vaksin">Vaksinasi</option><option value="lainnya">Lainnya</option>
            </select>
          </label>
          <label class="font-label-md text-sm text-on-surface">Tanggal
            <input class="w-full mt-1 px-3 py-2 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest" name="date" type="date" required="required"/>
          </label>
        </div>
        <label class="font-label-md text-sm text-on-surface">Catatan (opsional)
          <textarea class="w-full mt-1 px-3 py-2 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest" name="notes" rows="2" maxlength="500"></textarea>
        </label>
        <div class="flex gap-2">
          <button class="flex-1 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold" id="saveCareButton" type="submit">Simpan catatan</button>
          <button class="hidden px-4 py-2.5 rounded-xl bg-surface-bright text-on-surface" id="cancelCareEdit" type="button">Batal</button>
        </div>
      </form>
      <div class="lg:col-span-3 flex flex-col gap-3" id="careList"></div>
    </div>`;
  document.getElementById('panduan-warga').before(careSection);
  const nav = document.querySelector('header nav');
  const guideLink = nav?.querySelector('a[href="#panduan-warga"]');
  if (nav && guideLink) {
    const careLink = createElement('a');
    careLink.href = '#careWorkspace';
    careLink.className = guideLink.className;
    careLink.textContent = 'Catatan Perawatan';
    nav.insertBefore(careLink, guideLink);
  }

  function prepareCareEntry(card, activity) {
    const form = document.getElementById('careForm');
    const name = card.querySelector('h3')?.textContent?.trim() || '';
    const location = card.querySelector('.absolute.bottom-3 span:last-child')?.textContent?.trim() || '';
    resetCareForm();
    form.elements.cat_name.value = name;
    form.elements.location.value = location;
    form.elements.activity.value = activity;
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function showToast(title, message) {
    toastTitle.textContent = title;
    toastBody.textContent = message;
    toast.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
    }, 3500);
  }

  document.addEventListener('error', (event) => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || image.dataset.fallbackShown === 'true') return;
    image.dataset.fallbackShown = 'true';
    image.hidden = true;
    const fallback = createElement('span');
    fallback.className = image.closest('.sighting-card')
      ? 'absolute inset-0 flex items-center justify-center material-symbols-outlined text-6xl text-primary/50'
      : 'material-symbols-outlined text-3xl text-primary';
    fallback.setAttribute('aria-label', image.alt || 'Gambar tidak tersedia');
    fallback.textContent = 'pets';
    image.insertAdjacentElement('afterend', fallback);
  }, true);

  function setModalVisible(modal, visible) {
    modal.classList.toggle('opacity-0', !visible);
    modal.classList.toggle('pointer-events-none', !visible);
    modal.setAttribute('aria-hidden', String(!visible));
    if (visible) {
      modal.querySelector('input, button, select, textarea')?.focus();
    }
  }

  async function request(action, { method = 'GET', body = null, isForm = false } = {}) {
    if (method !== 'GET' && !csrfToken) {
      const session = await request('me');
      csrfToken = session.csrf;
      currentUser = session.user;
      updateHeader();
    }
    const options = { method, credentials: 'same-origin', headers: { Accept: 'application/json' } };
    if (method !== 'GET') {
      if (isForm) {
        body.append('_csrf', csrfToken);
        options.body = body;
      } else {
        options.headers['Content-Type'] = 'application/json';
        options.headers['X-CSRF-Token'] = csrfToken;
        options.body = JSON.stringify(body || {});
      }
    }
    const response = await fetch(`${apiUrl}?action=${encodeURIComponent(action)}`, options);
    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error('Respons server tidak dapat dibaca.');
    }
    if (!response.ok) {
      throw new Error(result.error || 'Permintaan gagal diproses.');
    }
    return result;
  }

  function showAccountError(message) {
    const error = document.getElementById('accountError');
    error.textContent = message;
    error.classList.remove('hidden');
  }

  function updateHeader() {
    const profileImage = document.querySelector('header img[alt="Foto Profil Relawan"]');
    const profile = profileImage?.parentElement;
    if (!profile) return;
    profile.classList.add('cursor-pointer', 'rounded-xl', 'hover:bg-surface-container-high', 'p-1');
    profile.setAttribute('role', 'button');
    profile.setAttribute('tabindex', '0');
    profile.setAttribute('aria-label', currentUser ? 'Buka profil akun' : 'Masuk atau daftar');
    const labels = profile.querySelectorAll('div span');
    if (labels[0]) labels[0].textContent = currentUser ? currentUser.name : 'Masuk / Daftar';
    if (labels[1]) labels[1].textContent = currentUser ? currentUser.email : 'Akun Warga';
  }

  function resetReportEditor() {
    editingReportId = null;
    reportForm.reset();
    reportForm.elements.contact.disabled = false;
    const photoLabel = dropZone.querySelector('.font-label-md');
    if (photoLabel) photoLabel.textContent = 'Ketuk untuk Ambil Foto / Pilih Berkas';
    const submitLabel = document.querySelector('#submitReportBtn span:last-child');
    if (submitLabel) submitLabel.textContent = 'Kirim Laporan Kucing';
    const heading = document.querySelector('#modalCard h3');
    if (heading) heading.textContent = 'Lapor Kucing Ditemukan';
  }

  function showAccountModal() {
    const content = document.getElementById('accountContent');
    const title = document.getElementById('accountTitle');
    const subtitle = document.getElementById('accountSubtitle');
    document.getElementById('accountError').classList.add('hidden');
    if (currentUser) {
      title.textContent = 'Profil Warga';
      subtitle.textContent = 'Perbarui informasi akun atau keluar dari aplikasi.';
      content.innerHTML = `
        <form class="flex flex-col gap-3" id="profileForm">
          <label class="font-label-md text-sm text-on-surface">Nama
            <input class="w-full mt-1 px-3 py-2 rounded-xl bg-surface-container text-on-surface border border-surface-container-highest" name="name" value="" required="required" maxlength="80"/>
          </label>
          <label class="font-label-md text-sm text-on-surface">Email
            <input class="w-full mt-1 px-3 py-2 rounded-xl bg-surface-container text-on-surface border border-surface-container-highest" name="email" type="email" value="" required="required" maxlength="190"/>
          </label>
          <button class="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold" type="submit">Simpan profil</button>
          <button class="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface font-semibold" id="logoutButton" type="button">Keluar</button>
        </form>`;
      const profileForm = document.getElementById('profileForm');
      profileForm.elements.name.value = currentUser.name;
      profileForm.elements.email.value = currentUser.email;
      profileForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
          const result = await request('profile', { method: 'POST', body: Object.fromEntries(new FormData(profileForm)) });
          currentUser = result.user;
          updateHeader();
          setModalVisible(accountModal, false);
          showToast('Profil diperbarui', 'Informasi akun berhasil disimpan.');
        } catch (error) {
          showAccountError(error.message);
        }
      });
      document.getElementById('logoutButton').addEventListener('click', async () => {
        try {
          const result = await request('logout', { method: 'POST' });
          currentUser = result.user;
          csrfToken = result.csrf;
          updateHeader();
          setModalVisible(accountModal, false);
          resetCareForm();
          await Promise.all([loadReports(), loadCareLogs()]);
          showToast('Anda telah keluar', 'Masuk kembali untuk mengelola laporan dan catatan.');
        } catch (error) {
          showAccountError(error.message);
        }
      });
    } else {
      title.textContent = 'Akun Warga';
      subtitle.textContent = 'Masuk atau daftar untuk menyimpan data komunitas.';
      content.innerHTML = `
        <form class="flex flex-col gap-3" id="authForm">
          <label class="font-label-md text-sm text-on-surface hidden" id="authNameWrap">Nama
            <input class="w-full mt-1 px-3 py-2 rounded-xl bg-surface-container text-on-surface border border-surface-container-highest" name="name" maxlength="80"/>
          </label>
          <label class="font-label-md text-sm text-on-surface">Email
            <input class="w-full mt-1 px-3 py-2 rounded-xl bg-surface-container text-on-surface border border-surface-container-highest" name="email" type="email" required="required" maxlength="190"/>
          </label>
          <label class="font-label-md text-sm text-on-surface">Kata sandi
            <input class="w-full mt-1 px-3 py-2 rounded-xl bg-surface-container text-on-surface border border-surface-container-highest" name="password" type="password" minlength="8" maxlength="200" required="required" autocomplete="current-password"/>
          </label>
          <button class="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold" id="authSubmit" type="submit">Masuk</button>
          <button class="px-4 py-2 rounded-xl bg-surface-container text-primary font-semibold" id="authToggle" type="button">Belum punya akun? Daftar</button>
        </form>`;
      const authForm = document.getElementById('authForm');
      const nameWrap = document.getElementById('authNameWrap');
      const submit = document.getElementById('authSubmit');
      const toggle = document.getElementById('authToggle');
      let registering = false;
      toggle.addEventListener('click', () => {
        registering = !registering;
        nameWrap.classList.toggle('hidden', !registering);
        authForm.elements.name.required = registering;
        authForm.elements.password.autocomplete = registering ? 'new-password' : 'current-password';
        submit.textContent = registering ? 'Buat akun' : 'Masuk';
        toggle.textContent = registering ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar';
      });
      authForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const values = Object.fromEntries(new FormData(authForm));
        try {
          const result = await request(registering ? 'register' : 'login', { method: 'POST', body: values });
          currentUser = result.user;
          csrfToken = result.csrf;
          updateHeader();
          setModalVisible(accountModal, false);
          await Promise.all([loadReports(), loadCareLogs()]);
          showToast(registering ? 'Akun berhasil dibuat' : 'Selamat datang kembali', `Halo, ${currentUser.name}.`);
        } catch (error) {
          showAccountError(error.message);
        }
      });
    }
    setModalVisible(accountModal, true);
  }

  function applyDynamicFilters() {
    const cards = Array.from(reportGrid.querySelectorAll('.api-report-card'));
    let visible = 0;
    cards.forEach((card) => {
      const matchesCategory = activeFilter === 'all' || (card.dataset.category || '').includes(activeFilter);
      const matchesText = !searchTerm || card.textContent.toLowerCase().includes(searchTerm);
      const isVisible = matchesCategory && matchesText;
      card.classList.toggle('hidden', !isVisible);
      if (isVisible) visible++;
    });
    if (cards.length > 0) {
      document.getElementById('activeCountLabel').textContent = `${visible} Ditampilkan`;
      noResultsState.classList.toggle('hidden', visible !== 0);
      noResultsState.classList.toggle('flex', visible === 0);
    }
  }

  function renderReports(reports) {
    if (reports.length === 0 && !currentUser) {
      reportGrid.replaceChildren(...demoCards);
      document.getElementById('activeCountLabel').textContent = `${demoCards.length} Ditampilkan`;
      noResultsState.classList.add('hidden');
      noResultsState.classList.remove('flex');
      updateFilterCounts();
      return;
    }
    if (reports.length === 0 && currentUser) {
      reportGrid.replaceChildren();
      document.getElementById('activeCountLabel').textContent = '0 Ditampilkan';
      noResultsState.classList.remove('hidden');
      noResultsState.classList.add('flex');
      updateFilterCounts();
      return;
    }

    reportGrid.replaceChildren();
    const categoryMap = {
      luka: 'urgent',
      lapar: 'fed',
      sudah_makan: 'fed',
      anak_tanpa_induk: 'adoptable',
      jinak_adopsi: 'adoptable',
      steril: 'tnr',
      sehat: '',
    };
    const conditionLabels = {
      sehat: 'Sehat & Lincah',
      lapar: 'Tampak Lapar / Haus',
      luka: 'Butuh Obat / Perawatan',
      anak_tanpa_induk: 'Anak Kucing Tanpa Induk',
      jinak_adopsi: 'Ramah / Siap Diadopsi',
      sudah_makan: 'Sudah Diberi Makan',
      steril: 'Sudah Steril / Vaksin',
    };
    const colorLabels = { oren: 'Oranye', hitam: 'Hitam', putih: 'Putih', belang_tiga: 'Belang Tiga', tuxedo: 'Tuxedo', tabby: 'Tabby', abu: 'Abu-abu', lainnya: 'Campuran' };
    reports.forEach((report) => {
      const card = createElement('article');
      card.id = `report-${report.id}`;
      card.className = 'api-report-card sighting-card flex flex-col rounded-3xl bg-surface-container/90 border border-surface-container-high/90 overflow-hidden shadow-lg';
      card.dataset.category = categoryMap[report.condition] || '';
      card.dataset.createdAt = report.created_at || '';
      card.dataset.location = report.location;
      const media = createElement('div');
      media.className = 'relative w-full h-48 overflow-hidden bg-surface-container-highest';
      if (report.photo) {
        const image = createElement('img');
        image.src = report.photo;
        image.alt = `Foto ${report.cat_name}`;
        image.className = 'w-full h-full object-cover';
        media.appendChild(image);
      } else {
        media.className += ' flex items-center justify-center';
        const icon = createElement('span');
        icon.className = 'material-symbols-outlined text-6xl text-primary/50';
        icon.textContent = 'pets';
        media.appendChild(icon);
      }
      const badge = createElement('span');
      badge.className = `absolute top-3 left-3 px-3 py-1 rounded-full font-label-sm text-xs font-bold ${report.condition === 'luka' ? 'bg-error-container text-on-error-container' : 'bg-primary/20 text-primary'}`;
      badge.textContent = conditionLabels[report.condition] || report.condition;
      media.appendChild(badge);
      const content = createElement('div');
      content.className = 'p-4 flex-1 flex flex-col gap-2';
      const heading = createElement('div');
      heading.className = 'flex items-center justify-between gap-2';
      const name = createElement('h3');
      name.className = 'font-headline-sm text-lg text-on-surface font-bold';
      name.textContent = report.cat_name;
      const detail = createElement('span');
      detail.className = 'font-label-sm text-xs text-on-surface-variant text-right';
      detail.textContent = `${colorLabels[report.color] || report.color} · ${report.age}`;
      heading.append(name, detail);
      const location = createElement('p');
      location.className = 'font-body-sm text-sm text-on-surface-variant';
      location.textContent = `📍 ${report.location}`;
      const description = createElement('p');
      description.className = 'font-body-sm text-sm text-on-surface-variant';
      description.textContent = report.description || 'Belum ada catatan kondisi tambahan.';
      const reporter = createElement('p');
      reporter.className = 'font-label-sm text-xs text-on-surface-variant';
      reporter.textContent = `Dilaporkan oleh ${report.reporter || 'Warga'} · ${new Date(report.created_at).toLocaleString('id-ID')}`;
      const actions = createElement('div');
      actions.className = 'flex gap-2 pt-2 border-t border-surface-container-highest/60';
      actions.appendChild(makeButton('Tandai Terlihat', 'mark-report-seen', report.id, 'flex-1 px-3 py-2 rounded-xl bg-surface-container-high text-on-surface font-semibold'));
      content.append(heading, location, description, reporter, actions);
      if (currentUser && report.user_id === currentUser.id) {
        actions.append(
          makeButton('Edit', 'edit-report', report.id, 'px-3 py-2 rounded-xl bg-surface-container-high text-on-surface font-semibold'),
          makeButton('Hapus', 'delete-report', report.id, 'px-3 py-2 rounded-xl bg-error-container text-on-error-container font-semibold'),
        );
      }
      card.append(media, content);
      reportGrid.appendChild(card);
    });
    activeFilter = 'all';
    document.querySelector('.filter-pill[data-filter="all"]')?.click();
    applyDynamicFilters();
    sortDynamicReports();
    updateFilterCounts();
  }

  function sortDynamicReports() {
    const cards = Array.from(reportGrid.querySelectorAll('.api-report-card'));
    cards.sort((a, b) => {
      if (sortMode === 'urgent') {
        const priority = Number(b.dataset.category.includes('urgent')) - Number(a.dataset.category.includes('urgent'));
        if (priority !== 0) return priority;
      }
      if (sortMode === 'distance') return a.dataset.location.localeCompare(b.dataset.location, 'id');
      return Date.parse(b.dataset.createdAt) - Date.parse(a.dataset.createdAt);
    });
    cards.forEach((card) => reportGrid.appendChild(card));
  }

  function updateFilterCounts() {
    const cards = Array.from(reportGrid.querySelectorAll('.sighting-card'));
    document.querySelectorAll('.filter-pill').forEach((pill) => {
      const filter = pill.dataset.filter;
      const count = filter === 'all'
        ? cards.length
        : cards.filter((card) => (card.dataset.category || '').includes(filter)).length;
      const badge = pill.querySelector('span:last-child');
      if (badge) badge.textContent = String(count);
    });
  }

  function makeButton(label, action, id, className) {
    const button = createElement('button');
    button.type = 'button';
    button.className = className;
    button.dataset.action = action;
    button.dataset.id = id;
    button.textContent = label;
    return button;
  }

  async function loadReports() {
    const result = await request('reports.list');
    renderReports(result.reports);
  }

  function resetCareForm() {
    const form = document.getElementById('careForm');
    form.reset();
    form.elements.date.value = localDate();
    editingCareId = null;
    document.getElementById('careFormTitle').textContent = 'Tambah catatan perawatan';
    document.getElementById('saveCareButton').textContent = 'Simpan catatan';
    document.getElementById('cancelCareEdit').classList.add('hidden');
  }

  function localDate() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
  }

  function renderCareLogs(logs) {
    const list = document.getElementById('careList');
    list.innerHTML = '';
    if (!currentUser) {
      const prompt = createElement('div');
      prompt.className = 'p-6 rounded-3xl bg-surface-container border border-surface-container-high text-center';
      prompt.innerHTML = '<p class="font-body-sm text-on-surface-variant mb-3">Masuk untuk melihat dan mengelola catatan perawatan Anda.</p>';
      prompt.appendChild(makeButton('Masuk / Daftar', 'open-account', '', 'px-4 py-2 rounded-xl bg-primary text-on-primary font-bold'));
      list.appendChild(prompt);
      return;
    }
    if (!logs.length) {
      const empty = createElement('div');
      empty.className = 'p-6 rounded-3xl bg-surface-container border border-surface-container-high text-on-surface-variant';
      empty.textContent = 'Belum ada catatan. Gunakan formulir untuk menambahkan aktivitas pertama.';
      list.appendChild(empty);
      return;
    }
    const labels = { makan: 'Memberi makan', minum: 'Memberi minum', obat: 'Memberi obat', steril: 'Sterilisasi', vaksin: 'Vaksinasi', lainnya: 'Lainnya' };
    logs.forEach((log) => {
      const card = createElement('article');
      card.className = 'p-4 rounded-2xl bg-surface-container border border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-3';
      const detail = createElement('div');
      const title = createElement('h3');
      title.className = 'font-title-md text-on-surface font-bold';
      title.textContent = `${log.cat_name} · ${labels[log.activity] || log.activity}`;
      const location = createElement('p');
      location.className = 'font-body-sm text-sm text-on-surface-variant';
      location.textContent = `${log.location} · ${log.date}`;
      const notes = createElement('p');
      notes.className = 'font-body-sm text-sm text-on-surface-variant';
      notes.textContent = log.notes || 'Tidak ada catatan tambahan.';
      detail.append(title, location, notes);
      const buttons = createElement('div');
      buttons.className = 'flex gap-2 shrink-0';
      buttons.append(
        makeButton('Edit', 'edit-care', log.id, 'px-3 py-2 rounded-xl bg-surface-container-high text-on-surface font-semibold'),
        makeButton('Hapus', 'delete-care', log.id, 'px-3 py-2 rounded-xl bg-error-container text-on-error-container font-semibold'),
      );
      card.append(detail, buttons);
      list.appendChild(card);
    });
  }

  async function loadCareLogs() {
    if (!currentUser) {
      renderCareLogs([]);
      return;
    }
    const result = await request('care.list');
    renderCareLogs(result.logs);
  }

  document.getElementById('closeAccountModal').addEventListener('click', () => setModalVisible(accountModal, false));
  accountModal.addEventListener('click', (event) => {
    if (event.target === accountModal) setModalVisible(accountModal, false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!accountModal.classList.contains('pointer-events-none')) {
      setModalVisible(accountModal, false);
      profileButton?.focus();
    } else if (!reportModal.classList.contains('pointer-events-none')) {
      document.getElementById('closeModalBtn')?.click();
    }
  });

  const profileImage = document.querySelector('header img[alt="Foto Profil Relawan"]');
  const profileButton = profileImage?.parentElement;
  profileButton?.addEventListener('click', showAccountModal);
  profileButton?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      showAccountModal();
    }
  });
  ['closeModalBtn', 'cancelModalBtn', 'closeSuccessBtn'].forEach((id) => {
    document.getElementById(id)?.addEventListener('click', resetReportEditor);
  });

  document.addEventListener('click', (event) => {
    const accountButton = event.target.closest('[data-action="open-account"]');
    if (accountButton) showAccountModal();
    const foodButton = event.target.closest('.donate-food-btn');
    if (foodButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!currentUser) {
        showAccountModal();
        showToast('Masuk diperlukan', 'Masuk untuk mencatat aktivitas pemberian makan.');
        return;
      }
      const card = foodButton.closest('.sighting-card');
      if (card) prepareCareEntry(card, 'makan');
      showToast('Catatan makan disiapkan', 'Periksa lokasi dan tanggal, lalu simpan catatan perawatan.');
    }
    const trigger = event.target.closest('.open-report-btn');
    if (trigger && !currentUser) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showAccountModal();
      showToast('Masuk diperlukan', 'Silakan masuk atau daftar sebelum mengirim laporan.');
    }
    if (trigger && currentUser) resetReportEditor();
  }, true);

  document.addEventListener('submit', async (event) => {
    if (event.target === reportForm) {
      event.preventDefault();
      if (!currentUser) {
        showAccountModal();
        return;
      }
      const data = new FormData(reportForm);
      const action = editingReportId ? 'reports.update' : 'reports.create';
      if (editingReportId) data.append('id', editingReportId);
      try {
        await request(action, { method: 'POST', body: data, isForm: true });
        resetReportEditor();
        reportFormContainer.classList.add('hidden');
        reportSuccess.classList.remove('hidden');
        await loadReports();
        showToast('Laporan tersimpan', 'Data laporan kucing berhasil disimpan.');
      } catch (error) {
        showToast('Gagal menyimpan laporan', error.message);
      }
      return;
    }
    if (event.target.id === 'careForm') {
      event.preventDefault();
      if (!currentUser) {
        showAccountModal();
        return;
      }
      const values = Object.fromEntries(new FormData(event.target));
      if (editingCareId) values.id = editingCareId;
      try {
        await request(editingCareId ? 'care.update' : 'care.create', { method: 'POST', body: values });
        resetCareForm();
        await loadCareLogs();
        showToast('Catatan tersimpan', 'Aktivitas perawatan berhasil disimpan.');
      } catch (error) {
        showToast('Gagal menyimpan catatan', error.message);
      }
    }
  }, true);

  reportGrid.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const reportId = button.dataset.id;
    if (button.dataset.action === 'mark-report-seen') {
      const seen = button.dataset.marked === 'true';
      button.dataset.marked = String(!seen);
      button.textContent = seen ? 'Tandai Terlihat' : 'Terlihat Hari Ini';
      button.classList.toggle('bg-primary/20', !seen);
      button.classList.toggle('text-primary', !seen);
      showToast(seen ? 'Tanda dihapus' : 'Kucing dikonfirmasi', seen ? 'Tanda terlihat dibatalkan.' : 'Terima kasih sudah mengonfirmasi keberadaan kucing ini.');
      return;
    }
    if (button.dataset.action === 'edit-report') {
      try {
        const { reports } = await request('reports.list');
        const report = reports.find((item) => item.id === reportId);
        if (!report) throw new Error('Laporan tidak ditemukan.');
        editingReportId = report.id;
        reportForm.elements.cat_name.value = report.cat_name;
        reportForm.elements.location.value = report.location;
        reportForm.elements.color.value = report.color;
        reportForm.elements.age.value = report.age;
        reportForm.elements.condition.forEach((input) => { input.checked = input.value === report.condition; });
        reportForm.elements.reporter.value = report.reporter;
        reportForm.elements.contact.value = '';
        reportForm.elements.contact.disabled = true;
        reportForm.elements.description.value = report.description || '';
        reportModal.classList.remove('opacity-0', 'pointer-events-none');
        reportModal.setAttribute('aria-hidden', 'false');
        reportFormContainer.classList.remove('hidden');
        reportSuccess.classList.add('hidden');
        document.getElementById('submitReportBtn').querySelector('span:last-child').textContent = 'Simpan Perubahan';
        document.querySelector('#modalCard h3').textContent = 'Ubah Laporan Kucing';
        document.getElementById('modalLocationInput').focus();
      } catch (error) {
        showToast('Tidak dapat membuka laporan', error.message);
      }
    }
    if (button.dataset.action === 'delete-report' && window.confirm('Hapus laporan kucing ini?')) {
      try {
        await request('reports.delete', { method: 'POST', body: { id: reportId } });
        await loadReports();
        showToast('Laporan dihapus', 'Laporan kucing berhasil dihapus.');
      } catch (error) {
        showToast('Gagal menghapus laporan', error.message);
      }
    }
  });

  document.getElementById('careList').addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const id = button.dataset.id;
    if (button.dataset.action === 'delete-care' && window.confirm('Hapus catatan perawatan ini?')) {
      try {
        await request('care.delete', { method: 'POST', body: { id } });
        await loadCareLogs();
        showToast('Catatan dihapus', 'Catatan perawatan berhasil dihapus.');
      } catch (error) {
        showToast('Gagal menghapus catatan', error.message);
      }
    }
    if (button.dataset.action === 'edit-care') {
      try {
        const { logs } = await request('care.list');
        const log = logs.find((item) => item.id === id);
        if (!log) throw new Error('Catatan tidak ditemukan.');
        const form = document.getElementById('careForm');
        editingCareId = log.id;
        form.elements.cat_name.value = log.cat_name;
        form.elements.location.value = log.location;
        form.elements.activity.value = log.activity;
        form.elements.date.value = log.date;
        form.elements.notes.value = log.notes;
        document.getElementById('careFormTitle').textContent = 'Ubah catatan perawatan';
        document.getElementById('saveCareButton').textContent = 'Simpan perubahan';
        document.getElementById('cancelCareEdit').classList.remove('hidden');
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (error) {
        showToast('Tidak dapat membuka catatan', error.message);
      }
    }
  });
  document.getElementById('cancelCareEdit').addEventListener('click', resetCareForm);

  document.querySelectorAll('.map-control-center').forEach((button) => {
    button.addEventListener('click', locateCurrentUser);
  });
  document.querySelector('.map-control-zoom')?.addEventListener('click', (event) => {
    const map = document.getElementById('peta-lingkungan');
    const pins = map?.querySelector('[data-map-pins]');
    const roads = map?.querySelector('svg');
    if (!map || !pins || !roads) return;
    const currentZoom = Number(map.dataset.zoom || '1');
    const nextZoom = currentZoom >= 1.5 ? 1 : Math.round((currentZoom + 0.15) * 100) / 100;
    map.dataset.zoom = String(nextZoom);
    pins.style.transform = `scale(${nextZoom})`;
    pins.style.transformOrigin = 'center center';
    roads.style.transform = `scale(${nextZoom})`;
    roads.style.transformOrigin = 'center center';
    event.currentTarget.setAttribute('aria-label', `Perbesar peta; pembesaran ${Math.round(nextZoom * 100)}%`);
    showToast('Pembesaran peta', `${Math.round(nextZoom * 100)}%`);
  });

  document.querySelector('header button[aria-label="Laporan prioritas"]')?.addEventListener('click', () => {
    document.querySelector('.filter-pill[data-filter="urgent"]')?.click();
    document.getElementById('daftar-kucing').scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast('Laporan prioritas', 'Menampilkan laporan yang membutuhkan bantuan medis.');
  });

  function locateCurrentUser() {
    if (!navigator.geolocation) {
      showToast('GPS tidak tersedia', 'Peramban ini tidak mendukung geolokasi.');
      return;
    }
    const buttons = Array.from(document.querySelectorAll('.map-control-center, #detectGpsBtn'));
    buttons.forEach((button) => { button.disabled = true; });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        buttons.forEach((button) => { button.disabled = false; });
        const coordinates = `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
        const locationInput = document.getElementById('modalLocationInput');
        if (locationInput) locationInput.value = `Koordinat GPS: ${coordinates}`;
        showToast('Lokasi GPS didapat', `Koordinat: ${coordinates}. Tambahkan patokan alamat agar mudah ditemukan.`);
      },
      (error) => {
        buttons.forEach((button) => { button.disabled = false; });
        const messages = {
          1: 'Izin lokasi ditolak. Aktifkan izin lokasi untuk situs ini lalu coba lagi.',
          2: 'Lokasi tidak dapat ditentukan. Periksa GPS atau jaringan perangkat.',
          3: 'Permintaan lokasi terlalu lama. Coba lagi di area dengan sinyal GPS yang lebih baik.',
        };
        showToast('GPS gagal', messages[error.code] || 'Lokasi tidak dapat diakses.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  }

  document.getElementById('detectGpsBtn')?.addEventListener('click', locateCurrentUser);

  dropZone.setAttribute('role', 'button');
  dropZone.setAttribute('tabindex', '0');
  dropZone.setAttribute('aria-label', 'Pilih atau letakkan foto kucing di sini');
  dropZone.addEventListener('click', () => reportPhoto.click());
  dropZone.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      reportPhoto.click();
    }
  });
  dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.classList.add('border-primary', 'bg-primary/10');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('border-primary', 'bg-primary/10'));
  dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('border-primary', 'bg-primary/10');
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    reportPhoto.files = transfer.files;
    reportPhoto.dispatchEvent(new Event('change', { bubbles: true }));
  });
  reportPhoto.addEventListener('change', () => {
    const file = reportPhoto.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      reportPhoto.value = '';
      showToast('Foto tidak sesuai', 'Pilih foto JPG, PNG, atau WebP maksimal 5 MB.');
      return;
    }
    const label = dropZone.querySelector('.font-label-md');
    if (label) label.textContent = file.name;
  });

  document.getElementById('searchInput')?.addEventListener('input', (event) => {
    searchTerm = event.target.value.toLowerCase().trim();
    applyDynamicFilters();
  });
  document.getElementById('clearSearch')?.addEventListener('click', () => {
    searchTerm = '';
    applyDynamicFilters();
  });
  document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
    searchTerm = '';
    activeFilter = 'all';
    applyDynamicFilters();
  });
  document.getElementById('statusFilterBar')?.addEventListener('click', (event) => {
    const pill = event.target.closest('.filter-pill');
    if (!pill) return;
    activeFilter = pill.dataset.filter || 'all';
    applyDynamicFilters();
  });
  document.getElementById('sortSelect')?.addEventListener('change', (event) => {
    sortMode = event.target.value;
    sortDynamicReports();
  });

  async function initialize() {
    document.getElementById('careForm').elements.date.value = localDate();
    try {
      const session = await request('me');
      currentUser = session.user;
      csrfToken = session.csrf;
      updateHeader();
      await Promise.all([loadReports(), loadCareLogs()]);
    } catch (error) {
      showToast('Backend tidak terhubung', `${error.message} Jalankan aplikasi melalui server PHP.`);
      renderCareLogs([]);
    }
  }

  initialize();
})();
