import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type { ReactNode } from "react";
import "./styles.css";

type Health = "checking" | "alive" | "unavailable";
type Theme = "light" | "dark";
type IconName =
  | "grid"
  | "layers"
  | "pulse"
  | "arrow"
  | "sun"
  | "moon"
  | "shield"
  | "document"
  | "sparkles"
  | "chevron"
  | "check"
  | "refresh";

function Icon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  const paths: Record<IconName, ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    layers: (
      <>
        <path d="m12 3 10 5-10 5L2 8Z" />
        <path d="m2 12 10 5 10-5M2 16l10 5 10-5" />
      </>
    ),
    pulse: (
      <>
        <path d="M2 12h5l3-8 4 16 3-8h5" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14m-5-5 5 5-5 5" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
      </>
    ),
    moon: <path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z" />,
    shield: (
      <>
        <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z" />
        <path d="m8.5 12 2.5 2.5 4.5-5" />
      </>
    ),
    document: (
      <>
        <path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10Z" />
        <path d="M13 3v7h7M8 14h8m-8 3h5" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4Z" />
        <path d="m20 2 .5 1.5L22 4l-1.5.5L20 6l-.5-1.5L18 4l1.5-.5Z" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    check: <path d="m5 12 4 4L19 6" />,
    refresh: (
      <>
        <path d="M20 7v5h-5M4 17v-5h5" />
        <path d="M6 7a7 7 0 0 1 12-2l2 3M4 16l2 3a7 7 0 0 0 12-2" />
      </>
    ),
  };
  return (
    <svg
      className={`icon ${className}`}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

const phases: {
  icon: IconName;
  label: string;
  title: string;
  body: string;
  detail: string;
  deliverables: string[];
}[] = [
  {
    icon: "shield",
    label: "Access",
    title: "Private by design.",
    body: "The right knowledge. Only for the right people.",
    detail:
      "Identity and permissions establish which documents each person can access, before any evidence reaches a model.",
    deliverables: [
      "Verified tenant identity",
      "Workspace roles",
      "Restricted document grants",
    ],
  },
  {
    icon: "document",
    label: "Evidence",
    title: "Nothing lost in translation.",
    body: "Every page, version, and source. Connected.",
    detail:
      "Versioned ingestion will preserve page boundaries, sections, and source spans from the original document through indexing.",
    deliverables: [
      "Versioned document uploads",
      "Page-aware parsing",
      "Recoverable ingestion jobs",
    ],
  },
  {
    icon: "sparkles",
    label: "Intelligence",
    title: "Answers with a why.",
    body: "Go from a good question to a verifiable answer.",
    detail:
      "Permission-aware hybrid retrieval will combine semantic and keyword search. Citation checks will connect answers to actual source text.",
    deliverables: [
      "Hybrid document search",
      "Verifiable source citations",
      "Clear uncertainty handling",
    ],
  },
];

function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem("atlasiq-appearance");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* Appearance remains usable when storage is disabled. */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function App() {
  const [health, setHealth] = useState<Health>("checking");
  const [attempt, setAttempt] = useState(0);
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [checkedAt, setCheckedAt] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#131420" : "#f4f5fa");
    try {
      localStorage.setItem("atlasiq-appearance", theme);
    } catch {
      /* Optional persistence. */
    }
  }, [theme]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -45% 0px" },
    );
    document
      .querySelectorAll("main section[id]")
      .forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 5000);
    let mounted = true;
    setHealth("checking");
    fetch("/health/live", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("API unavailable");
        const body: unknown = await response.json();
        if (
          typeof body !== "object" ||
          body === null ||
          !("status" in body) ||
          body.status !== "alive"
        )
          throw new Error("Unexpected API response");
        if (mounted) setHealth("alive");
      })
      .catch(() => {
        if (mounted) setHealth("unavailable");
      })
      .finally(() => {
        window.clearTimeout(timer);
        if (mounted)
          setCheckedAt(
            new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          );
      });
    return () => {
      mounted = false;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [attempt]);

  const healthLabel =
    health === "checking"
      ? "Connecting"
      : health === "alive"
        ? "API online"
        : "API unavailable";

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="ambient-light" aria-hidden="true" />
      <aside className="sidebar glass" aria-label="Main navigation">
        <a className="brand" href="#overview" aria-label="AtlasIQ overview">
          <span className="brand-mark">
            <Icon name="layers" />
          </span>
          Atlas<span className="brand-iq">IQ</span>
        </a>
        <div className="workspace-chip">
          <span className="workspace-icon">A</span>
          <div>
            Local workspace<small>Local development</small>
          </div>
          <span className="workspace-dot" />
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {(
            [
              { id: "overview", icon: "grid", label: "Overview" },
              { id: "roadmap", icon: "layers", label: "What’s next" },
              { id: "connection", icon: "pulse", label: "Connection" },
            ] as const
          ).map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`nav-item ${activeSection === item.id ? "active" : ""}`}
              aria-current={activeSection === item.id ? "location" : undefined}
              onClick={() => setActiveSection(item.id)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.id === "connection" && (
                <span className={`status-dot ${health}`} />
              )}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="foundation-note">
            <span className="tiny-spark">
              <Icon name="sparkles" />
            </span>
            <h2>A thoughtful foundation.</h2>
            <p>Building a clearer connection between knowledge and trust.</p>
            <span className="version-label">
              ATLASIQ <span>v0.1</span>
            </span>
          </div>
          <div className="appearance">
            <span>Appearance</span>
            <div
              className="appearance-switch"
              role="group"
              aria-label="Appearance"
            >
              <button
                aria-label="Light appearance"
                aria-pressed={theme === "light"}
                onClick={() => setTheme("light")}
              >
                <Icon name="sun" />
              </button>
              <button
                aria-label="Dark appearance"
                aria-pressed={theme === "dark"}
                onClick={() => setTheme("dark")}
              >
                <Icon name="moon" />
              </button>
            </div>
          </div>
        </div>
      </aside>
      <main id="main">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <Icon name="chevron" />
            <span>Overview</span>
          </div>
          <span className="environment-pill">
            <span className="status-dot development" /> Development preview
          </span>
        </header>
        <section id="overview" className="hero" aria-labelledby="hero-title">
          <div className="hero-copy enter">
            <div className="eyebrow">
              <span className="small-star">✦</span> CLARITY, CONNECTED.
            </div>
            <h1 id="hero-title">
              Knowledge.
              <br />
              <span>Beautifully clear.</span>
            </h1>
            <p className="hero-description">
              A new perspective on everything you know.
              <br className="desktop-break" /> Built for private knowledge.
              Designed for answers you can trust.
            </p>
            <a className="primary-button" href="#roadmap">
              Explore what’s ahead <Icon name="arrow" />
            </a>
            <div className="hero-caption">
              <span className="caption-line" /> Your sources. Your permissions.
              Your clarity.
            </div>
          </div>
          <div className="glass-art enter" aria-hidden="true">
            <div className="art-halo" />
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="art-stage">
              <div className="art-pane pane-back" />
              <div className="art-pane pane-middle" />
              <div className="art-pane pane-front">
                <div className="pane-edge" />
                <Icon name="sparkles" />
                <div className="pane-lines">
                  <i />
                  <i />
                  <i />
                </div>
                <span className="pane-corner">IQ</span>
              </div>
            </div>
            <div className="art-label source-label">
              <span className="label-icon">
                <Icon name="document" />
              </span>
              Connected sources
              <span className="mini-dot" />
            </div>
            <div className="art-label evidence-label">
              <span className="label-icon mint">
                <Icon name="shield" />
              </span>
              Grounded in evidence
            </div>
            <div className="art-dot dot-one" />
            <div className="art-dot dot-two" />
            <div className="art-footnote">THE VISION FOR ATLASIQ</div>
          </div>
        </section>
        <section
          className="connection-card glass enter"
          id="connection"
          aria-labelledby="connection-title"
        >
          <div className={`connection-symbol ${health}`}>
            <Icon name="pulse" />
          </div>
          <div className="connection-copy">
            <div className="connection-title-row">
              <h2 id="connection-title">A live connection.</h2>
              <span className={`health-badge ${health}`} role="status">
                <span className={`status-dot ${health}`} />
                {healthLabel}
              </span>
            </div>
            <p>
              {health === "alive"
                ? "The API is responding. Your local foundation is taking shape."
                : health === "checking"
                  ? "Checking the connection to your local API."
                  : "We couldn’t reach the local API. Start the service, then try again."}
            </p>
            <span className="connection-disclaimer">
              Process liveness only · Storage, database, and queue readiness are
              separate.
            </span>
          </div>
          <div className="connection-actions">
            <button
              className="secondary-button"
              disabled={health === "checking"}
              onClick={() => setAttempt(attempt + 1)}
            >
              <Icon
                name="refresh"
                className={health === "checking" ? "spinning" : ""}
              />
              Check connection
            </button>
            <span>
              {checkedAt
                ? `Last checked ${checkedAt}`
                : "Waiting for first check"}
            </span>
          </div>
        </section>
        <section
          id="roadmap"
          className="roadmap enter"
          aria-labelledby="roadmap-title"
        >
          <div className="section-heading">
            <div>
              <div className="eyebrow">THOUGHTFULLY BUILT. STEP BY STEP.</div>
              <h2 id="roadmap-title">Great answers start here.</h2>
            </div>
            <span className="phase-pill">
              <span className="phase-ring" />
              Phase 0 · Foundation
            </span>
          </div>
          <div className="feature-grid">
            {phases.map((phase, index) => (
              <article
                className={`feature-card glass ${expanded === index ? "expanded" : ""}`}
                key={phase.label}
              >
                <div className="feature-top">
                  <span className={`feature-icon feature-icon-${index}`}>
                    <Icon name={phase.icon} />
                  </span>
                  <span className="feature-number">0{index + 1}</span>
                </div>
                <div className="feature-label">{phase.label}</div>
                <h3>{phase.title}</h3>
                <p>{phase.body}</p>
                <button
                  className="feature-trigger"
                  aria-expanded={expanded === index}
                  aria-controls={`phase-detail-${index}`}
                  onClick={() => setExpanded(expanded === index ? null : index)}
                >
                  <span>Planned · Phase {index + 1}</span>
                  <span className="round-arrow">
                    <Icon name="arrow" />
                  </span>
                  <span className="sr-only">
                    {expanded === index ? "Hide" : "Show"}{" "}
                    {phase.label.toLowerCase()} details
                  </span>
                </button>
                <div
                  className="feature-details"
                  id={`phase-detail-${index}`}
                  hidden={expanded !== index}
                >
                  <p>{phase.detail}</p>
                  <ul>
                    {phase.deliverables.map((item) => (
                      <li key={item}>
                        <span className="list-dot" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>
        <footer>
          <div className="footer-note">
            <Icon name="layers" />
            <p>
              A glimpse of what’s coming.
              <span>
                Sign-in, uploads, search, and evaluations are still in
                development.
              </span>
            </p>
          </div>
          <span className="footer-wordmark">Made for clarity.</span>
        </footer>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
