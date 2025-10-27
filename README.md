# Context 
### Create, Compile, Collab

**Context** is a collaborative code editor that lets users write, compile, and collaborate on code in real time. Built with React and Firebase, it features a VS Code-like editor with syntax highlighting, a live compiler, and real-time collaboration capabilities.

---

## Features

- **Authentication** - Secure login with Firebase Auth  
- **Document Management** - Create, save, and manage multiple code files  
- **Real-time Collaboration** - Multiple users can edit code together  
- **Working Compiler** - Execute Python, Java, and C code remotely  
- **Invite System** - Email invitations for collaboration  
- **Monaco Editor** - VS Code-like editing experience with syntax highlighting  

---

## Tech Stack

- React  
- Firebase (Authentication + Firestore)  
- Monaco Editor  
- RapidAPI + Judge0 (Code execution)  
- EmailJS  
- React Router DOM  
- Axios  

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
git clone <your-repo-url>
cd context-editor
```

---

### Step 2: Install Dependencies

```bash
npm install
```

---

### Step 3: Configure API Keys

**Important:** This project requires your own API keys from external services. The existing keys in the repository are placeholders only.

#### Get Your API Keys:

1. **Firebase** - https://firebase.google.com/
   - Create a new project
   - Enable Authentication (Google provider)
   - Enable Firestore Database
   - Get your config from Project Settings → General

2. **RapidAPI + Judge0** - https://rapidapi.com/
   - Subscribe to Judge0 API
   - Get your RapidAPI key from your dashboard

3. **EmailJS** - https://www.emailjs.com/
   - Create a service
   - Create email templates
   - Get your keys from Account → API Keys

#### Create `.env` File

In the root directory, create a file named `.env` and add your keys:

```
REACT_APP_FIREBASE_API_KEY=your_firebase_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

REACT_APP_RAPID_API_KEY=your_rapidapi_key
REACT_APP_EMAILJS_SERVICE_ID=your_emailjs_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

---

### Step 4: Run the App

```bash
npm start
```

Open http://localhost:3000

---

## Troubleshooting

- Make sure `.env` file exists in the root directory  
- Verify all API keys are correctly formatted  
- For Firebase login issues, enable 2-step verification on your Google Account  
- Check RapidAPI quota if compiler isn't working   