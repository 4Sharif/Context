/*
Input validation utilities for emails, titles, and other user inputs.
*/

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validateTitle = (title) => {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: "Title cannot be empty" };
  }
  
  if (title.length > 100) {
    return { valid: false, error: "Title must be 100 characters or less" };
  }
  
  return { valid: true };
};

export const sanitizeString = (str) => {
  if (!str) return "";
  return str.replace(/<[^>]*>/g, "");
};
