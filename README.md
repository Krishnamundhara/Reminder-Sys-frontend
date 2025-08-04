# User Authentication System Frontend

This is the frontend React application for a user authentication system with admin approval workflow.

## Features

- User registration (signup)
- User login/logout
- Admin dashboard
- User approval by admin
- User profile management
- Role-based access control

## Tech Stack

- React
- React Router for navigation
- React Bootstrap for UI components
- Axios for API communication
- Context API for state management

## Project Structure

```
frontend/
├── public/           # Static files
├── src/              # Source code
│   ├── assets/       # Images and other assets
│   ├── components/   # Reusable components
│   │   ├── Footer.js
│   │   ├── Navbar.js
│   │   └── ProtectedRoute.js
│   ├── context/      # Context API files
│   │   └── AuthContext.js
│   ├── pages/        # Page components
│   │   ├── AdminDashboard.js
│   │   ├── Home.js
│   │   ├── Login.js
│   │   ├── PendingApproval.js
│   │   ├── PendingUsers.js
│   │   ├── Signup.js
│   │   ├── UserDashboard.js
│   │   └── UserProfile.js
│   ├── services/     # API services
│   │   └── api.js    # Axios API client
│   ├── App.js        # Main component
│   └── index.js      # Entry point
└── package.json      # Dependencies
```

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root directory with the following content:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. Start the development server:
   ```
   npm start
   ```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Runs tests
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from create-react-app

## Connecting to Backend

The frontend expects a backend API running at `http://localhost:5000/api` by default. You can change this by setting the `REACT_APP_API_URL` environment variable.

## User Roles

- **Regular Users** - Can access their dashboard and profile after approval
- **Admin Users** - Can approve/reject users and manage user accounts
