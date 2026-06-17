<div align="center">
  <br/>
  <pre>
███████╗ █████╗ ██████╗ ██████╗ ██╗██████╗
╚══███╔╝██╔══██╗██╔══██╗██╔══██╗██║██╔══██╗
  ███╔╝ ███████║██████╔╝██████╔╝██║██████╔╝
 ███╔╝  ██╔══██║██╔═══╝ ██╔═══╝ ██║██╔══██╗
███████╗██║  ██║██║     ██║     ██║██║  ██║
╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝     ╚═╝╚═╝  ╚═╝
  </pre>
  <h1>ZapDir</h1>
  <h3>⚡ Blazing-fast terminal cleanup tool for heavy build artifacts</h3>

  <p>
    <a href="#features"><img src="https://img.shields.io/badge/🚀-features-6A0DAD?style=flat-square" alt="Features"/></a>
    <a href="#installation"><img src="https://img.shields.io/badge/📦-install-00BFA6?style=flat-square" alt="Install"/></a>
    <a href="#usage"><img src="https://img.shields.io/badge/🎯-usage-FF6F00?style=flat-square" alt="Usage"/></a>
    <a href="#license"><img src="https://img.shields.io/badge/📄-license-1A73E8?style=flat-square" alt="License"/></a>
  </p>
  <p>
    <img src="https://img.shields.io/badge/Node.js-≥18-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node"/>
    <img src="https://img.shields.io/badge/license-MIT-1A73E8?style=flat-square" alt="MIT"/>
    <img src="https://img.shields.io/badge/status-stable-00C853?style=flat-square" alt="Stable"/>
    <img src="https://img.shields.io/badge/PRs-welcome-FF6D00?style=flat-square" alt="PRs"/>
  </p>

  <br/>

  <p>
    <b>ZapDir</b> scans your project for <code>node_modules</code>, <code>.next</code>, <code>dist</code>, <code>build</code>, and other heavy junk folders — then lets you <b>nuke them from orbit</b> with a gorgeous interactive terminal UI.
  </p>

  <br/>
</div>

---

## ✨ Features

| | Feature | Detail |
|---|---|---|
| ⚡ | **Blazing fast** | Async parallel scanner — finds junk in seconds, not minutes |
| 🎨 | **Beautiful UI** | Powered by `@clack/prompts` — spinners, selectors, colored outputs |
| 🔍 | **Smart depth scan** | Recursively hunts junk at any directory level |
| 📊 | **Size bars** | Visual `██████░░░░` bars show relative sizes at a glance |
| 🎯 | **Color-coded sizes** | <span style="color:red">Red ≥ 500 MB</span> · <span style="color:orange">Yellow ≥ 100 MB</span> · <span style="color:green">Green < 100 MB</span> |
| 🛡️ | **Safe** | Dry-run mode + confirmation step — nothing gets deleted by accident |
| 🔌 | **13 patterns** | `node_modules` · `.next` · `.nuxt` · `.turbo` · `dist` · `build` · `.DS_Store` · `__pycache__` · `.cache` · `coverage` · `out` · `target` · `.parcel-cache` |
| 🧹 | **Resilient** | Gracefully skips permission errors, never crashes mid-scan |
| 🚫 | **Cancel anytime** | `Ctrl+C` is handled gracefully at every prompt |

---

## 🚀 Installation

### Global install (recommended)

```bash
npm install -g zapdir
```

### Run instantly with npx

```bash
npx zapdir
```

### From source

```bash
git clone https://github.com/yourname/zapdir.git
cd zapdir
npm install
npm start
```

---

## 🎯 Usage

### Interactive mode

```bash
zapdir
```

You'll be guided through a beautiful terminal workflow:

```
  ⚡  ZapDir  —  Terminal Cleanup Tool

  ✔  Which directory should I scan?  ·  ./my-project

  ◌  Scanning for junk...

  ┌──────────────────────────────────────────────┐
  │  🗑  Junk Found                              │
  │                                              │
  │  Total recoverable:  1.47 GB                 │
  │                                              │
  │  node_modules        /node_modules   245 MB  │
  │  .next               /.next          1.23 GB │
  │  dist                /dist            89 MB  │
  └──────────────────────────────────────────────┘

  ✔  Select items to delete  ›
     ◻  node_modules  .../node_modules    245 MB
     ◻  .next         .../.next          1.23 GB
     ◻  dist          .../dist            89 MB

  ✔  Delete 3 item(s) freeing 1.47 GB?  ·  Yes

  ◌  Deleting selected junk...

  ✔  Freed 1.47 GB of disk space!
     Your disk thanks you.
```

### Dry-run mode

Scan without deleting anything:

```bash
zapdir --dry-run
```

Specify a custom path:

```bash
zapdir --dry-run ~/Projects/my-app
```

Output:

```
  ██████████  node_modules    /node_modules      245.23 MB
  ██████░░░░  .next           /.next               1.23 GB
  ██░░░░░░░░  dist            /dist               89.45 MB

  Total: 1.47 GB across 3 item(s)
  No files were deleted. Run without --dry-run to clean.
```

### Scan a specific directory

```bash
zapdir ~/Projects/my-app
```

---

## 🧠 Patterns detected

| Pattern | What it is | Typical size |
|---|---|---|
| `node_modules` | npm dependencies | 100 MB – 1 GB |
| `.next` | Next.js build cache | 100 MB – 2 GB |
| `.nuxt` | Nuxt.js build cache | 100 MB – 1 GB |
| `.turbo` | Turborepo cache | 50 MB – 500 MB |
| `dist` | Bundled output | 10 MB – 500 MB |
| `build` | Compiled output | 10 MB – 500 MB |
| `.cache` | Cache folders | 10 MB – 500 MB |
| `coverage` | Test coverage reports | 5 MB – 100 MB |
| `out` | Output directory | 10 MB – 300 MB |
| `target` | Rust/RustPython build | 100 MB – 2 GB |
| `.parcel-cache` | Parcel bundler cache | 50 MB – 300 MB |
| `__pycache__` | Python bytecode cache | 1 MB – 50 MB |
| `.DS_Store` | macOS folder metadata | < 1 MB |

---

## 🧰 CLI options

| Argument | Description |
|---|---|
| `[path]` | Directory to scan (defaults to current directory) |
| `--dry-run` | Scan and show results without deleting anything |
| `--help` | Show help |

---

## 🛠️ How it works

```
┌──────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│  Walk    │ ──► │  Match       │ ──► │  Calculate   │ ──► │  Delete  │
│  files   │     │  patterns    │     │  sizes       │     │  safely  │
└──────────┘     └──────────────┘     └─────────────┘     └──────────┘
```

- **Scanner**: Uses `fs.promises.readdir` with `{ withFileTypes: true }` + `Promise.all` for parallel traversal — skips hidden directories for speed
- **Sizer**: Employs `opendir` streaming iterator to avoid memory blowup on huge directories
- **Deleter**: Parallel `fs.rm` with `recursive: true, force: true` via `Promise.allSettled` — isolates failures so one permission error doesn't block the rest

---

## 🤝 Contributing

PRs are welcome! If you have an idea for a new junk pattern or a UI improvement:

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/amazing`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing`)
5. Open a Pull Request

---

## 📄 License

MIT © Mayne-X

---

<div align="center">
  <br/>
  <p>
    <b>ZapDir</b> — reclaim your disk space, one zap at a time. ⚡
  </p>
  <p>
    If you find this useful, <a href="#top">⭐ star the repo</a> — it means a lot!
  </p>
  <br/>
</div>
