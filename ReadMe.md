# Voyago - Trip Planner & Budget Handling App

A full-stack **Trip Planner & Budget Handling** application built with modern technologies, enabling users to plan trips, manage budgets, and split expenses seamlessly. This project demonstrates integration with **Clerk** for authentication, **Supabase** for backend services, **Google Maps API** for geolocation features, and a **React** frontend with a **Node.js** backend.

<video src="https://github.com/maneeshaindrachapa/voyago/blob/master/public/voyago-sample.mp4" controls="controls" style="width: 100%;">
</video>

## Features

- **User Authentication**: Powered by **Clerk** for secure and hassle-free user management.
- **Trip Management**: Users can create, update, and delete trips, and share trips with other users.
- **Budget Handling**: Add expenses, split them among trip participants, and calculate owed/paid amounts dynamically.
- **Interactive Map**: Visualize trip locations and covered countries using **Google Maps API**.
- **Real-Time Backend**: Backed by **Supabase** for database interactions and API calls.
- **Responsive Design**: Fully optimized for both desktop and mobile devices.

## Technologies Used

- **React.js**: Modern and reactive UI framework.
- **Clerk**: For authentication and user management.
- **Google Maps API**: Interactive map integration for trip locations.
- **Node.js**: Backend server for handling API requests.
- **Supabase**: Database as a service, used for data storage and querying.

## Features Walkthrough

1. **Authentication with Clerk**

   - Secure sign-up and login using Clerk.
   - Manage shared trips using user identifiers.

2. **Trip Management**

   - Create trips with names, countries, date ranges, and participants.
   - Upload trip-related data and view all trips in a user-friendly UI.

3. **Expense Handling**

   - Add expenses with details like type, amount, who paid, and split between participants.
   - View total trip expenses, individual contributions, and dynamic calculations of owed/paid amounts.

4. **Map Visualization**

   - Use the Google Maps API to mark locations visited during the trip.
   - Highlight countries covered with a dynamic SVG map.

5. **Real-Time Sync**
   - Use Supabase's live queries to synchronize data updates across devices in real-time.

## How to Run the Project

Check the README.md files inside frontend and backend folders.
