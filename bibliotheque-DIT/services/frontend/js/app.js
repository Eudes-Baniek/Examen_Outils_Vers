/* ── Configuration des APIs ─────────────────────────────── */
const API = {
  livres: 'http://localhost:8001/api',
  utilisateurs: 'http://localhost:8002/api',
  emprunts: 'http://localhost:8003/api',
  recommandation: 'http://localhost:8004',
};

/* ── Cache local ────────────────────────────────────────── */
let usersCache = {};
let livresCache = {};

/* ── Utilitaires ─────────────────────────────────────────── */
async function fetchAPI(url, options = {}) {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({
      detail: res.statusText
    }));

    throw new Error(
      err.detail || err.error || JSON.stringify(err)
    );
  }

  return res.json();
}

function showNotif(msg, type = 'success') {
  const el = document.getElementById('notification');

  el.textContent = msg;
  el.className = `notification ${type}`;

  setTimeout(() => {
    el.className = 'notification hidden';
  }, 4000);
}

function loading(id) {
  document.getElementById(id).innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      Chargement...
    </div>
  `;
}

function empty(id, msg = 'Aucune donnée disponible') {
  document.getElementById(id).innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">📭</div>
      <p>${msg}</p>
    </div>
  `;
}

function statCard(value, label) {
  return `
    <div class="stat-card">
      <div class="stat-value">${value}</div>
      <div class="stat-label">${label}</div>
    </div>
  `;
}

/* ── Tabs ───────────────────────────────────────────────── */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {

    document.querySelectorAll('.tab-btn')
      .forEach(b => b.classList.remove('active'));

    document.querySelectorAll('.tab-content')
      .forEach(t => t.classList.add('hidden'));

    btn.classList.add('active');

    document
      .getElementById(`tab-${btn.dataset.tab}`)
      .classList.remove('hidden');

    if (btn.dataset.tab === 'livres') loadLivres();
    if (btn.dataset.tab === 'utilisateurs') loadUtilisateurs();
    if (btn.dataset.tab === 'emprunts') loadEmprunts();
    if (btn.dataset.tab === 'recommandations') loadModelInfo();
  });
});

/* ── Modals ─────────────────────────────────────────────── */
function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', e => {
    if (e.target === m) {
      m.classList.add('hidden');
    }
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

    if (q) {
      url = `${API.livres}/livres/search/?q=${encodeURIComponent(q)}`;
    } else if (genre) {
      url += `?genre=${genre}`;
    }

    const data = await fetchAPI(url);
    const livres = data.results || data;

    /* Cache livres */
    livres.forEach(l => {
      livresCache[l.id] = l;
    });

    /* Stats */
    const stats = await fetchAPI(
      `${API.livres}/livres/stats/`
    ).catch(() => null);

    if (stats) {
      document.getElementById('livres-stats').innerHTML =
        statCard(stats.total_livres, 'Total livres') +
        statCard(stats.livres_disponibles, 'Disponibles') +
        statCard(stats.livres_indisponibles, 'Indisponibles');
    }

    if (!livres.length) {
      empty('livres-list', 'Aucun livre trouvé.');
      return;
    }

    document.getElementById('livres-list').innerHTML =
      livres.map(l => `
        <div class="card">

          <div class="card-title">
            ${l.titre}
          </div>

          <div class="card-sub">
            ✍️ ${l.auteur}
            &nbsp;|&nbsp;
            📂 ${l.genre}
          </div>

          <div class="card-body">
            ISBN : ${l.isbn}
          </div>

          <div class="card-footer">

            <span class="badge ${l.est_disponible ? 'badge-success' : 'badge-danger'}">
              ${l.est_disponible ? '✓ Disponible' : '✗ Indisponible'}
            </span>

            <span class="badge badge-info">
              ${l.quantite_disponible ?? '?'} ex.
            </span>

            <button
              class="btn btn-sm btn-success"
              onclick="openEmpruntFromLivre(${l.id})"
              ${!l.est_disponible ? 'disabled' : ''}
            >
              Emprunter
            </button>

          </div>
        </div>
      `).join('');

  } catch (e) {

    empty('livres-list', `Erreur : ${e.message}`);
  }
}

/* ── Ouvrir modal emprunt ─────────────────────────────── */
function openEmpruntFromLivre(livreId) {

  openModal('modal-emprunt');

  document.getElementById('emprunt-livre-id').value =
    livreId;
}

