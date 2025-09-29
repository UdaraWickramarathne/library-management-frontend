# Library Management Frontend - Backend Integration

This document explains how the frontend connects to the backend API and handles user authentication and management.

## Overview

The frontend now integrates with the backend user-service API to:
- Authenticate users with real credentials
- Handle first-time password changes
- Allow admins to create user accounts
- Manage user status (activate/deactivate)

## API Integration

### Services

The frontend includes the following service files:

1. **`src/services/api.js`** - Base API service with request handling
2. **`src/services/authService.js`** - Authentication-related API calls
3. **`src/services/userService.js`** - User management API calls

### Authentication Flow

1. **Login**: Users enter email/password → API validates → JWT token returned
2. **First-time Login**: If `mustChangePassword` is true → Redirect to password change
3. **Password Change**: User sets new password → Token remains valid
4. **Protected Routes**: All routes check authentication status

## User Management Flow (Admin Only)

### Creating Users

1. Admin clicks "Add New User" button
2. Modal opens with form fields based on role:
   - **Students**: Full name, email, student ID, faculty
   - **Librarians**: Full name, email, employee ID, department
   - **Admins**: Full name, email, employee ID

3. Backend creates user with temporary password
4. Welcome email sent to user with login credentials
5. User list refreshes automatically

### User Status Management

- **Activate**: Admin can activate inactive users
- **Deactivate**: Admin can deactivate active users
- Only admins can perform these actions

## Configuration

### Environment Variables

Create a `.env` file in the frontend root:

```env
VITE_API_URL=http://localhost:8081
VITE_ENV=development
```

### Backend Requirements

The backend user-service should be running on port 8081 with the following endpoints:

- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/change-password-first-time` - Change password (first time)
- `GET /api/users` - Get all users (paginated)
- `POST /api/users/students` - Create student account
- `POST /api/users/librarians` - Create librarian account
- `POST /api/users/admins` - Create admin account
- `PATCH /api/users/{id}/activate` - Activate user
- `PATCH /api/users/{id}/deactivate` - Deactivate user

## Component Updates

### Updated Components

1. **AuthContext** - Now uses real API instead of mock data
2. **Login** - Connects to backend authentication
3. **Users Page** - Real user data with create/manage functionality
4. **App Router** - Handles first-time password change flow

### New Components

1. **FirstTimePasswordChange** - Password change form for new users
2. **CreateUserModal** - Modal for creating new user accounts

## Features Implemented

✅ Real authentication with backend API  
✅ First-time password change flow  
✅ User creation (admin only)  
✅ User status management  
✅ Role-based access control  
✅ Error handling and loading states  
✅ JWT token management  
✅ Email notifications (backend handles)  

## Usage Instructions

1. **Start the backend**: Ensure user-service is running on port 8081
2. **Start the frontend**: `npm run dev`
3. **Login as admin**: Use admin credentials from backend
4. **Create users**: Navigate to Users page → "Add New User"
5. **Test flow**: Create a test user → Login with temp password → Change password

## Demo Credentials

Use the credentials provided by your backend seeded data or create an admin account through the backend directly.

## Error Handling

The frontend handles common errors:
- Network connection issues
- Invalid credentials
- Server errors
- Validation errors
- Token expiration

All errors are displayed to users with appropriate messaging.