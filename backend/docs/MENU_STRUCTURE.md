# Menu Structure

Suggested menu structure based on all Django apps.

---

## Main Navigation

### 1. Dashboard
- Overview/Home (summary widgets from all modules)

---

### 2. Organization
- Departments
- Positions
- Organizational Structure

---

### 3. HR (Human Resources)

#### Attendance
- Daily Attendance
- Attendance Report

#### Leave
- Leave Requests
- Leave Balance
- Leave Calendar

#### Payroll
- Payroll Periods
- Salary Slips
- Payroll Reports

---

### 4. Admin Operations

#### Room Booking
- Rooms
- Bookings
- Booking Calendar

#### Vehicle Management
- Vehicles
- Vehicle Requests
- Driver Assignment

#### Visitor Log
- Visitors
- Visit History

---

### 5. Assets

#### Asset Management
- Asset List
- Asset Categories

#### Assignment
- Asset Assignments
- Assignment History

#### Maintenance
- Maintenance Requests
- Maintenance Schedule

---

### 6. Inventory

#### SKU Management
- SKU List
- Warehouses
- Stock Levels

#### Stock Opname
- Physical Count
- Adjustment History

#### Stock Transfer
- Transfer Requests
- Transfer History

---

### 7. Procurement

#### Vendors
- Vendor List
- Vendor Evaluation

#### Purchase Orders
- PO List
- PO Approval
- Goods Receipt

---

### 8. Finance

#### Expense Requests
- My Requests
- Pending Approval
- All Requests

#### Cash Advance
- Advance Requests
- Settlement

---

### 9. Research

#### Grants
- Grant List
- Grant Applications
- Disbursements
- Milestones

#### Publications
- Publication List
- My Publications
- Under Review

#### Projects
- Project List
- Project Tasks
- Project Updates

---

### 10. Documents

#### Document Management
- My Documents
- Shared with Me
- Folders

#### Access Control
- Permissions
- Access Logs

---

### 11. Ticketing

#### Tickets
- My Tickets
- Assigned to Me
- All Tickets

#### SLA Management
- SLA Policies
- SLA Reports

---

### 12. Tools
- URL Shortener
- QR Code Generator
- Image Compressor
- PDF Tools (Merge/Split)

---

## Secondary/Utility Menu

### Workflow
- Approval Requests
- My Approvals
- Delegation Settings

### Reports & Analytics
- HR Reports
- Finance Reports
- Inventory Reports
- Research Metrics
- Custom Reports

### Settings (Admin)
- Users & Roles
- System Configuration
- Audit Logs

---

## User Menu (Top Right)
- My Profile
- Notifications
- Change Password
- Logout

---

## Role-Based Visibility

| Menu | Admin | HR | Finance | Researcher | Staff |
|------|-------|-----|---------|------------|-------|
| Organization | ✓ | ✓ | - | - | View |
| HR | ✓ | ✓ | - | - | Self |
| Finance | ✓ | - | ✓ | Request | Request |
| Research | ✓ | - | - | ✓ | - |
| Procurement | ✓ | - | ✓ | - | - |
| Inventory | ✓ | - | ✓ | - | - |
| Assets | ✓ | ✓ | - | - | View |
| Documents | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tools | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## API Endpoints Reference

| Module | Base URL |
|--------|----------|
| Organization | `/api/v1/organization/` |
| HR | `/api/v1/hr/` |
| Admin Ops | `/api/v1/admin-ops/` |
| Assets | `/api/v1/assets/` |
| Inventory | `/api/v1/inventory/` |
| Procurement | `/api/v1/procurement/` |
| Finance | `/api/v1/finance/` |
| Research | `/api/v1/research/` |
| Documents | `/api/v1/documents/` |
| Ticketing | `/api/v1/ticketing/` |
| Workflow | `/api/v1/workflow/` |
| Tools | `/api/v1/tools/` |
