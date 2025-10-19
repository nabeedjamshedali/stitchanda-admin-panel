# Stitchanda Admin Panel - Development Plan

## Project Overview
**Stitchanda** is a platform that connects tailors with customers. The flow is:
1. Customer creates an order
2. Order is assigned to a tailor
3. Rider picks up order and delivers to tailor
4. Tailor completes the work
5. Rider picks up completed order and delivers to customer
6. Customer pays tailor via Stripe

## Technology Stack
**React 18+ with Vite** - Perfect for frontend-only application
- Fast development with HMR (Hot Module Replacement)
- Optimized build
- TypeScript support
- Modern React features

**Backend: Firebase (Existing)**
- Firebase Authentication
- Cloud Firestore Database
- Firebase Storage (for images)
- All backend logic already handled by Firebase

## Color Theme
- Primary: **Brownish/Orange** (#CD853F, #D2691E, #C19A6B) - from the login button
- Secondary: White (#FFFFFF)
- Background: Light gray (#F5F5F5)
- Text: Dark gray (#333333)
- Success: Green (#4CAF50)
- Warning: Orange (#FF9800)
- Error: Red (#F44336)

## Firebase Collections (Existing)
Based on your Firestore database:
1. **customers** - Customer data
2. **tailors** - Tailor profiles with status
3. **riders** - Rider profiles with status
4. **orders** - Order details
5. **payments** - Payment records (Stripe)

## Admin Panel Tabs (5 Tabs Total)

### 1. Dashboard Tab
**Interactive Analytics Dashboard:**
- **Revenue Metrics**
  - Total Revenue (all-time)
  - Monthly Revenue (current month)
  - Revenue Trends (last 6 months) - Line chart
  - Revenue by Tailor - Bar chart

- **Order Statistics**
  - Total Orders
  - Pending Orders
  - In Progress Orders
  - Completed Orders
  - Cancelled Orders
  - Order Status Distribution - Pie chart

- **User Statistics**
  - Total Customers
  - Total Tailors (Active/Pending/Rejected)
  - Total Riders (Active/Pending/Rejected)
  - New Users This Month

- **Performance Metrics**
  - Average Order Completion Time
  - Top 5 Tailors (by completed orders)
  - Top 5 Active Customers

- **Recent Activity**
  - Latest 10 orders
  - Pending approvals (tailors/riders)

### 2. Customers Tab
**CRUD Operations using Firebase:**

**Firebase Methods Used:**
- `getDocs()` - Get all customers
- `getDoc()` - Get single customer
- `addDoc()` - Add new customer
- `updateDoc()` - Update customer
- `deleteDoc()` - Delete customer
- `query()` + `where()` - Search/Filter
- `orderBy()` - Sorting
- `limit()` + `startAfter()` - Pagination

**Features:**
- Table view with all customers
- Search by name/email/phone
- Filter & Sort
- Pagination
- Add new customer (Modal/Form)
- Edit customer details (Modal/Form)
- Delete customer (with confirmation)
- View customer full details (Modal)
- View customer's order history

### 3. Tailors Tab
**CRUD + Approval System using Firebase:**

**Firebase Methods Used:**
- `getDocs(query(where('status', '==', 'pending')))` - Get pending tailors
- `updateDoc()` - Approve/Reject tailor (update status field)
- `addDoc()` - Add new tailor
- `deleteDoc()` - Delete tailor
- Real-time listener: `onSnapshot()` - Auto-update when new tailor registers

**Status Field Values:**
- `pending` - Newly registered, awaiting approval
- `approved` - Approved by admin
- `active` - Currently active
- `suspended` - Temporarily suspended
- `rejected` - Rejected by admin

**Features:**
- Table view with status badges
- Filter by status (All/Pending/Approved/Active/Suspended/Rejected)
- Quick approve/reject buttons for pending tailors
- Add new tailor
- Edit tailor profile
- Delete tailor
- View tailor details (skills, portfolio, ratings, orders completed, earnings)
- Change status (suspend/activate)

### 4. Riders Tab
**CRUD + Approval System using Firebase:**

**Firebase Methods Used:**
- Same as Tailors (getDocs, updateDoc, addDoc, deleteDoc, onSnapshot)
- Query pending riders: `query(where('status', '==', 'pending'))`

**Status Field Values:**
- `pending` - Newly registered, awaiting approval
- `approved` - Approved by admin
- `active` - Currently active and available
- `suspended` - Temporarily suspended
- `rejected` - Rejected by admin

**Features:**
- Table view with status badges
- Filter by status (All/Pending/Approved/Active/Suspended/Rejected)
- Quick approve/reject buttons for pending riders
- Add new rider
- Edit rider profile
- Delete rider
- View rider details (vehicle info, license, ratings, total deliveries)
- Change status (suspend/activate)
- View availability status

### 5. Orders Tab
**CRUD + Status Tracking using Firebase:**

**Firebase Methods Used:**
- `getDocs()` - Get all orders
- `addDoc()` - Create new order
- `updateDoc()` - Update order status, assign tailor/rider
- `deleteDoc()` - Cancel/Delete order
- `query()` + `where()` - Filter by status, date range, customer, tailor
- `onSnapshot()` - Real-time order updates

**Order Status Flow:**
1. `pending` - Order created by customer
2. `assigned` - Tailor assigned by admin
3. `pickup_scheduled` - Rider assigned for pickup
4. `in_transit_to_tailor` - Rider going to pick from customer
5. `with_tailor` - Order at tailor's place
6. `ready_for_delivery` - Tailor completed work
7. `in_transit_to_customer` - Rider delivering to customer
8. `delivered` - Order delivered to customer
9. `payment_completed` - Payment received
10. `cancelled` - Order cancelled

**Features:**
- Table view with all orders
- Filter by status
- Filter by date range
- Search by order ID, customer name, tailor name
- Create new order (Modal/Form)
- Edit order details
- Assign/Reassign tailor (dropdown from approved tailors)
- Assign/Reassign rider (dropdown from active riders)
- Update order status (status dropdown/buttons)
- View order timeline (status history)
- View payment status
- Cancel order (with confirmation)
- Order details view (customer info, tailor info, rider info, items, pricing, timeline)

## Project Structure
```
stitchanda-admin-panel/
├── public/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Layout.jsx
│   │   ├── dashboard/
│   │   │   ├── RevenueCard.jsx
│   │   │   ├── StatsCard.jsx
│   │   │   ├── RevenueChart.jsx
│   │   │   ├── OrdersChart.jsx
│   │   │   └── RecentActivity.jsx
│   │   ├── customers/
│   │   │   ├── CustomersTable.jsx
│   │   │   ├── CustomerModal.jsx
│   │   │   └── CustomerForm.jsx
│   │   ├── tailors/
│   │   │   ├── TailorsTable.jsx
│   │   │   ├── TailorModal.jsx
│   │   │   ├── TailorForm.jsx
│   │   │   └── ApprovalButtons.jsx
│   │   ├── riders/
│   │   │   ├── RidersTable.jsx
│   │   │   ├── RiderModal.jsx
│   │   │   ├── RiderForm.jsx
│   │   │   └── ApprovalButtons.jsx
│   │   ├── orders/
│   │   │   ├── OrdersTable.jsx
│   │   │   ├── OrderModal.jsx
│   │   │   ├── OrderForm.jsx
│   │   │   ├── StatusTimeline.jsx
│   │   │   └── AssignmentForm.jsx
│   │   └── shared/
│   │       ├── Table.jsx
│   │       ├── Modal.jsx
│   │       ├── Button.jsx
│   │       ├── Input.jsx
│   │       ├── Select.jsx
│   │       ├── SearchBar.jsx
│   │       ├── Pagination.jsx
│   │       ├── StatusBadge.jsx
│   │       ├── ConfirmDialog.jsx
│   │       └── Loading.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Customers.jsx
│   │   ├── Tailors.jsx
│   │   ├── Riders.jsx
│   │   └── Orders.jsx
│   ├── services/
│   │   └── firebase.js (Firebase configuration & methods)
│   ├── hooks/
│   │   ├── useFirestore.js (Custom hook for Firestore CRUD)
│   │   └── useRealtimeData.js (Real-time listeners)
│   ├── utils/
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── styles/
│   │   └── index.css (Tailwind + custom styles)
│   ├── App.jsx
│   └── main.jsx
├── .env
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Firebase Integration (Using Firebase SDK)

### Firebase Service File (`services/firebase.js`)
```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, getDoc, doc, addDoc,
         updateDoc, deleteDoc, query, where, orderBy, limit,
         startAfter, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase config
const firebaseConfig = { ... };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Customers CRUD
export const getCustomers = () => getDocs(collection(db, 'customers'));
export const getCustomer = (id) => getDoc(doc(db, 'customers', id));
export const addCustomer = (data) => addDoc(collection(db, 'customers'), data);
export const updateCustomer = (id, data) => updateDoc(doc(db, 'customers', id), data);
export const deleteCustomer = (id) => deleteDoc(doc(db, 'customers', id));

// Tailors CRUD + Approval
export const getTailors = () => getDocs(collection(db, 'tailors'));
export const getPendingTailors = () => getDocs(query(collection(db, 'tailors'), where('status', '==', 'pending')));
export const approveTailor = (id) => updateDoc(doc(db, 'tailors', id), { status: 'approved', approvedAt: new Date() });
export const rejectTailor = (id) => updateDoc(doc(db, 'tailors', id), { status: 'rejected' });
// ... more methods

// Riders CRUD + Approval
// ... similar to tailors

// Orders CRUD + Status Management
export const getOrders = () => getDocs(collection(db, 'orders'));
export const updateOrderStatus = (id, status) => updateDoc(doc(db, 'orders', id), { status, updatedAt: new Date() });
export const assignTailor = (orderId, tailorId) => updateDoc(doc(db, 'orders', orderId), { tailorId, status: 'assigned' });
export const assignRider = (orderId, riderId) => updateDoc(doc(db, 'orders', orderId), { riderId });
// ... more methods

// Real-time listeners
export const listenToTailors = (callback) => onSnapshot(collection(db, 'tailors'), callback);
export const listenToOrders = (callback) => onSnapshot(collection(db, 'orders'), callback);
```

## Key Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "firebase": "^10.7.0",
    "recharts": "^2.10.0",
    "date-fns": "^3.0.0",
    "lucide-react": "^0.300.0",
    "react-hot-toast": "^2.4.1",
    "clsx": "^2.1.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

## UI Components
**Custom components built with Tailwind CSS:**
- No external UI library needed
- Custom Table, Modal, Button, Input, Select components
- Fully customizable with brown theme
- Responsive design
- Accessible

## Charts Library
**Recharts:**
- Line charts for revenue trends
- Bar charts for comparisons
- Pie charts for status distribution
- Simple to use
- Customizable colors (brown theme)

## Development Phases

### Phase 1: Project Setup
- ✅ Initialize Vite + React project
- ✅ Install dependencies (Firebase, Recharts, Tailwind, React Router)
- ✅ Configure Tailwind with brown color theme
- ✅ Setup project folder structure
- ✅ Create basic layout (Sidebar + Header + Main content area)
- ✅ Setup React Router for 5 tabs

### Phase 2: Firebase Setup
- [ ] Create `services/firebase.js` with configuration
- [ ] Implement all Firebase CRUD functions
- [ ] Create custom hooks (`useFirestore`, `useRealtimeData`)
- [ ] Test Firebase connection

### Phase 3: Shared Components
- [ ] Build reusable Table component
- [ ] Build Modal component
- [ ] Build Form components (Input, Select, Button)
- [ ] Build StatusBadge component
- [ ] Build Pagination component
- [ ] Build SearchBar component
- [ ] Build ConfirmDialog component
- [ ] Build Loading spinner

### Phase 4: Dashboard Tab
- [ ] Revenue metrics cards (using Firebase aggregation)
- [ ] Order statistics cards
- [ ] User statistics cards
- [ ] Revenue trend chart (Recharts Line chart)
- [ ] Order status pie chart (Recharts Pie chart)
- [ ] Recent activity list (using onSnapshot for real-time)

### Phase 5: Customers Tab
- [ ] Customers table with Firebase data
- [ ] Search & filter functionality
- [ ] Pagination
- [ ] Add customer modal + form
- [ ] Edit customer modal + form
- [ ] Delete customer with confirmation
- [ ] View customer details modal

### Phase 6: Tailors Tab
- [ ] Tailors table with status badges
- [ ] Filter by status
- [ ] Pending approvals section (highlighted)
- [ ] Approve/Reject buttons (updateDoc status field)
- [ ] Add tailor modal + form
- [ ] Edit tailor modal + form
- [ ] Delete tailor with confirmation
- [ ] View tailor details modal
- [ ] Real-time updates using onSnapshot

### Phase 7: Riders Tab
- [ ] Riders table with status badges
- [ ] Filter by status
- [ ] Pending approvals section (highlighted)
- [ ] Approve/Reject buttons (updateDoc status field)
- [ ] Add rider modal + form
- [ ] Edit rider modal + form
- [ ] Delete rider with confirmation
- [ ] View rider details modal
- [ ] Real-time updates using onSnapshot

### Phase 8: Orders Tab
- [ ] Orders table with status
- [ ] Filter by status & date range
- [ ] Search orders
- [ ] Create order modal + form
- [ ] Edit order modal
- [ ] Assign tailor dropdown (from approved tailors)
- [ ] Assign rider dropdown (from active riders)
- [ ] Update status dropdown/buttons
- [ ] Order timeline view (status history)
- [ ] Payment status display
- [ ] Cancel order functionality
- [ ] Real-time order updates using onSnapshot

### Phase 9: Polish & Testing
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Error handling (toast notifications)
- [ ] Loading states for all async operations
- [ ] Form validations
- [ ] Empty states (no data)
- [ ] UI/UX refinements
- [ ] Performance optimization
- [ ] Cross-browser testing

### Phase 10: Documentation
- [ ] README with setup instructions
- [ ] Firebase configuration guide
- [ ] Environment variables documentation
- [ ] How to run locally

## Environment Variables (.env)
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=stichanda-1cacd
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Data Models (TypeScript Interfaces for Reference)

### Customer
```javascript
{
  id: string,
  name: string,
  email: string,
  phone: string,
  address: string,
  createdAt: timestamp,
  totalOrders: number,
  totalSpent: number
}
```

### Tailor
```javascript
{
  id: string,
  name: string,
  email: string,
  phone: string,
  address: string,
  skills: array,
  status: 'pending' | 'approved' | 'active' | 'suspended' | 'rejected',
  rating: number,
  totalOrders: number,
  totalEarnings: number,
  createdAt: timestamp,
  approvedAt: timestamp | null
}
```

### Rider
```javascript
{
  id: string,
  name: string,
  email: string,
  phone: string,
  vehicleType: string,
  vehicleNumber: string,
  licenseNumber: string,
  status: 'pending' | 'approved' | 'active' | 'suspended' | 'rejected',
  rating: number,
  totalDeliveries: number,
  currentlyAvailable: boolean,
  createdAt: timestamp,
  approvedAt: timestamp | null
}
```

### Order
```javascript
{
  id: string,
  customerId: string,
  tailorId: string | null,
  riderId: string | null,
  status: 'pending' | 'assigned' | 'pickup_scheduled' | 'in_transit_to_tailor' |
          'with_tailor' | 'ready_for_delivery' | 'in_transit_to_customer' |
          'delivered' | 'payment_completed' | 'cancelled',
  items: array,
  totalAmount: number,
  paymentStatus: 'pending' | 'completed' | 'refunded',
  paymentId: string | null,
  createdAt: timestamp,
  timeline: array // status history
}
```

## Key Features Summary
✅ 5 Tabs: Dashboard, Customers, Tailors, Riders, Orders
✅ Full CRUD operations using Firebase SDK built-in functions
✅ Tailor & Rider approval system (status field modification)
✅ Order status tracking & assignment
✅ Real-time updates using `onSnapshot()`
✅ Interactive dashboard with charts (Recharts)
✅ Search, filter, sort, pagination
✅ Responsive design
✅ Brown/Orange color theme
✅ No authentication (single admin assumed)

---

**Estimated Development Time**: 7-8 working days
**Total Components**: ~50-60 components
**Lines of Code**: ~5,000-6,000 LOC

**Does this plan look good? Should I proceed with development?**
