# Environment Configuration for Node.js Backend

This guide explains how to set up the required environment variables for the backend server to function correctly. Environment variables store sensitive information securely and help configure the application.

---

## Prerequisites

- Ensure you have Node.js installed on your system.
- Install the required dependencies using `yarn install` if not already done.

---

## Setting Up the `.env` File

1. **Create the `.env` File**

   In the root directory of your project, create a file named `.env` if it doesn’t already exist.

2. **Add the Following Variables**

   Copy and paste the following key-value pairs into your `.env` file:

   ```env
   PORT=<the port you want your backend server to run>
   CLERK_PUBLISHABLE_KEY=<your clerk project publishable key>
   CLERK_SECRET_KEY=<your clerk project secret key>
   GOOGLE_MAPS_API_KEY=<your google maps api key>
   FRONT_END_URL=<frontend server url>
   ```
