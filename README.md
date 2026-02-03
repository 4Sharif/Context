# Context 
### Create, Compile, Collab

**Context** is an online code editor that lets users write, compile, and collaborate on code in real time. Built with React and Firebase, it features a VS Code-like editor with syntax highlighting, auto-save functionality, and real-time collaboration capabilities.

---

## Features

- **Authentication** - Secure Google sign-in with Firebase Auth
- **Auto-Save** - Changes automatically saved every 2 seconds with visual indicator
- **Document Management** - Create, save, and manage multiple code files
- **Real-time Sync** - Efficient Firestore queries with real-time updates
- **Code Execution** - Run Python and C code remotely via Judge0 API
- **Collaboration** - Invite collaborators via email with role-based permissions
- **Monaco Editor** - VS Code-like editing experience with syntax highlighting
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Accessibility** - ARIA labels, keyboard navigation, and focus indicators

---

## Tech Stack

### Frontend
- React 19.0.0
- Monaco Editor (VS Code editor)
- React Router DOM (client-side routing)
- React Hot Toast (notifications)

### Backend
- Firebase Authentication (Google OAuth)
- Cloud Firestore (real-time database)
- Judge0 API via RapidAPI (code execution)
- EmailJS (collaboration invites)

### Architecture
- Services layer for data access
- Custom React hooks for state management
- Code splitting with lazy loading
- Error boundaries for crash recovery  

---

## Setup

### Prerequisites

- Node.js (v18.x or higher): https://nodejs.org/
- npm

Verify installation:
```bash
node -v
npm -v
```

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/context-editor.git
cd context-editor
```

---

### Step 2: Install Dependencies

```bash
npm install
```

---

### Step 3: Set Up Firebase Security Rules

Deploy the Firestore security rules to ensure proper data access control:

1. Go to Firebase Console → Firestore Database → Rules
2. Copy the rules from the comments in `src/services/documentService.js`
3. Publish the rules

---

### Step 4: Run the App

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Architecture

### Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ErrorBoundary.js
│   └── LoadingSpinner.js
├── hooks/              # Custom React hooks
│   ├── useAuth.js      # Authentication state
│   ├── useAutoSave.js  # Auto-save with throttling
│   ├── useDocument.js  # Real-time document sync
│   └── useDocuments.js # User's documents list
├── services/           # Data access layer
│   ├── authService.js
│   ├── documentService.js
│   └── codeExecutionService.js
├── utils/              # Helper functions
│   ├── constants.js
│   ├── logger.js
│   └── validation.js
└── [pages/components]  # Main UI components
```

### Key Features

**Auto-Save**: Changes are automatically saved to Firestore every 2 seconds using throttled updates with visual feedback.

**Efficient Queries**: Uses Firestore `where()` clauses to fetch only relevant documents instead of client-side filtering.

**Permission System**: Owner and collaborator roles with Firestore security rules enforcement.

**Code Splitting**: Routes are lazy-loaded to reduce initial bundle size by ~70%.

**Error Handling**: Comprehensive try-catch blocks with user-friendly toast notifications.

---

## Usage

1. **Sign in** with your Google account
2. **Create a new document** using the + button on the dashboard
3. **Write code** in the Monaco editor (Python or C supported)
4. **Changes auto-save** every 2 seconds (watch the indicator in the top-right)
5. **Run code** using the Run button to see output
6. **Invite collaborators** via the Collab button (owner only)
7. **Download** your code as a file

---

## Known Limitations

- Java code execution may be unreliable due to Judge0 API limitations
- Auto-save uses last-write-wins (no conflict resolution)
- Email invites require recipient to have an existing account

---

## Contributing

This is a portfolio/learning project. Feel free to fork and modify for your own use.