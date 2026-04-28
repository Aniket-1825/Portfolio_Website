// ── Project Data ──
const GITHUB_USERNAME = "Aniket-1825";

const defaultProjects = [
  {
    title: "Ola Analytics",
    description: "Dug into Ola ride data to understand cancellation patterns, peak hours, and revenue trends. Built interactive Power BI dashboards from raw SQL queries.",
    tags: ["SQL", "Power BI", "Data Analysis"],
    image: "ola-analysis.png",
    github: "https://github.com/Aniket-1825/Ola_Analytics",
    live: ""
  },
  {
    title: "Customer Behavior Analysis",
    description: "Explored customer purchasing patterns, segmentation, and retention metrics using Python and SQL. Visualized the findings in Power BI.",
    tags: ["Python", "SQL", "Power BI"],
    image: "customer-analysis.png",
    github: "https://github.com/Aniket-1825/Customer_behavior-Analysis",
    live: ""
  }
];

// ── Version key to force refresh when defaults change ──
const DATA_VERSION = "v3-redesign";
function loadProjects() {
  const ver = localStorage.getItem("portfolioVersion");
  if (ver !== DATA_VERSION) {
    localStorage.removeItem("portfolioProjects");
    localStorage.setItem("portfolioVersion", DATA_VERSION);
  }
  const saved = localStorage.getItem("portfolioProjects");
  return saved ? JSON.parse(saved) : [...defaultProjects];
}

function saveProjects(projects) {
  localStorage.setItem("portfolioProjects", JSON.stringify(projects));
}

// ── Render Projects ──
function renderProjects() {
  const grid = document.getElementById("projectsGrid");
  const projects = loadProjects();
  grid.innerHTML = "";

  projects.forEach((proj, idx) => {
    const card = document.createElement("div");
    card.className = "project-card reveal";

    const tagsHTML = (proj.tags || [])
      .map(t => `<span class="tag">${t}</span>`)
      .join("");

    const imgSrc = proj.image || `https://placehold.co/600x400/1a1a1a/f5f0eb?text=${encodeURIComponent(proj.title)}`;

    card.innerHTML = `
      <div class="project-card-img-wrap">
        <img class="project-card-img" src="${imgSrc}" alt="${proj.title}" loading="lazy"
             onerror="this.src='https://placehold.co/600x400/1a1a1a/f5f0eb?text=${encodeURIComponent(proj.title)}'"/>
      </div>
      <div class="project-card-body">
        <div class="project-card-tags">${tagsHTML}</div>
        <h3>${proj.title}</h3>
        <p>${proj.description}</p>
        <div class="project-card-links">
          ${proj.github ? `<a href="${proj.github}" target="_blank" class="project-link primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            GitHub</a>` : ""}
          ${proj.live ? `<a href="${proj.live}" target="_blank" class="project-link outline">Live Demo →</a>` : ""}
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  const statEl = document.getElementById("statProjects");
  if (statEl) statEl.textContent = projects.length;
  observeRevealElements();
}

// ── Fetch GitHub Repo ──
async function fetchGitHubRepo() {
  const urlInput = document.getElementById("githubRepoUrl");
  const statusEl = document.getElementById("fetchStatus");
  const fetchBtn = document.getElementById("fetchRepoBtn");
  const rawUrl = urlInput.value.trim();

  if (!rawUrl) {
    statusEl.textContent = "Please paste a GitHub repo URL";
    statusEl.style.color = "#c2b8ab";
    return;
  }

  const match = rawUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
  if (!match) {
    statusEl.textContent = "That doesn't look like a valid GitHub URL";
    statusEl.style.color = "#c2b8ab";
    return;
  }

  const owner = match[1];
  const repo = match[2].replace(/\.git$/, "");

  fetchBtn.textContent = "Fetching...";
  fetchBtn.disabled = true;
  statusEl.textContent = "Grabbing repo details...";
  statusEl.style.color = "var(--white-muted)";

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    if (!res.ok) throw new Error(`Couldn't find that repo (${res.status})`);
    const data = await res.json();

    const title = data.name.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    document.getElementById("projTitle").value = title;
    document.getElementById("projDesc").value = data.description || `${title} — a project by ${owner}.`;
    document.getElementById("projGithub").value = data.html_url;

    const tags = [];
    if (data.language) tags.push(data.language);
    if (data.topics && data.topics.length > 0) {
      data.topics.slice(0, 3).forEach(t => tags.push(t.replace(/\b\w/g, c => c.toUpperCase())));
    }
    if (tags.length === 0) tags.push("Project");
    document.getElementById("projTags").value = tags.join(", ");

    statusEl.textContent = `Got it — "${data.name}" is ready. Review and hit submit.`;
    statusEl.style.color = "var(--accent)";
  } catch (err) {
    statusEl.textContent = err.message;
    statusEl.style.color = "#c2b8ab";
  } finally {
    fetchBtn.textContent = "Fetch ↓";
    fetchBtn.disabled = false;
  }
}

// ── Add Project ──
function handleAddProject(e) {
  e.preventDefault();
  const projects = loadProjects();
  const tags = document.getElementById("projTags").value
    .split(",").map(t => t.trim()).filter(Boolean);

  projects.push({
    title: document.getElementById("projTitle").value,
    description: document.getElementById("projDesc").value,
    tags,
    github: document.getElementById("projGithub").value || "",
    live: document.getElementById("projLive").value || "",
    image: document.getElementById("projImage").value || ""
  });

  saveProjects(projects);
  renderProjects();
  closeModal();
  e.target.reset();
  document.getElementById("githubRepoUrl").value = "";
  document.getElementById("fetchStatus").textContent = "";

  document.getElementById("projects").scrollIntoView({ behavior: "smooth" });
}

// ── Contact Form ──
function handleContact(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = "Sent! ✓";
  btn.style.background = "var(--accent)";
  btn.style.color = "var(--black)";
  setTimeout(() => {
    btn.textContent = "Send Message →";
    btn.style.background = "";
    btn.style.color = "";
    e.target.reset();
  }, 2500);
}

// ── Modal ──
function openModal() { document.getElementById("addProjectModal").classList.add("active"); }
function closeModal() { document.getElementById("addProjectModal").classList.remove("active"); }

document.getElementById("addProjectNav").addEventListener("click", (e) => { e.preventDefault(); openModal(); });
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("addProjectModal").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeModal();
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

// ── Mobile Nav ──
document.getElementById("navToggle").addEventListener("click", () => {
  document.getElementById("navLinks").classList.toggle("open");
});
document.querySelectorAll(".nav-links a").forEach(a => {
  a.addEventListener("click", () => document.getElementById("navLinks").classList.remove("open"));
});

// ── Navbar scroll ──
window.addEventListener("scroll", () => {
  document.getElementById("navbar").classList.toggle("scrolled", window.scrollY > 50);
}, { passive: true });

// ── Reveal on Scroll ──
function observeRevealElements() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".reveal:not(.visible)").forEach(el => observer.observe(el));
}

// ── Init ──
renderProjects();
observeRevealElements();
