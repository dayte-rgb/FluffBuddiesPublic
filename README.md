# Fluff Buddies CS205 Project

## Group Members
Turner Day, Gabriela Blanco Reyes, Sana Adnan, and David Broczkowski

## Goals
To create a comprehensive job scheduling and search website for pets, humans, and shelters!

## Instructions to Test Password Reset

This is only necessary when testing via localhost.

Create a new file ```.env``` and paste the following inside.

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
RESET_EMAIL_FROM="Paw Patrol <no-reply@pawpatrol.com>"
```

Fill in with your email information. For the password, make sure 2FA is turned on for your Google account.
Then, create an app password (just search on the settings page) and insert it where it says ```your-app-password```. If all of that was set up correctly, an email should now appear in your inbox!
