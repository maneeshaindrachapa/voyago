# Project Setup

This README provides the instructions to set up and run the project, including the necessary environment variables and database schema.

---

## Prerequisites

Ensure you have the following installed:

- **Node.js** (v16 or later)
- **npm** or **yarn**
- **Supabase account** and project
- **Google Maps API key**
- **Clerk account** for authentication
- **PostgreSQL** (if running Supabase locally)

---

## Environment Variables

Create a `.env` file in the root of your project and add the following environment variables:

```env
PORT=3000
REACT_APP_SUPABASE_URL=<Your Supabase URL>
REACT_APP_SUPABASE_ANON_KEY=<Your Supabase Anonymous Key>
REACT_APP_CLERK_FRONTEND_API=<Your Clerk Frontend API Key>
REACT_APP_GOOGLE_MAPS_API_KEY=<Your Google Maps API Key>
VITE_CLERK_PUBLISHABLE_KEY=<Your Clerk Publishable Key>
REACT_APP_BACKEND_URL=<Your Backend URL>
```

## Setting Up the Database in Supabase

### Create the trips Table

Run the following SQL command in your Supabase SQL editor to create the trips table:

```
CREATE TABLE public.trips (
    id SERIAL NOT NULL, -- Auto-incrementing primary key for each trip
    tripname TEXT NOT NULL, -- Name of the trip
    country TEXT NOT NULL, -- Country associated with the trip
    daterange JSONB NOT NULL, -- JSONB field for storing the date range
    ownerid TEXT NOT NULL, -- User ID of the trip owner
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(), -- Timestamp for when the trip was created
    imageurl TEXT, -- Optional field for storing the image URL
    locations JSONB DEFAULT '[]'::jsonb, -- JSONB array for storing locations
    sharedusers JSONB NOT NULL DEFAULT '[]'::jsonb, -- JSONB array for storing shared users
    CONSTRAINT trips_pkey PRIMARY KEY (id) -- Primary key constraint on the id column
) TABLESPACE pg_default;
```

### Create the tasks Table

Run the following SQL command in your Supabase SQL editor to create the trips table:

```
CREATE TABLE public.tasks (
    id SERIAL NOT NULL, -- Auto-incrementing primary key for each task
    name TEXT NOT NULL, -- Name of the task
    user_id TEXT NOT NULL DEFAULT current_user, -- User ID associated with the task, defaults to the requesting user
    CONSTRAINT tasks_pkey PRIMARY KEY (id) -- Primary key constraint on the id column
) TABLESPACE pg_default;
```

### Create the notifications Table

Run the following SQL command in your Supabase SQL editor to create the notifications table:

```
CREATE TABLE public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid(), -- Unique identifier for each notification
    user_id TEXT NOT NULL, -- The ID of the user receiving the notification
    trip_id INTEGER NULL, -- The ID of the associated trip (nullable)
    message TEXT NOT NULL, -- The notification message content
    is_read BOOLEAN DEFAULT FALSE, -- Indicates if the notification has been read
    created_at TIMESTAMP DEFAULT NOW(), -- Timestamp of notification creation
    accept BOOLEAN DEFAULT FALSE, -- Indicates acceptance status for notifications requiring action
    CONSTRAINT notifications_pkey PRIMARY KEY (id), -- Primary key constraint on id
    CONSTRAINT notifications_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE -- Foreign key constraint on trip_id
);
```

### Create expenses table

Run the following SQL command in your Supabase SQL editor to create the expenses table:

````
CREATE TABLE expenses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id INT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0), -- Ensure amount is positive
    expense_type TEXT NOT NULL CHECK (expense_type IN ('FOOD', 'TRAVEL', 'ACCOMMODATION', 'SHOPPING', 'MISC')),
    paid_by TEXT NOT NULL, -- Assuming this is a user ID, ensure proper referencing elsewhere if needed
    split_between JSONB NOT NULL, -- Ensure JSONB is used for split data
    created_at TIMESTAMP DEFAULT NOW()
);```

## Project Setup

1. Install Dependencies:<br>
   Run the following command to install the required dependencies:

```bash

yarn install

````

2. Start the Development Server:<br>
   Use the following command to start the development server:

```bash

yarn start

```

For formatting code and lint fixing run below commands

```bash

yarn run format
yarn run lint:fix

```
