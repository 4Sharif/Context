/*
Service layer for code execution via Judge0 API.
Handles submission, response parsing, and error handling.
*/

import axios from "axios";
import logger from "../utils/logger";

const LANGUAGE_ID_MAP = {
  python: 71,
  java: 62,
  c: 50,
};

export const codeExecutionService = {
  async executeCode(code, language, stdin = "") {
    const languageId = LANGUAGE_ID_MAP[language];
    
    if (!languageId) {
      throw new Error(`Unsupported language: ${language}`);
    }
    
    const submissionData = {
      source_code: code,
      language_id: languageId,
      stdin: stdin,
    };
    
    try {
      logger.debug("Executing code:", { language, codeLength: code.length });
      
      const response = await axios.post(
        "https://judge0-ce.p.rapidapi.com/submissions",
        submissionData,
        {
          params: { base64_encoded: "false", wait: "true" },
          headers: {
            "content-type": "application/json",
            "x-rapidapi-key": process.env.REACT_APP_RAPIDAPI_KEY,
            "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
          },
          timeout: 30000,
        }
      );
      
      const result = response.data;
      
      if (result.stdout) {
        return { success: true, output: result.stdout };
      } else if (result.stderr) {
        return { success: false, output: `Runtime Error:\n${result.stderr}` };
      } else if (result.compile_output) {
        return { success: false, output: `Compilation Error:\n${result.compile_output}` };
      } else if (result.message) {
        return { success: false, output: `Error: ${result.message}` };
      } else {
        return { success: false, output: "No output received." };
      }
    } catch (error) {
      logger.error("Code execution error:", error);
      
      if (error.code === "ECONNABORTED") {
        throw new Error("Execution timed out. Your code may have an infinite loop.");
      } else if (!navigator.onLine) {
        throw new Error("No internet connection. Please check your network.");
      } else if (error.response) {
        const status = error.response.status;
        
        if (status === 401 || status === 403) {
          throw new Error("API authentication failed. Please contact support.");
        } else if (status === 429) {
          throw new Error("Rate limit exceeded. Please wait a moment and try again.");
        } else if (status === 503) {
          throw new Error("Code execution service is temporarily unavailable.");
        } else if (error.response.data?.message) {
          throw new Error(`Execution failed: ${error.response.data.message}`);
        }
      }
      
      throw new Error("Failed to execute code. Please try again.");
    }
  },
};
