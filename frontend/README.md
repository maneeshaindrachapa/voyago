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

create table
public.trips (
id serial not null,
tripname text not null,
country text not null,
daterange jsonb not null,
ownerid text not null,
created_at timestamp without time zone null default now(),
imageurl text null,
locations jsonb null default '[]'::jsonb,
sharedusers jsonb not null default '[]'::jsonb,
constraint trips_pkey primary key (id)
) tablespace pg_default;

```

### Create the tasks Table

Run the following SQL command in your Supabase SQL editor to create the trips table:

```

create table
public.tasks (
id serial not null,
name text not null,
user_id text not null default requesting_user_id (),
constraint tasks_pkey primary key (id)
) tablespace pg_default;

```

### Create the notifications Table

Run the following SQL command in your Supabase SQL editor to create the notifications table:

```

create table
public.notifications (
id uuid not null default gen_random_uuid (),
user_id text not null,
trip_id integer null,
message text not null,
is_read boolean null default false,
created_at timestamp without time zone null default now(),
accept boolean null default false,
constraint notifications_pkey primary key (id),
constraint notifications_trip_id_fkey foreign key (trip_id) references trips (id) on delete cascade
) tablespace pg_default;

```

## Project Setup

1. Install Dependencies:<br>
   Run the following command to install the required dependencies:

```bash

yarn install

```

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
