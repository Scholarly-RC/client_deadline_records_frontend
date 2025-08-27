# Client Deadline Records Backend API Reference

This document serves as a complete reference for the Client Deadline Records Backend API, intended for frontend development and AI agents working with this system.

## System Overview

The Client Deadline Records Backend is a Django REST API system for managing client tasks, deadlines, and compliance workflows. It features user management, client management, task tracking, approval workflows, and notifications.

## Base Configuration

### Environment URLs
- **Development**: `http://localhost:8000`
- **Production**: Configure based on deployment environment

### Authentication Method
- JWT Token-based authentication
- Access tokens for API requests
- Refresh tokens for token renewal

## Authentication

### Login Endpoint
```http
POST /api/token/
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Token Usage
```http
Authorization: Bearer <access_token>
```

### Token Refresh
```http
POST /api/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

## Data Models

### User Model
```json
{
  "id": 1,
  "first_name": "John",
  "middle_name": "M",
  "last_name": "Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "fullname": "John M Doe",
  "role": "admin",
  "is_active": true,
  "last_login": "2024-01-15 02:30 PM",
  "is_admin": true,
  "has_logs": false
}
```

**Field Details:**
- `role`: "admin" or "staff"
- `fullname`, `last_login`, `is_admin`, `has_logs`: Read-only fields

### Client Model
```json
{
  "id": 1,
  "name": "ABC Corporation",
  "contact_person": "Jane Smith",
  "email": "contact@abc.com",
  "phone": "+1234567890",
  "date_of_birth": "1990-05-15",
  "address": "123 Main St",
  "status": "active",
  "tin": "123456789",
  "notes": "Important client notes",
  "created_by": { /* UserMiniObject */ },
  "created_at": "2024-01-15 02:30 PM",
  "updated_at": "2024-01-15 02:30 PM",
  "is_active": true
}
```

**Field Details:**
- `date_of_birth`: Format YYYY-MM-DD
- `status`: "active" or "inactive"
- `created_by`, `created_at`, `updated_at`, `is_active`: Read-only fields

### Task Model
```json
{
  "id": 1,
  "client": 1,
  "client_detail": { /* ClientMiniObject */ },
  "category": "compliance",
  "description": "Annual compliance filing",
  "status": "not_yet_started",
  "assigned_to": 2,
  "assigned_to_detail": { /* UserObject */ },
  "priority": "high",
  "deadline": "2024-03-15",
  "remarks": "Additional notes",
  "date_complied": "2024-03-10",
  "completion_date": "2024-03-10",
  "last_update": "2024-01-15 02:30 PM",
  "period_covered": "Q1 2024",
  "engagement_date": "2024-01-01",
  "current_approval_step": 0,
  "requires_approval": false,
  "pending_approver": { /* UserMiniObject */ },
  "approval_history": [],
  "status_history_display": [],
  "category_specific_fields": {}
}
```

**Core Field Details:**
- `priority`: "high", "medium", "low"
- `deadline`, `date_complied`, `completion_date`, `engagement_date`: Format YYYY-MM-DD
- Read-only fields: `client_detail`, `assigned_to_detail`, `last_update`, `pending_approver`, `approval_history`, `status_history_display`, `category_specific_fields`

**Category-Specific Fields:**
- **Compliance**: `steps`, `requirements`
- **Financial Statement**: `type`, `needed_data`
- **Tax Case**: `tax_category`, `tax_type`, `form`, `working_paper`, `tax_payable`, `last_followup`
- **Miscellaneous**: `area`

### Task Categories
- `compliance`: Compliance
- `financial_statement`: Financial Statement Preparation
- `accounting_audit`: Accounting Audit
- `finance_implementation`: Finance Implementation
- `hr_implementation`: Human Resource Implementation
- `miscellaneous`: Miscellaneous Tasks
- `tax_case`: Tax Case

### Required Fields by Category
- **Compliance**: `period_covered`, `engagement_date`
- **Financial Statement**: `type`, `needed_data`
- **Tax Case**: `period_covered`, `working_paper`, `engagement_date`
- **Miscellaneous**: `area`, `period_covered`, `engagement_date`
- **Others**: `period_covered`, `engagement_date`

