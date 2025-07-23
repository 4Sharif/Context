/*
Entry point of the app. Sets up routing using 
react router to render different pages based on 
the current URL.
*/ 

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import DocsDashboard from "./DocsDashboard";
import AboutUs from "./AboutUs";
import LoginPage from "./LoginPage";
import "./index.css"; 

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Router>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<DocsDashboard />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/editor/:id" element={<App />} />
    </Routes>
  </Router>
);