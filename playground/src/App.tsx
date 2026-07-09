import './App.css'
import logoSvg from '/logo.svg'

/* ====== Inline SVG Icons ====== */
const icons = {
  github: (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  ),
  docs: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="1" width="12" height="14" rx="1.5" />
      <path d="M5 4.5h6M5 7.5h6M5 10.5h3" />
    </svg>
  ),
  nodes: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <path d="M10 6.5h4.5a2 2 0 012 2V14" />
    </svg>
  ),
  pointer: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2l2.5 11 2.5-4 4-2.5z" />
    </svg>
  ),
  hand: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1.5v7M5.5 3.5v5M10.5 3.5v5M3 7.5v3a4 4 0 004 4h2a4 4 0 004-4v-3M13 5.5v5" />
    </svg>
  ),
  edge: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <circle cx="3" cy="8" r="1.5" />
      <circle cx="13" cy="8" r="1.5" />
      <path d="M4.5 8c2 0 3-3 5-3s2 3 4 3" />
    </svg>
  ),
  zoomIn: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <circle cx="7" cy="7" r="5" />
      <path d="M11 11l3.5 3.5M7 5v4M5 7h4" />
    </svg>
  ),
  zoomOut: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <circle cx="7" cy="7" r="5" />
      <path d="M11 11l3.5 3.5M5 7h4" />
    </svg>
  ),
  fitView: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 5V2h3M11 2h3v3M14 11v3h-3M5 14H2v-3" />
      <rect x="5" y="5" width="6" height="6" rx="1" />
    </svg>
  ),
  undo: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h7a3 3 0 010 6H8" />
      <path d="M5 4L3 6l2 2" />
    </svg>
  ),
  redo: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 6H6a3 3 0 000 6h2" />
      <path d="M11 4l2 2-2 2" />
    </svg>
  ),
} as const

/* ====== Feature Data ====== */
const features = [
  {
    icon: '⚡',
    color: 'teal' as const,
    title: 'WebGL Rendering',
    description: 'GPU-accelerated rendering with custom shaders, MSDF text, and 9-slice scaling.',
  },
  {
    icon: '🔗',
    color: 'cyan' as const,
    title: 'Edge Routing',
    description: 'Intelligent edge geometry with smooth Bézier curves and connection handles.',
  },
  {
    icon: '📦',
    color: 'indigo' as const,
    title: 'Group Nodes',
    description: 'Nested node hierarchies with reparenting, subgraphs, and compositions.',
  },
  {
    icon: '↩️',
    color: 'purple' as const,
    title: 'Undo / Redo',
    description: 'Command-based history with serializable snapshots and full state replay.',
  },
]

function App() {
  return (
    <div className="app">
      {/* ---- Header ---- */}
      <header className="header" id="playground-header">
        <div className="header-brand">
          <img
            src={logoSvg}
            alt="Graph Giraffe logo"
            className="header-logo"
            width={32}
            height={32}
          />
          <span className="header-title">Graph Giraffe</span>
          <span className="header-badge">Playground</span>
        </div>

        <nav className="header-nav" aria-label="Playground navigation">
          <a
            href="https://github.com/HazelDaniel/graph-giraffe"
            target="_blank"
            rel="noopener noreferrer"
            className="header-nav-link"
            id="nav-github"
          >
            {icons.github}
            <span>GitHub</span>
          </a>
          <a href="#features" className="header-nav-link" id="nav-docs">
            {icons.docs}
            <span>Features</span>
          </a>
        </nav>
      </header>

      {/* ---- Main ---- */}
      <main className="main">
        <section className="playground" id="playground-canvas-section">
          {/* Toolbar */}
          <div className="toolbar" id="playground-toolbar" role="toolbar" aria-label="Editor tools">
            <div className="toolbar-group">
              <button className="toolbar-btn active" title="Select" id="tool-select">
                {icons.pointer}
                <span>Select</span>
              </button>
              <button className="toolbar-btn" title="Pan" id="tool-pan">
                {icons.hand}
                <span>Pan</span>
              </button>
            </div>

            <div className="toolbar-group">
              <button className="toolbar-btn" title="Add Node" id="tool-add-node">
                {icons.nodes}
                <span>Add Node</span>
              </button>
              <button className="toolbar-btn" title="Add Edge" id="tool-add-edge">
                {icons.edge}
                <span>Connect</span>
              </button>
            </div>

            <div className="toolbar-separator" />

            <div className="toolbar-group">
              <button className="toolbar-btn" title="Undo" id="tool-undo">
                {icons.undo}
              </button>
              <button className="toolbar-btn" title="Redo" id="tool-redo">
                {icons.redo}
              </button>
            </div>

            <div className="toolbar-group">
              <button className="toolbar-btn" title="Zoom In" id="tool-zoom-in">
                {icons.zoomIn}
              </button>
              <button className="toolbar-btn" title="Zoom Out" id="tool-zoom-out">
                {icons.zoomOut}
              </button>
              <button className="toolbar-btn" title="Fit View" id="tool-fit-view">
                {icons.fitView}
              </button>
            </div>

            <div className="toolbar-spacer" />

            <div className="toolbar-status">
              <span className="toolbar-status-dot" />
              <span>Ready</span>
            </div>
          </div>

          {/* Canvas */}
          <div className="canvas-container" id="editor-canvas">
            <canvas></canvas>
          </div>
        </section>

        {/* Features */}
        <section className="features-section" id="features">
          <div className="features-header">
            <h2>Capabilities</h2>
            <div className="features-header-line" />
          </div>
          <div className="features-grid">
            {features.map((f) => (
              <article className="feature-card" key={f.title}>
                <div className={`feature-card-icon ${f.color}`}>
                  <span>{f.icon}</span>
                </div>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* ---- Footer ---- */}
      <footer className="footer" id="playground-footer">
        <div className="footer-brand">
          <span>Graph Giraffe</span>
          <span className="footer-dot" />
          <span>Playground</span>
        </div>
        <span>Built with React + Vite</span>
      </footer>
    </div>
  )
}

export default App
