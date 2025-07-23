/*
Utility for sending email invitations using 
EmailJS. Called by the CollabModal.js when 
inviting collaborators.
*/

import emailjs from "@emailjs/browser"; 

const SERVICE_ID = process.env.REACT_APP_SERVICE_ID;
const TEMPLATE_ID = process.env.REACT_APP_TEMPLATE_ID;
const PUBLIC_KEY = process.env.REACT_APP_PUBLIC_KEY;
 
// Sends a shared code snippet to a given email address (selects "Share")
export const sendSharedCode = async ({ fromEmail, toEmail, codeContent, language }) => {
  try {
    const templateParams = {
      from_email: fromEmail,
      email: toEmail,
      message: `${codeContent}`, // Sends the code as the email message body
    };

    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    return { success: true, response };
  } catch (error) {
    console.error("EmailJS send error:", JSON.stringify(error, null, 2));
    return { success: false, error };
  }
};
 
// Sends an invite email with a collaboration link (selects "Invite")
export const inviteUser = async (toEmail, fromEmail, docLink) => {
  try {
    const templateParams = {
      from_email: fromEmail,
      email: toEmail,
      message: `You've been invited to collaborate on Collaborative Code Editor. Click the link to join: ${docLink}`,
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );

    console.log("EmailJS invite success:", response);
    return { success: true, response };
  } catch (error) {
    console.error("EmailJS invite error:", JSON.stringify(error, null, 2));
    return { success: false, error };
  }
};