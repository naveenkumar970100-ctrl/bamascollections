/**
 * Home View (MVC - View Layer)
 * Serves a rich, branded visual API overview and health console.
 */
import mongoose from 'mongoose';

export const renderHomeView = (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting / Disconnected';
  const dbColor = mongoose.connection.readyState === 1 ? '#10b981' : '#f59e0b';
  const uptimeMinutes = Math.floor(process.uptime() / 60);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bamas Collections · Backend API (MERN Stack)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0d0f12;
      --card: #161a22;
      --border: #232936;
      --gold: #d4af37;
      --gold-light: #f5e6a8;
      --text: #f3f4f6;
      --muted: #9ca3af;
      --emerald: #10b981;
      --accent: #8b5cf6;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: radial-gradient(circle at top right, #1f1b2e, #0d0f12 70%);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2.5rem 1rem;
    }
    .container {
      max-width: 900px;
      width: 100%;
    }
    .header {
      text-align: center;
      margin-bottom: 2.5rem;
    }
    .eyebrow {
      font-size: 0.75rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--gold);
      font-weight: 600;
      display: inline-block;
      margin-bottom: 0.5rem;
    }
    h1 {
      font-family: 'Cinzel', serif;
      font-size: 2.5rem;
      color: #fff;
      font-weight: 700;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #fff 40%, var(--gold));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      color: var(--muted);
      font-size: 1rem;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.9rem;
      border-radius: 9999px;
      background: rgba(212, 175, 55, 0.1);
      border: 1px solid rgba(212, 175, 55, 0.3);
      font-size: 0.825rem;
      color: var(--gold-light);
      margin-top: 1rem;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${dbColor};
      box-shadow: 0 0 10px ${dbColor};
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    }
    .card h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #fff;
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .card p {
      font-size: 0.875rem;
      color: var(--muted);
      line-height: 1.5;
    }
    .meta-list {
      margin-top: 0.75rem;
      list-style: none;
      font-size: 0.825rem;
    }
    .meta-list li {
      padding: 0.3rem 0;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dashed var(--border);
    }
    .meta-list li span:last-child {
      color: #fff;
      font-weight: 500;
    }
    .endpoints {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 1.75rem;
      margin-bottom: 2rem;
    }
    .endpoints h2 {
      font-family: 'Cinzel', serif;
      font-size: 1.4rem;
      margin-bottom: 1rem;
      color: var(--gold-light);
    }
    .endpoint-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 0.75rem;
      border-radius: 0.5rem;
      margin-bottom: 0.5rem;
      background: rgba(255,255,255,0.02);
      font-family: monospace;
      font-size: 0.85rem;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .method {
      padding: 0.2rem 0.5rem;
      border-radius: 0.25rem;
      font-weight: 700;
      font-size: 0.75rem;
    }
    .method.get { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .method.post { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
    .method.put { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
    .method.delete { background: rgba(239, 68, 68, 0.2); color: #f87171; }
    .path a {
      color: var(--text);
      text-decoration: none;
      transition: color 0.2s;
    }
    .path a:hover {
      color: var(--gold);
      text-decoration: underline;
    }
    .desc {
      margin-left: auto;
      color: var(--muted);
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.775rem;
    }
    .footer {
      text-align: center;
      color: var(--muted);
      font-size: 0.825rem;
      padding-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <span class="eyebrow">MERN Stack · MVC Architecture</span>
      <h1>Bamas Collections API</h1>
      <p class="subtitle">Express 4 + MongoDB Atlas + Mongoose + Node.js Backend</p>
      <div class="badge">
        <div class="pulse-dot"></div>
        <span>MongoDB: <strong>${dbStatus}</strong></span>
        <span>·</span>
        <span>Port: <strong>${process.env.PORT || 5000}</strong></span>
        <span>·</span>
        <span>Environment: <strong>${process.env.NODE_ENV || 'development'}</strong></span>
      </div>
    </header>

    <div class="grid">
      <div class="card">
        <h3>🏛️ MVC Architecture</h3>
        <p>Strict separation of concerns implemented for scalability and maintainability:</p>
        <ul class="meta-list">
          <li><span>Models</span><span>User, Product, Order, Inquiry</span></li>
          <li><span>Views</span><span>Response presenters & HTML View</span></li>
          <li><span>Controllers</span><span>Auth, Product, Order, Inquiry</span></li>
          <li><span>Routes</span><span>Modular Express Routers</span></li>
        </ul>
      </div>

      <div class="card">
        <h3>🛡️ Authentication & Security</h3>
        <p>State-of-the-art authentication and security middleware:</p>
        <ul class="meta-list">
          <li><span>JWT Token</span><span>Bearer authorization</span></li>
          <li><span>Passwords</span><span>Bcrypt salted hash</span></li>
          <li><span>CORS</span><span>Client origin whitelist</span></li>
          <li><span>Validation</span><span>Mongoose schema validation</span></li>
        </ul>
      </div>

      <div class="card">
        <h3>⚡ Server Health</h3>
        <p>Real-time runtime statistics and connection status:</p>
        <ul class="meta-list">
          <li><span>Server Uptime</span><span>${uptimeMinutes} minute(s)</span></li>
          <li><span>Node Version</span><span>${process.version}</span></li>
          <li><span>Database Cluster</span><span>bamascollenctions.uefgz3u</span></li>
          <li><span>Status</span><span>Operational (HTTP 200)</span></li>
        </ul>
      </div>
    </div>

    <section class="endpoints">
      <h2>Interactive API Endpoints</h2>

      <div class="endpoint-item">
        <span class="method get">GET</span>
        <span class="path"><a href="/api/products" target="_blank">/api/products</a></span>
        <span class="desc">List all sarees (supports ?category=Silk, ?keyword=..., ?sort=...)</span>
      </div>

      <div class="endpoint-item">
        <span class="method get">GET</span>
        <span class="path"><a href="/api/products/featured" target="_blank">/api/products/featured</a></span>
        <span class="desc">Featured saree collection edit</span>
      </div>

      <div class="endpoint-item">
        <span class="method post">POST</span>
        <span class="path">/api/auth/register</span>
        <span class="desc">Register new customer account</span>
      </div>

      <div class="endpoint-item">
        <span class="method post">POST</span>
        <span class="path">/api/auth/login</span>
        <span class="desc">Sign in with email and password</span>
      </div>

      <div class="endpoint-item">
        <span class="method get">GET</span>
        <span class="path">/api/auth/profile</span>
        <span class="desc">Get logged-in customer profile (Requires JWT)</span>
      </div>

      <div class="endpoint-item">
        <span class="method post">POST</span>
        <span class="path">/api/inquiries</span>
        <span class="desc">Submit styling consultation or saree inquiry</span>
      </div>

      <div class="endpoint-item">
        <span class="method post">POST</span>
        <span class="path">/api/orders</span>
        <span class="desc">Place saree order (Requires JWT)</span>
      </div>
    </section>

    <footer class="footer">
      <p>© 2026 Bamas Collections · Timeless Sarees. Modern You.</p>
    </footer>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
};
