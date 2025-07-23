# Context – Create, Compile, Collab

**Context** is a code editor application that lets users write, compile, and collaborate on code in real time. It supports versioning, user authentication, secure document sharing, and a live preview compiler for multiple languages.

---

## Features

- Firebase Authentication  
- Dashboard for document management
- Invite collaborators via email
- Version control with manual saves
- Monaco Editor with syntax highlighting
- Compiler integration using RapidAPI & Judge0
- Real-time data sync with Firebase Firestore
- EmailJS for collab invites 

---

## Tech Stack

- **React** – Frontend framework
- **Firebase** – Auth, Firestore, and Hosting
- **EmailJS** – Send email invites from client
- **Monaco Editor** – VSCode-like code editor
- **RapidAPI + Judge0** – Backend compiler support
- **React Router DOM** – Page navigation
- **Axios** – API requests
- **CSS** – Custom component styling

---

## Local Setup Instructions

Follow these steps to run the project on your own machine.

### Prerequisites

- Node.js (LTS recommended: v18.x or higher): https://nodejs.org/
- npm (comes with Node.js)

Verify installation:
```bash
node -v
npm -v
```

---

### Step-by-Step Setup

#### 1. Create a New React App
```bash
npx create-react-app context
cd context
```

#### 2. Replace Files
- Delete the default `src/` and `public/` folders
- Copy the provided `src/` and `public/` into your project
- Overwrite the existing `package.json` and `package-lock.json` with the ones provided
- Create a new `.env` file and paste your API keys (see below)

**Folder Structure After Setup:**
```
context/
├── node_modules/
├── public/             ← replaced
├── src/                ← replaced
├── package.json        ← replaced
├── package-lock.json   ← replaced
├── .env                ← your API keys go here
```

---

#### 3. Install Dependencies
```bash
npm install
```

This installs:
- React
- Firebase
- EmailJS
- React Router DOM
- Axios
- Monaco Editor 

---

#### 4. Create Your `.env` File

Inside the root of your project (`context/`), create a file named `.env` and add:

```
REACT_APP_FIREBASE_API_KEY=yourKeyHere
REACT_APP_FIREBASE_AUTH_DOMAIN=yourProject.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=yourProjectId
REACT_APP_FIREBASE_STORAGE_BUCKET=yourBucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=yourSenderId
REACT_APP_FIREBASE_APP_ID=yourAppId

REACT_APP_RAPID_API_KEY=yourRapidAPIkey
REACT_APP_EMAILJS_SERVICE_ID=yourServiceID
REACT_APP_EMAILJS_TEMPLATE_ID=yourTemplateID
REACT_APP_EMAILJS_PUBLIC_KEY=yourEmailJSPublicKey
```

---

#### 5. Run the App

```bash
npm start
```

It will open automatically in your browser at:

```
http://localhost:3000
```

---  

## Troubleshooting

- Ensure you ran `npm install` before `npm start`
- Make sure `.env` file exists and is correctly formatted
- If Firebase login fails, enable 2-step verification (MFA) on your Google Account
- For CORS or compiler issues, check if your RapidAPI plan has hit its quota

--- 