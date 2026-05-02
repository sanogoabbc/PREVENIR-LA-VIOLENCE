const packages = [
  { id: "trial", name: "Séance d'essai gratuite", sessions: 1, trial: true },
  { id: "single", name: "1 séance individuelle", sessions: 1, price: 50 },
  { id: "pack5", name: "Forfait 5 séances", sessions: 5, price: 240 },
  { id: "pack10", name: "Forfait 10 séances", sessions: 10, price: 470 },
  { id: "monthly", name: "Forfait mensuel", sessions: 8, price: 360 },
  { id: "group", name: "Tutorat de groupe", sessions: 4, price: 120 },
  { id: "exam", name: "Préparation aux examens", sessions: 6, price: 320 }
];

const state = {
  role: "parent",
  paidStudents: new Set(),
  trialsByStudent: new Set(),
  sessions: [
    { student: "Élève A", teacher: "Mme X", subject: "Math", date: "2026-05-03", time: "18:00", status: "confirmed", paid: true },
    { student: "Élève B", teacher: "Mme X", subject: "Français", date: "2026-05-05", time: "17:00", status: "trial", paid: false }
  ],
  payments: []
};

const packageSelect = document.getElementById("packageSelect");
const packagesEl = document.getElementById("packages");

packages.forEach(p => {
  const op = document.createElement("option");
  op.value = p.id;
  op.textContent = p.trial ? `${p.name} (0$)` : `${p.name} (${p.price}$)`;
  packageSelect.appendChild(op);

  const chip = document.createElement("span");
  chip.textContent = op.textContent;
  packagesEl.appendChild(chip);
});

function visibleSessions(role) {
  if (role === "admin") return state.sessions;
  if (role === "teacher") return state.sessions.filter(s => s.teacher === "Mme X" && s.status === "confirmed");
  if (role === "student") return state.sessions.filter(s => s.student === "Élève A");
  if (role === "parent") return state.sessions.filter(s => ["Élève A", "Élève B"].includes(s.student));
  return [];
}

function renderDashboard() {
  const root = document.getElementById("dashboardContent");
  const role = state.role;
  const sessions = visibleSessions(role);

  if (role === "admin") {
    root.innerHTML = `<p><strong>Admin</strong>: gestion complète (enseignants, élèves, parents, paiements, calendriers, essais, présences).</p>`;
  } else if (role === "teacher") {
    root.innerHTML = `<p><strong>Enseignant</strong>: cours du jour/semaine, profils élèves, notes pédagogiques, présences, devoirs, commentaires parents.</p>`;
  } else if (role === "student") {
    root.innerHTML = `<p><strong>Élève</strong>: seulement vos séances, matière, enseignant, lien Meet/Zoom.</p>`;
  } else {
    root.innerHTML = `<p><strong>Parent</strong>: enfants inscrits, cours à venir, paiements, factures, solde, absences.</p>`;
  }

  root.innerHTML += `<h3>Séances visibles (${sessions.length})</h3><ul>${sessions.map(s => `<li>${s.date} ${s.time} - ${s.student} - ${s.subject} - ${s.teacher} - ${s.status}</li>`).join("")}</ul>`;
}

function renderCalendar() {
  const ul = document.getElementById("calendarList");
  ul.innerHTML = "";
  for (const s of visibleSessions(state.role)) {
    const li = document.createElement("li");
    li.textContent = `${s.date} ${s.time} | ${s.student} | ${s.subject} | ${s.teacher} | ${s.status} | ${s.paid ? "payée" : "non payée"}`;
    ul.appendChild(li);
  }
}

function initActions() {
  document.getElementById("googleLoginBtn").addEventListener("click", () => {
    alert("OAuth Google (démo). En production: intégrer Google Identity Services + backend JWT + RBAC.");
  });

  document.getElementById("switchRoleBtn").addEventListener("click", () => {
    state.role = document.getElementById("roleSelect").value;
    renderDashboard();
    renderCalendar();
  });

  document.getElementById("paymentForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const student = fd.get("student").trim();
    const parent = fd.get("parent").trim();
    const pkg = packages.find(p => p.id === fd.get("package"));

    state.payments.push({ date: new Date().toISOString(), student, parent, package: pkg.name, sessions: pkg.sessions });
    if (!pkg.trial) state.paidStudents.add(student);

    state.sessions.push({
      student,
      teacher: "Mme X",
      subject: "Selon forfait",
      date: "2026-05-10",
      time: "18:00",
      status: pkg.trial ? "trial" : "confirmed",
      paid: !pkg.trial
    });

    alert(`Paiement confirmé pour ${student}. Reçu envoyé. ${pkg.sessions} séance(s) ajoutée(s).`);
    e.target.reset();
    renderDashboard();
    renderCalendar();
  });

  document.getElementById("trialForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const student = fd.get("studentName").trim();

    if (state.trialsByStudent.has(student)) {
      alert("Cet élève a déjà utilisé sa séance d'essai gratuite.");
      return;
    }

    state.trialsByStudent.add(student);
    state.sessions.push({
      student,
      teacher: "À assigner",
      subject: fd.get("subject"),
      date: fd.get("date"),
      time: "30 minutes",
      status: "trial_pending_admin",
      paid: false
    });

    alert("Demande de séance d'essai envoyée. En attente de validation administrateur.");
    e.target.reset();
    renderDashboard();
    renderCalendar();
  });
}

initActions();
renderDashboard();
renderCalendar();