### Task Status Options
- `completed`: Completed
- `for_revision`: For Revision
- `for_checking`: For Checking
- `on_going`: On Going
- `pending`: Pending
- `not_yet_started`: Not Yet Started
- `cancelled`: Cancelled

### Tax Case Specific Enums
- **Tax Category**: "OTE" (Other Tax), "RP" (Real Property)
- **Tax Type**: "PT" (Property Tax), "IT" (Income Tax), "WE" (Withholding Tax)
- **Form**: "2551Q", "1701", "0619E", "1601EQ"

### Notification Model
```json
{
  "id": 1,
  "recipient": { /* UserMiniObject */ },
  "title": "Task Approval Required",
  "message": "Task 'Annual Filing' requires your approval",
  "link": "tasks/1/approve",
  "is_read": false,
  "created_at": "2024-01-15 02:30 PM",
  "timesince_created": "2 hours ago"
}
```

**Field Details:**
- `recipient`, `is_read`, `created_at`, `timesince_created`: Read-only fields

## API Endpoints

### Authentication Endpoints
```http
POST /api/token/                    # User login
POST /api/token/refresh/            # Refresh access token
```

### User Management Endpoints
```http
GET    /api/users/                          # List all users
POST   /api/users/                          # Create new user
GET    /api/users/{id}/                     # Get specific user
PUT    /api/users/{id}/                     # Update user
DELETE /api/users/{id}/                     # Delete user
GET    /api/users/get-current-user/         # Get current authenticated user
POST   /api/users/{id}/toggle-active-status/ # Toggle user active status
GET    /api/users/user-choices/             # Get list of active users
GET    /api/users/{id}/unread-notification-count/ # Get unread notification count
GET    /api/users/{id}/deadlines-tasks/     # Get user's deadline tasks
```

### Client Management Endpoints
```http
GET    /api/clients/                # List all clients
POST   /api/clients/                # Create new client
GET    /api/clients/{id}/           # Get specific client
PUT    /api/clients/{id}/           # Update client
DELETE /api/clients/{id}/           # Delete client
GET    /api/clients/birthdays/      # Get client birthday information
```

### Task Management Endpoints
```http
GET    /api/tasks/                          # List tasks (with filtering support)
POST   /api/tasks/                          # Create new task
GET    /api/tasks/{id}/                     # Get specific task
PUT    /api/tasks/{id}/                     # Update task
DELETE /api/tasks/{id}/                     # Delete task
GET    /api/tasks/overdue/                  # Get overdue tasks
GET    /api/tasks/due_soon/                 # Get tasks due within 7 days
GET    /api/tasks/by_category/?category={cat} # Filter tasks by category
GET    /api/users/{id}/deadlines-tasks/     # Get user-specific tasks (paginated)
GET    /api/tasks/statistics/               # Get task statistics
POST   /api/tasks/{id}/mark_completed/      # Mark task as completed
POST   /api/tasks/{id}/update-deadline/     # Update task status
```

### Approval Workflow Endpoints
```http
POST   /api/tasks/{id}/initiate-approval/   # Initiate approval process
POST   /api/tasks/{id}/process-approval/    # Process approval (approve/reject)
GET    /api/tasks/{id}/approval-history/    # Get approval history
GET    /api/tasks/pending-approvals/        # Get pending approvals (admin only)
```

### Notification Endpoints
```http
GET    /api/notifications/                  # List user notifications
POST   /api/notifications/{id}/mark-as-read/ # Mark notification as read
```

### Statistics Endpoints
```http
GET    /api/stats/                          # Get dashboard statistics
```

## Query Parameters and Filtering

### Task Filtering Parameters
```http
GET /api/tasks/?client=1&status=pending&priority=high&page=1&page_size=20
```

**Available Filters:**
- `client`: Filter by client ID
- `category`: Filter by task category
- `status`: Filter by task status
- `priority`: Filter by task priority
- `assigned_to`: Filter by assigned user ID
- `engagement_date__gte`: Engagement date >= (YYYY-MM-DD)
- `engagement_date__lte`: Engagement date <= (YYYY-MM-DD)
- `deadline__gte`: Deadline >= (YYYY-MM-DD)
- `deadline__lte`: Deadline <= (YYYY-MM-DD)
- `search`: Search in description, remarks, and other text fields
- `ordering`: Sort by field (deadline, priority, status, etc.)

### Pagination Parameters
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: system defined)

