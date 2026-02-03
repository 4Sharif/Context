/*
Entry point of the app. Sets up routing using 
react router to render different pages based on 
the current URL.
*/ 

import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./hooks/useAuth";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";
import "./index.css"; 

const App = lazy(() => import("./App"));
const DocsDashboard = lazy(() => import("./DocsDashboard"));
const AboutUs = lazy(() => import("./AboutUs"));
const LoginPage = lazy(() => import("./LoginPage"));

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ErrorBoundary>
    <Router>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner message="Loading application..." />}>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard" element={<DocsDashboard />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/editor/:id" element={<App />} />
          </Routes>
        </Suspense>
        <Toaster position="bottom-right" />
      </AuthProvider>
    </Router>
  </ErrorBoundary>
);