/*
Displays project overview, project report, 
and contributor info.
*/

import React from "react";
import { useNavigate } from "react-router-dom";
import "./index.css"; 

function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      <h1 className="about-title">Context – Create, Compile, Collab</h1>  
      <div className="team-members">
        <h3>Group Members: Mohamed Sharif, Vincent Nguyen, Justice Gauldin, and Asrar Syed</h3> 
      </div>
      <p className="about-description">
        Context is a full-stack, cloud-based web application designed to help users 
        write, compile, and collaborate on code in real-time. Built with React and Firebase, CCE 
        enables multiple users to work together on shared documents with live editing and persistent 
        storage. Each document supports versioning, custom titles, user-based access controls, and 
        the ability to invite collaborators via secure email links. <br></br> <br></br>

        The backend leverages firebase authentication for secure login with google accounts, and cloud 
        firestore for real-time document management and permission handling. Users can create, edit, 
        and delete documents, while collaborators can contribute without compromising data integrity, due 
        to structured security rules. <br></br> <br></br>

        The interface includes features like document history management, downloadable files, and a 
        compiler pane. For code execution, CCE integrates with the Judge0 API, allowing users to compile and 
        run C, Java, and Python code directly from the browser. <br></br> <br></br>

        Whether you're a student, instructor, or developer, Context has the potential to offer a reliable 
        environment for coding and collaboration from any device.
      </p>

      <a href="/Report.pdf" download="Collaborative_Code_Editor_Report.pdf" className="download-button">
        Download our report for more details
      </a>

      <button className="back-button" onClick={() => navigate("/dashboard")}>
        Back to Dashboard
      </button>
    </div>
  );
}

export default AboutUs; 