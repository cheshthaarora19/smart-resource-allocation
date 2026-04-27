# CommunityBridge Frontend

Smart Resource Allocation — NGO Dashboard & Volunteer Interface

## Folder Structure

```
communitybridge/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx          ← React entry point
    ├── App.jsx           ← All UI: NGO Dashboard + Volunteer Interface
    ├── api/
    │   └── index.js      ← API stubs (swap mock → real fetch when backend is ready)
    └── data/
        └── mock.js       ← All mock/seed data
```

## How to Run

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open in browser
# http://localhost:5173
```

## Connecting to the Real Backend

When the backend is ready, open `src/api/index.js` and replace the mock functions with real fetch calls. Example:

```js
// BEFORE (mock)
export const getTasks = async () => {
  await delay();
  return [...mockTasks];
};

// AFTER (real backend)
export const getTasks = async () => {
  const res = await fetch('http://localhost:5000/tasks');
  return res.json();
};
```

All functions already match the API contract exactly.