### Pagination Response Format
```json
{
  "count": 50,
  "next": "http://api.example.com/tasks/?page=3",
  "previous": "http://api.example.com/tasks/?page=1",
  "results": [/* array of objects */]
}
```

## Key Workflows

### 1. User Authentication Flow
```javascript
// 1. Login
const loginResponse = await fetch('/api/token/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'user', password: 'pass' })
});

// 2. Store tokens
const { access, refresh } = await loginResponse.json();

// 3. Use access token in subsequent requests
const apiResponse = await fetch('/api/tasks/', {
  headers: { 'Authorization': `Bearer ${access}` }
});

// 4. Refresh token when needed
const refreshResponse = await fetch('/api/token/refresh/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refresh })
});
```

### 2. Task Creation Flow
```javascript
const taskData = {
  client: 1,
  category: "compliance",
  description: "Q1 Compliance Filing",
  assigned_to: 2,
  priority: "high",
  deadline: "2024-03-31",
  // Required for compliance category
  period_covered: "Q1 2024",
  engagement_date: "2024-01-01"
};

const response = await fetch('/api/tasks/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify(taskData)
});
```

### 3. Approval Workflow
```javascript
// Step 1: Initiate approval process
await fetch('/api/tasks/1/initiate-approval/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    approvers: [3, 4, 5] // Admin user IDs in approval order
  })
});

// Step 2: Process approval (by approver)
await fetch('/api/tasks/1/process-approval/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    action: "approved", // or "rejected"
    comments: "Approved with minor comments"
  })
});

// Step 3: Check pending approvals (admin only)
const pendingApprovals = await fetch('/api/tasks/pending-approvals/', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

### 4. Notification Management
```javascript
// Check unread notification count
const unreadCount = await fetch('/api/users/1/unread-notification-count/', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
// Response: {"unread_count": 5}

// Get all notifications
const notifications = await fetch('/api/notifications/', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});

// Mark notification as read
await fetch('/api/notifications/123/mark-as-read/', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

## Permission System

### User Roles
- **Admin** (`role: "admin"`): Full system access
  - Can view and manage all tasks, clients, and users
  - Can process approvals
  - Can access all administrative functions

- **Staff** (`role: "staff"`): Limited access
  - Can only view assigned tasks
  - Can only view clients they created
  - Cannot process approvals

### Access Control Rules
- **Tasks**: Admins see all tasks, Staff see only assigned tasks
- **Clients**: Admins see all clients, Staff see only created clients
- **Approvals**: Only admin users can initiate and process approvals
- **User Management**: Only admins can create, update, and manage users

## Error Handling

### HTTP Status Codes
- `200`: Success - Request completed successfully
- `201`: Created - Resource created successfully
- `400`: Bad Request - Invalid data or validation errors
- `401`: Unauthorized - Authentication required
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `500`: Server Error - Internal server error

### Error Response Format
```json
{
  "detail": "Authentication credentials were not provided.",
  "field_name": ["This field is required."],
  "non_field_errors": ["Invalid data provided."]
}
```

**Error Response Structure:**
- `detail`: General error message
- `field_name`: Field-specific validation errors (array)
- `non_field_errors`: General validation errors (array)

## Development Notes

### Data Format Standards
- **Dates**: Always use YYYY-MM-DD format
- **DateTime**: Read-only fields return "YYYY-MM-DD HH:MM AM/PM" format
- **Decimal Fields**: Use string representation for precise decimal values (e.g., tax_payable)

### Important Considerations
1. **Category-Specific Fields**: Different task categories require different fields. Always validate required fields based on category.
2. **Approval Workflow**: Only admin users can initiate and process approvals.
3. **Permission-Based Filtering**: API responses are automatically filtered based on user permissions.
4. **Token Management**: Implement proper token refresh logic to handle expired access tokens.
5. **Pagination**: Most list endpoints support pagination. Always handle paginated responses.

### Common Integration Patterns
1. Always include proper error handling for API requests
2. Implement token refresh logic for long-running applications
3. Use appropriate filters to reduce data transfer
4. Handle permission-based UI states (show/hide features based on user role)
5. Implement proper loading states for async operations

This reference document should be used by frontend developers and AI agents to understand the complete API structure and integration patterns for the Client Deadline Records Backend system.