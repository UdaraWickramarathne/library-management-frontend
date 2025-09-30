# Frontend-Backend Integration Test Guide

## Quick Setup & Test Instructions

### 1. Start Backend Service
```bash
cd library-management-backend/user-service
./mvnw spring-boot:run
```

### 2. Start Frontend Service  
```bash
cd library-management-frontend
npm run dev
```

### 3. Test Integration

#### Login Test
1. Open browser to http://localhost:5173
2. Use default admin credentials:
   - Email: `admin@library.com`
   - Password: `admin123456`
3. Should login successfully

#### Create User Test
1. After login, navigate to "User Management"
2. Click "Add New User"
3. Test each user type:

**Student:**
- Full Name: Jane Smith
- Email: jane.smith@student.edu  
- Student ID: STU001
- Department: Computer Science
- Year of Study: 2
- Contact Number: +1987654321

**Librarian:**
- Full Name: John Doe
- Email: john.doe@library.com
- Employee ID: EMP001  
- Branch: Main Branch
- Work Shift: Morning
- Contact Number: +1234567890

**Admin:**
- Full Name: Admin User
- Email: admin.user@library.com
- Admin ID: ADMIN002
- Department: Administration
- Contact Number: +1122334455
- Permissions: ALL

#### Password Change Test
1. Login with newly created user credentials
2. Should automatically redirect to password change page
3. Enter current password (TemporaryPassword123)
4. Set new secure password
5. Should logout and require login with new password

## Field Mappings Updated

### Student Fields
- ✅ `fullName` → Full Name
- ✅ `email` → Email Address  
- ✅ `studentId` → Student ID
- ✅ `department` → Department (was faculty)
- ✅ `yearOfStudy` → Year of Study (new field)
- ✅ `contactNumber` → Contact Number (was phone)

### Librarian Fields  
- ✅ `fullName` → Full Name
- ✅ `email` → Email Address
- ✅ `employeeId` → Employee ID
- ✅ `branch` → Branch (was department)
- ✅ `workShift` → Work Shift (new field)
- ✅ `contactNumber` → Contact Number (was phone)

### Admin Fields
- ✅ `fullName` → Full Name  
- ✅ `email` → Email Address
- ✅ `adminId` → Admin ID (was employeeId)
- ✅ `department` → Department (new field)
- ✅ `contactNumber` → Contact Number (was phone)
- ✅ `permissions` → Permissions (new field)

## Changes Made

### Frontend Updates
1. **Port Configuration**: Changed from 8080 to 8081 in .env
2. **Token Field**: Updated from `accessToken` to `token` in authService
3. **Form Fields**: Updated CreateUserModal to match backend DTOs
4. **Field Names**: Updated all field mappings to match backend expectations
5. **Validation**: Updated form validation for new required fields
6. **Demo Credentials**: Updated login page with correct admin credentials

### Backend (Already Configured)
1. **CORS**: Already configured for localhost:5173
2. **DTOs**: Proper request/response structures exist
3. **Endpoints**: All required endpoints implemented
4. **Email**: Backend handles email sending automatically

## Troubleshooting

### CORS Issues
- Backend CORS is configured for localhost:5173
- Restart both services if issues persist

### Authentication Issues  
- Verify backend is on port 8081
- Check JWT token in browser dev tools
- Ensure proper token field name (`token` not `accessToken`)

### Field Validation Errors
- Check browser network tab for API responses
- Verify field names match backend DTOs exactly
- Ensure required fields are not empty

## Success Indicators

✅ Login redirects to dashboard  
✅ User creation shows success message  
✅ Email notification sent (check backend logs)  
✅ New users appear in users list  
✅ Password change flow works correctly  
✅ Role-based navigation visible  

The integration is now properly configured to match your backend API structure!