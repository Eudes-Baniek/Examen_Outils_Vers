/* ── Configuration des APIs ─────────────────────────────── */
const API = {
  livres: 'http://localhost:8001/api',
  utilisateurs: 'http://localhost:8002/api',
  emprunts: 'http://localhost:8003/api',
  recommandation: 'http://localhost:8004',
};

/* ── Utilitaires ─────────────────────────────────────────── */
async function fetchAPI(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || err.error || JSON.stringify(err));
  }
  return res.json();
}

function showNotif(msg, type = 'success') {
  const el = document.getElementById('notification');
  el.textContent = msg;
  el.className = `notification ${type}`;
  setTimeout(() => { el.className = 'notification hidden'; }, 4000);
}

function loading(id) {
  document.getElementById(id).innerHTML =
    `<div class="loading"><div class="spinner"></div>Chargement...</div>`;
}

function empty(id, msg = 'Aucune donnée disponible') {
  document.getElementById(id).innerHTML =
    `<div class="empty-state"><div class="empty-icon">📭</div><p>${msg}</p></div>`;
}

function statCard(value, label) {
  return `<div class="stat-card"><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>`;
}

/* ── Tabs ────────────────────────────────────────────────── */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));

    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.remove('hidden');

    if (btn.dataset.tab === 'livres') loadLivres();
    if (btn.dataset.tab === 'utilisateurs') loadUtilisateurs();
    if (btn.dataset.tab === 'emprunts') loadEmprunts();
    if (btn.dataset.tab === 'recommandations') loadModelInfo();
  });
});

/* ── Modals ──────────────────────────────────────────────── */
function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', e => {
    if (e.target === m) m.classList.add('hidden');
  });
});

/* ══════════════════════════════════════════════════════════
   LIVRES
══════════════════════════════════════════════════════════ */
async function loadLivres() {
  loading('livres-list');

  const q = document.getElementById('search-livre').value.trim();
  const genre = document.getElementById('filter-genre').value;

  try {
    let url = `${API.livres}/livres/`;
    if (q) url = `${API.livres}/livres/search/?q=${encodeURIComponent(q)}`;
    else if (genre) url += `?genre=${genre}`;

    const data = await fetchAPI(url);
    const livres = data.results || data;

    if (!livres.length) {
      empty('livres-list', 'Aucun livre trouvé.');
      return;
    }

    document.getElementById('livres-list').innerHTML = livres.map(l => `
      <div class="card">
        <div class="card-title">${l.titre}</div>
        <div class="card-sub">✍️ ${l.auteur} | 📂 ${l.genre}</div>
        <div class="card-body">ISBN: ${l.isbn}</div>

        <div class="card-footer">
          <span class="badge ${l.est_disponible ? 'badge-success' : 'badge-danger'}">
            ${l.est_disponible ? '✓ Disponible' : '✗ Indisponible'}
          </span>

          <span class="badge badge-info">${l.quantite_disponible ?? '?'} ex.</span>

          <!-- ✅ BOUTON EMPRUNTER -->
          <button class="btn btn-sm btn-success"
            onclick="openEmpruntFromLivre(${l.id})"
            ${!l.est_disponible ? 'disabled' : ''}>
            Emprunter
          </button>
        </div>
      </div>
    `).join('');

  } catch (e) {
    empty('livres-list', `Erreur : ${e.message}`);
  }
}

/* 🔥 OUVERTURE EMPRUNT DIRECT */
function openEmpruntFromLivre(livreId) {
  openModal('modal-emprunt');
  document.getElementById('emprunt-livre-id').value = livreId;
}

async function addLivre() {
  const body = {
    titre: document.getElementById('livre-titre').value,
    auteur: document.getElementById('livre-auteur').value,
    isbn: document.getElementById('livre-isbn').value,
    genre: document.getElementById('livre-genre').value,
    annee_publication: document.getElementById('livre-annee').value || null,
    quantite_totale: parseInt(document.getElementById('livre-quantite').value),
    quantite_disponible: parseInt(document.getElementById('livre-quantite').value),
    description: document.getElementById('livre-description').value,
  };

  if (!body.titre || !body.auteur || !body.isbn) {
    showNotif('Titre, auteur et ISBN sont requis.', 'error');
    return;
  }

  try {
    await fetchAPI(`${API.livres}/livres/`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    showNotif('Livre ajouté avec succès ! 📚');
    closeModal('modal-add-livre');
    loadLivres();

  } catch (e) {
    showNotif(`Erreur : ${e.message}`, 'error');
  }
}

/* ══════════════════════════════════════════════════════════
   EMPRUNTS
══════════════════════════════════════════════════════════ */
async function loadEmprunts() {
  loading('emprunts-list');

  try {
    const data = await fetchAPI(`${API.emprunts}/emprunts/`);
    const emprunts = data.results || data;

    if (!emprunts.length) {
      empty('emprunts-list', 'Aucun emprunt enregistré.');
      return;
    }

    const statusBadge = {
      en_cours: 'badge-info',
      retourne: 'badge-success',
      en_retard: 'badge-danger'
    };

    document.getElementById('emprunts-list').innerHTML = `
      <table>
        <thead>
          <tr>
            <th>#</th><th>Utilisateur</th><th>Livre</th>
            <th>Date</th><th>Retour prévu</th><th>Statut</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${emprunts.map(e => `
            <tr>
              <td>${e.id}</td>
              <td>User #${e.utilisateur_id}</td>
              <td>Livre #${e.livre_id}</td>
              <td>${new Date(e.date_emprunt).toLocaleDateString('fr-FR')}</td>
              <td>${e.date_retour_prevue}</td>
              <td><span class="badge ${statusBadge[e.statut]}">${e.statut}</span></td>
              <td>
                ${e.statut === 'en_cours' || e.statut === 'en_retard'
        ? `<button class="btn btn-sm btn-success" onclick="retournerLivre(${e.id})">↩ Retour</button>`
        : 'Clôturé'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

  } catch (e) {
    empty('emprunts-list', `Erreur : ${e.message}`);
  }
}

/* 🔥 EMPRUNTER */
async function emprunterLivre() {
  const body = {
    utilisateur_id: parseInt(document.getElementById('emprunt-user-id').value),
    livre_id: parseInt(document.getElementById('emprunt-livre-id').value),
    notes: document.getElementById('emprunt-notes').value,
  };

  if (!body.utilisateur_id || !body.livre_id) {
    showNotif('Champs requis manquants.', 'error');
    return;
  }

  try {
    await fetchAPI(`${API.emprunts}/emprunts/emprunter/`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    showNotif('Emprunt enregistré ! 📋');
    closeModal('modal-emprunt');

    loadEmprunts();

    // 👉 aller directement à la section emprunts
    document.querySelector('.tab-btn[data-tab="emprunts"]').click();

  } catch (e) {
    showNotif(`Erreur : ${e.message}`, 'error');
  }
}

async function retournerLivre(id) {
  if (!confirm(`Confirmer retour #${id} ?`)) return;

  try {
    await fetchAPI(`${API.emprunts}/emprunts/${id}/retourner/`, {
      method: 'POST',
    });

    showNotif('Retour enregistré ! ✅');
    loadEmprunts();

  } catch (e) {
    showNotif(`Erreur : ${e.message}`, 'error');
  }
}

/* ── INIT ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadLivres();
});