/* ── Ajouter livre ─────────────────────────────────────── */
async function addLivre() {

  const body = {
    titre: document.getElementById('livre-titre').value,
    auteur: document.getElementById('livre-auteur').value,
    isbn: document.getElementById('livre-isbn').value,
    genre: document.getElementById('livre-genre').value,
    annee_publication:
      document.getElementById('livre-annee').value || null,
    quantite_totale:
      parseInt(document.getElementById('livre-quantite').value),
    quantite_disponible:
      parseInt(document.getElementById('livre-quantite').value),
    description:
      document.getElementById('livre-description').value,
  };

  if (!body.titre || !body.auteur || !body.isbn) {
    showNotif(
      'Titre, auteur et ISBN sont requis.',
      'error'
    );
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
   UTILISATEURS
══════════════════════════════════════════════════════════ */
async function loadUtilisateurs() {

  loading('users-list');

  try {

    const data = await fetchAPI(
      `${API.utilisateurs}/utilisateurs/`
    );

    const users = data.results || data;

    /* Cache utilisateurs */
    users.forEach(u => {
      usersCache[u.id] = u;
    });

    /* Stats */
    const stats = await fetchAPI(
      `${API.utilisateurs}/utilisateurs/stats/`
    ).catch(() => null);

    if (stats) {

      document.getElementById('users-stats').innerHTML =
        statCard(stats.total, 'Total') +
        statCard(stats.etudiants, 'Étudiants') +
        statCard(stats.professeurs, 'Professeurs') +
        statCard(stats.personnels, 'Personnels');
    }

    if (!users.length) {
      empty('users-list', 'Aucun utilisateur enregistré.');
      return;
    }

    const typeColors = {
      etudiant: 'badge-info',
      professeur: 'badge-success',
      personnel: 'badge-warning',
    };

    document.getElementById('users-list').innerHTML =
      users.map(u => `
        <div class="card">

          <div class="card-title">
            ${u.nom_complet || `${u.prenom || ''} ${u.nom || ''}`}
          </div>

          <div class="card-sub">
            ✉️ ${u.email}
          </div>

          <div class="card-footer">

            <span class="badge ${typeColors[u.type_utilisateur] || 'badge-gray'}">
              ${u.type_utilisateur}
            </span>

            <span class="badge badge-gray">
              Max ${u.max_emprunts} emprunts
            </span>

            <span class="badge ${u.actif ? 'badge-success' : 'badge-danger'}">
              ${u.actif ? 'Actif' : 'Inactif'}
            </span>

          </div>
        </div>
      `).join('');

  } catch (e) {

    empty('users-list', `Erreur : ${e.message}`);
  }
}

/* ══════════════════════════════════════════════════════════
   EMPRUNTS
══════════════════════════════════════════════════════════ */
async function loadEmprunts() {

  loading('emprunts-list');

  try {

    /* Charger users + livres si cache vide */
    if (Object.keys(usersCache).length === 0) {
      await loadUtilisateurs();
    }

    if (Object.keys(livresCache).length === 0) {
      await loadLivres();
    }

    const data = await fetchAPI(
      `${API.emprunts}/emprunts/`
    );

    const emprunts = data.results || data;

    /* Stats */
    const stats = await fetchAPI(
      `${API.emprunts}/emprunts/stats/`
    ).catch(() => null);

    if (stats) {

      document.getElementById('emprunts-stats').innerHTML =
        statCard(stats.total_emprunts, 'Total') +
        statCard(stats.en_cours, 'En cours') +
        statCard(stats.retournes, 'Retournés') +
        statCard(stats.en_retard, 'En retard');
    }

    if (!emprunts.length) {
      empty('emprunts-list', 'Aucun emprunt enregistré.');
      return;
    }

    const statusBadge = {
      en_cours: 'badge-info',
      retourne: 'badge-success',
      en_retard: 'badge-danger',
    };

    document.getElementById('emprunts-list').innerHTML = `
      <table>

        <thead>
          <tr>
            <th>#</th>
            <th>Utilisateur</th>
            <th>Livre</th>
            <th>Date emprunt</th>
            <th>Retour prévu</th>
            <th>Statut</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          ${emprunts.map(e => {

      const user =
        usersCache[e.utilisateur_id];

      const livre =
        livresCache[e.livre_id];

      return `
              <tr>

                <td>${e.id}</td>

                <td>
                  ${user
          ? `${user.prenom} ${user.nom}`
          : `User #${e.utilisateur_id}`
        }
                </td>

                <td>
                  ${livre
          ? livre.titre
          : `Livre #${e.livre_id}`
        }
                </td>

                <td>
                  ${new Date(e.date_emprunt)
          .toLocaleDateString('fr-FR')}
                </td>

                <td>
                  ${e.date_retour_prevue}
                </td>

                <td>
                  <span class="badge ${statusBadge[e.statut] || 'badge-gray'}">
                    ${e.statut}
                  </span>
                </td>

                <td>
                  ${e.statut === 'en_cours' || e.statut === 'en_retard'
          ? `
                      <button
                        class="btn btn-sm btn-success"
                        onclick="retournerLivre(${e.id})"
                      >
                        ↩ Retour
                      </button>
                    `
          : `
                      <span style="color:var(--text-muted);font-size:12px">
                        Clôturé
                      </span>
                    `
        }
                </td>

              </tr>
            `;
    }).join('')}

        </tbody>

      </table>
    `;

  } catch (e) {

    empty('emprunts-list', `Erreur : ${e.message}`);
  }
}

/* ── Emprunter livre ───────────────────────────────────── */
async function emprunterLivre() {

  const body = {
    utilisateur_id: parseInt(
      document.getElementById('emprunt-user-id').value
    ),

    livre_id: parseInt(
      document.getElementById('emprunt-livre-id').value
    ),

    notes:
      document.getElementById('emprunt-notes').value,
  };

  if (!body.utilisateur_id || !body.livre_id) {

    showNotif(
      'User ID et Livre ID requis.',
      'error'
    );

    return;
  }

  try {

    await fetchAPI(
      `${API.emprunts}/emprunts/emprunter/`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );

    showNotif('Emprunt enregistré ! 📋');

    closeModal('modal-emprunt');

    await loadLivres();
    await loadEmprunts();

    /* Aller automatiquement sur Emprunts */
    document
      .querySelector('.tab-btn[data-tab="emprunts"]')
      .click();

  } catch (e) {

    showNotif(`Erreur : ${e.message}`, 'error');
  }
}

/* ── Retourner livre ───────────────────────────────────── */
async function retournerLivre(id) {

  if (!confirm(
    `Confirmer le retour de l'emprunt #${id} ?`
  )) return;

  try {

    await fetchAPI(
      `${API.emprunts}/emprunts/${id}/retourner/`,
      {
        method: 'POST'
      }
    );

    showNotif('Retour enregistré ! ✅');

    await loadLivres();
    await loadEmprunts();

  } catch (e) {

    showNotif(`Erreur : ${e.message}`, 'error');
  }
}

/* ══════════════════════════════════════════════════════════
   RECOMMANDATIONS
══════════════════════════════════════════════════════════ */
async function loadModelInfo() {

  try {

    const info = await fetchAPI(
      `${API.recommandation}/model/info`
    );

    document.getElementById('model-info').innerHTML = `
      <strong>Modèle :</strong> ${info.model_type}
      &nbsp;|&nbsp;

      <strong>Statut :</strong>
      ${info.is_trained ? '✅ Entraîné' : '⚠️ Non entraîné'}

      &nbsp;|&nbsp;

      <strong>Utilisateurs :</strong>
      ${info.n_users ?? 'N/A'}

      &nbsp;|&nbsp;

      <strong>Livres indexés :</strong>
      ${info.n_items ?? 'N/A'}
    `;

  } catch (e) {

    document.getElementById('model-info').innerHTML =
      `⚠️ Service recommandation indisponible : ${e.message}`;
  }
}

/* ── Vérification services ─────────────────────────────── */
async function checkServices() {

  const checks = [
    {
      id: 'dot-livres',
      url: `${API.livres}/livres/?page_size=1`
    },
    {
      id: 'dot-users',
      url: `${API.utilisateurs}/utilisateurs/?page_size=1`
    },
    {
      id: 'dot-emprunts',
      url: `${API.emprunts}/emprunts/?page_size=1`
    },
    {
      id: 'dot-reco',
      url: `${API.recommandation}/`
    },
  ];

  for (const { id, url } of checks) {

    try {

      await fetch(url, {
        signal: AbortSignal.timeout(3000)
      });

      document.getElementById(id)
        .classList.add('online');

    } catch {

      document.getElementById(id)
        .classList.add('offline');
    }
  }
}

/* ── Init ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {

  checkServices();

  await loadUtilisateurs();

  await loadLivres();

  setInterval(checkServices, 30000);
});