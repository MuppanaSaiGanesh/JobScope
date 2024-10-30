const fetch = require('node-fetch');

exports.sendApplicationNotification = async (applicantName, applicantEmail, jobTitle) => {
  const url = 'https://mail-sender-api1.p.rapidapi.com/';
  const options = {
    method: 'POST',
    headers: {
      'x-rapidapi-key': '984a3355cdmshb457cb1df3ef014p194a63jsnb5e3e35b08af',
      'x-rapidapi-host': 'mail-sender-api1.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sendto: applicantEmail,  
      name: applicantName,
      replyTo: 'ganesh2019221909@gcrjy.ac.in', 
      ishtml: 'false',
      title: `Application Received for ${jobTitle}`,  
      body: `Hello ${applicantName},\n\nThank you for applying to the ${jobTitle} position. Our team will review your application, and we'll be in touch if your profile matches our requirements.\n\nBest regards,\nThe JobScope Team`
    })
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }
    const result = await response.text();
    console.log(`Email sent successfully: ${result}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
