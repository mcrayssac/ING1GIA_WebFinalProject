# SpaceY - Space Mission Management System

A comprehensive platform for managing space missions, satellites, and employee progress tracking.

## 🚀 Features

- **User Authentication & Authorization**
  - Login/Signup system
  - Role-based access control
  - Password reset functionality
  - JWT-based authentication

- **Real-time Tracking**
  - Satellite tracking with real-time updates
  - Interactive maps integration (Google Maps & Cesium)
  - Live mission status monitoring

- **Employee Management**
  - Progress tracking system
  - Grade/Tier system
  - Points accumulation
  - Performance statistics

- **Ticket System**
  - Create and manage support tickets
  - Track ticket status
  - Assign tickets to employees

- **Product Management**
  - Catalog of space products
  - Product details and specifications
  - Inventory tracking

## 🛠 Tech Stack

### Frontend (Next.js 15)
- React 18
- Next.js App Router
- TailwindCSS with DaisyUI
- Radix UI Components
- Google Maps API Integration
- Cesium for 3D Globe Visualization
- Context API for State Management

### Backend (Node.js)
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Nodemailer for Email Services
- Custom Middleware for Authorization

## 📁 Project Structure

### Client Structure
```
client/
├── app/                  # Next.js app router pages
├── components/           # Reusable React components
├── contexts/            # React Context providers
├── data/                # Static data and configurations
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── public/              # Static assets
└── styles/              # Global styles and Tailwind config
```

### Server Structure
```
server/
├── data/                # Seed data and constants
├── middlewares/         # Express middlewares
├── models/              # Mongoose models
├── routes/              # API route handlers
└── seed/                # Database seeding scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16.20.1 or higher
- MongoDB
- Docker (optional)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mcrayssac/ING1GIA_WebFinalProject.git
   cd ING1GIA_WebFinalProject
   ```

2. **Install dependencies:**
   ```bash
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

### Server Features & Setup

1. **Database Setup**
   - MongoDB configuration and connection
   - Collection structure and relationships
   - Database seeding with initial data
   - Automated backup support

2. **Available Scripts (Server)**
   ```bash
   # Start development server with auto-reload
   npm run dev

   # Start production server
   npm start

   # Seed the database with initial data
   npm run seed
   ```

3. **Key Features (Server)**
   - JWT-based authentication system
   - Email service integration
   - Real-time data processing
   - File upload handling
   - Rate limiting
   - Error logging
   - API response caching

4. **Project Organization (Server)**
   - `/models` - MongoDB schemas and models
   - `/routes` - API route handlers
   - `/middlewares` - Custom middleware functions
   - `/data` - Seed data and constants
   - `/seed` - Database seeding scripts

### Client Features & Setup

1. **Map Visualization**
   - Google Maps integration for site locations
   - Cesium 3D globe for satellite tracking
   - Real-time position updates

2. **User Interface & Extended Functionalities**
   - Modern responsive design with TailwindCSS and DaisyUI components ensure consistent styling.
   - Interactive navigation with accessible Radix UI components.
   - Dark/Light theme toggle for personalized user experience.
   - Custom animations and transitions powered by Framer Motion.
   - Additional functionalities include filtering/sorting of satellite data, interactive dashboards for ticket and product management, and real-time updates managed via React Context.

3. **Available Scripts (Client)**
   ```bash
   # Start development server
   npm run dev

   # Build for production
   npm run build

   # Start production server
   npm start

   # Run linting
   npm run lint
   ```

4. **Project Organization (Client)**
   - `/app` - Next.js 13+ App Router pages and layouts
   - `/components` - Reusable React components
   - `/contexts` - React Context providers for state management
   - `/hooks` - Custom React hooks
   - `/public` - Static assets (images, icons)
   - `/lib` - Utility functions and helpers
   - `/data` - Static data and configurations

5. **Component Libraries (Client)**
   - Radix UI for accessible components
   - Lucide icons for modern iconography
   - TailwindCSS for utility-first styling
   - Framer Motion for animations
   - React Day Picker for date selection
   - Sonner for toast notifications

### Client Page Functionalities

The client-side application offers a rich set of pages, each dedicated to a particular functionality to ensure a seamless user experience. Below is a detailed overview of each page:

- **Login Page (/app/login/page.jsx)**
  - Features a secure login form with field validations.
  - Supports social logins and includes error messaging for failed login attempts.
  - Redirects authenticated users to their dashboard upon success.

- **Signup Page (/app/signup/page.jsx)**
  - Provides a comprehensive registration form.
  - Incorporates multi-step verification, real-time form validation, and password strength indicators.
  - Handles email confirmation and gives user feedback during registration.

- **Forgot Password Page (/app/forgot-password/page.jsx)**
  - Enables users to request a password reset via email.
  - Provides clear instructions and error handling if the email is not found.
  - Sends a secure password reset link to the user's email.

- **Reset Password Page (/app/reset-password/page.jsx)**
  - Features a secure form to update the user's password.
  - Validates the reset token to avoid unauthorized access.
  - Employs strong password criteria and instant feedback on password strength.

- **Progress Page (/app/progress/page.jsx)**
  - Displays real-time progress metrics and statistics for employees or projects.
  - Utilizes charts, graphs, and progress bars to visually represent data.
  - Supports filtering and drill-down features to examine detailed progress information.

- **Tickets Page (/app/tickets/page.jsx)**
  - Lists all support tickets with status indicators.
  - Allows users to create new tickets, view detailed ticket histories, and update ticket statuses.
  - Includes pagination and search functionality for efficient ticket management.

- **My Tickets Page (/app/my-tickets/page.jsx)**
  - Displays tickets associated with the logged-in user.
  - Provides easy access to ticket details, statuses, and response times.
  - Enables users to interact with support staff via ticket updates.

- **Users Page (/app/users/page.jsx)**
  - Acts as a directory for all users, with advanced search and filtering options.
  - Provides quick access to user profiles and roles within the organization.
  - Supports sorting and pagination for large directories.

- **User Profile Page (/app/users/[id]/page.jsx)**
  - Shows detailed user information and profile settings.
  - Allows users to update their personal details, change security settings, and upload profile images.
  - Integrates with backend services to save profile changes in real time.

- **Products Page (/app/products/page.jsx)**
  - Lists space-related products and services with full details.
  - Offers filtering, sorting, and pagination to navigate large product catalogs.
  - Provides interactive product descriptions and, if applicable, integrates with a shopping cart system.

- **Satellites Page (/app/satellites/page.jsx)**
  - Displays satellite tracking data, including real-time telemetry and status indicators.
  - Features interactive maps and charts, providing both list views and map visualizations.
  - Offers detailed satellite information upon user request.

- **Map Page (/app/map/page.jsx)**
  - Provides an interactive geographic map with multiple layers.
  - Integrates Google Maps and Cesium to display real-time satellite positions and site locations.
  - Includes zoom, pan, and filtering tools to enhance user interaction.

- **Account Page (/app/account/page.jsx)**
  - Manages user account settings such as personal information, security settings, and notification preferences.
  - Offers an intuitive interface for updating sensitive information.
  - Implements validation and security best practices to ensure user data integrity.

### Environment Setup

Setting up proper environment variables is crucial for both client and server functionality.

**Client (.env.local)**
```bash
# Backend API URL (default: 5001 for development)
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:5001

# Google Maps API key for map integration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key

# Cesium token for 3D globe visualization
NEXT_PUBLIC_CESIUM_ION_TOKEN=your_cesium_token
```

**Server (.env)**
```bash
# MongoDB Configuration
MONGO_URI=mongodb://username:password@hostname:27017/database?authSource=admin

# Collection Names
MONGO_Collection_User=Users
MONGO_Collection_Site=Sites
MONGO_Collection_Product=Products
MONGO_Collection_Statistic=Statistics
MONGO_Collection_HistoryEvent=HistoryEvents
MONGO_Collection_Satellite=Satellites
MONGO_Collection_Employee=Employees
MONGO_Collection_Grade=Grades
MONGO_Collection_Ticket=Tickets

# Authentication
JWT_SECRET=your_jwt_secret_key
REFRESH_SECRET=your_refresh_secret_key

# Server Configuration
PORT=5001
ORIGIN_LOCAL=http://localhost:3001

# Email Configuration
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_app_password
```

### Docker Build & Deployment

You can use Docker to build and deploy both the client and server containers.

1. **Building Docker Images:**

   - **Client:**
     Navigate to the `client` directory and run:
     ```bash
     docker build -t spacey-client .
     ```
     The Dockerfile in the client folder uses the Node LTS image, installs dependencies, copies the source code, sets the appropriate permissions, and exposes the desired port (typically 3000 for development, configurable for production).

   - **Server:**
     Navigate to the `server` directory and run:
     ```bash
     docker build -t spacey-server .
     ```
     The server Dockerfile installs dependencies, copies the source code, and runs the application using nodemon for auto-reloading in development mode.

2. **Using Docker Compose:**

   If a `docker-compose.yml` file is provided, you can streamline the process:
   ```bash
   docker-compose up
   ```
   This command builds and runs both the client and server containers as defined in the compose file.

### Running the Application

#### Development Mode

1. **Start the Server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the Client:**
   ```bash
   cd client
   npm run dev
   ```
   The client will be running on [http://localhost:3001](http://localhost:3001) and the server on [http://localhost:5001](http://localhost:5001).

#### Using Docker
```bash
docker-compose up
```

## 📚 API Documentation

### Auth Routes
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - User registration
- POST `/api/auth/forgot-password` - Password reset request
- POST `/api/auth/reset-password` - Password reset

### User Routes
- GET `/api/users/infos` - Get current user info
- PUT `/api/users/update` - Update user profile
- POST `/api/users/logout` - User logout

### Product Routes
- GET `/api/products` - List all products
- GET `/api/products/:id` - Get product details
- POST `/api/products` - Create new product
- PUT `/api/products/:id` - Update product
- DELETE `/api/products/:id` - Delete product

### Ticket Routes
- GET `/api/tickets` - List all tickets
- POST `/api/tickets` - Create new ticket
- PUT `/api/tickets/:id` - Update ticket
- DELETE `/api/tickets/:id` - Delete ticket

### Satellite Routes
- GET `/api/satellites` - List all satellites
- GET `/api/satellites/:id` - Get satellite details
- GET `/api/satellites/live` - Get live satellite positions

## 🔒 Security

- JWT-based authentication
- HTTP-only cookies for token storage
- CORS protection
- Input validation
- Environment variable protection

## Database Schemas & Logic

The backend utilizes MongoDB with Mongoose to define structured schemas that manage all application data. Below is a comprehensive overview of each database schema, detailing key fields, relationships, and business logic:

### User Schema
- **Collection:** Users  
- **Description:** Manages general user authentication and profile information.  
- **Key Fields:** 
  - `username`
  - `email`
  - `password` (stored as a secure hash using bcrypt)
  - `role` (e.g., admin, user)
  - `createdAt`, `updatedAt`  
- **Additional Details:**
  - Indexed by email and username for efficient querying.
  - Uses Mongoose virtuals to exclude sensitive fields (e.g., the password hash) in API responses.
  - Implements pre-save hooks to hash passwords before storage.
- **Logic:**  
  - Handles user authentication and validation.
  - Enforces role-based access control.
  - Ensures secure password storage with bcrypt.

### Employee Schema
- **Collection:** Employees  
- **Description:** Extends the User schema with employee-specific information.  
- **Key Fields:** 
  - `name`
  - `employeeId`
  - `department`
  - `performanceMetrics`
  - `grade` (a reference to the Grade schema)
  - `attendance`  
- **Additional Details:**
  - Inherits base user properties and adds performance data.
  - Uses middleware hooks to calculate and update overall performance metrics.
  - Establishes relationships with the Grade schema.
- **Logic:**  
  - Manages employee progress tracking.
  - Updates performance based on task completions and periodic reviews.
  - Links to grading criteria for performance assessments.

### Ticket Schema
- **Collection:** Tickets  
- **Description:** Stores support ticket information.  
- **Key Fields:** 
  - `title`
  - `description`
  - `status` (e.g., open, in-progress, closed)
  - `assignedEmployee` (references an Employee)
  - `createdAt`, `updatedAt`  
- **Additional Details:**
  - Implements state machine patterns using Mongoose hooks for state transitions.
  - Triggers notification logic when ticket status changes.
  - Maintains historical data through timestamps.
- **Logic:**  
  - Automates the lifecycle of a support ticket.
  - Manages updates and notifications throughout ticket resolution.
  - Integrates with email services for alerting stakeholders.

### Product Schema
- **Collection:** Products  
- **Description:** Catalogs space mission-related products.  
- **Key Fields:** 
  - `name`
  - `description`
  - `specifications`
  - `price`
  - `stock`
  - `category`  
- **Additional Details:**
  - Validates pricing and inventory levels.
  - Utilizes virtuals to compute dynamic discounts.
  - Ensures data consistency with custom validators.
- **Logic:**  
  - Supports product updates, inventory tracking, and pricing strategies.
  - Monitors real-time product availability.
  - Enables dynamic calculations for promotional discounts.

### Satellite Schema
- **Collection:** Satellites  
- **Description:** Maintains data for satellites used in tracking and communications.  
- **Key Fields:** 
  - `name`
  - `telemetryData`
  - `currentStatus`
  - `coordinates`
  - `launchDate`  
- **Additional Details:**
  - Incorporates geospatial indexing for efficient location queries.
  - Periodically updates telemetry data to reflect current status.
  - Supports complex geospatial queries for mapping applications.
- **Logic:**  
  - Powers real-time tracking and visualization on the client.
  - Supports advanced geospatial analytics and mapping.
  - Integrates with live data feeds for telemetry updates.

### Grade Schema
- **Collection:** Grades  
- **Description:** Defines criteria for evaluating employee performance.  
- **Key Fields:** 
  - `gradeLevel`
  - `requiredPoints`
  - `performanceBenchmarks`  
- **Additional Details:**
  - Automatically correlates performance metrics to predefined grade levels.
  - Can be dynamically updated to adjust performance thresholds.
  - Used in aggregation and reporting to assess overall employee performance.
- **Logic:**  
  - Assigns grades based on accumulated performance points.
  - Integrates with Employee schema for real-time performance updates.
  - Supports automated grading workflows.

### Additional Schemas
- **Site Schema (Sites):**
  - **Description:** Manages geospatial data for mission sites.
  - **Logic:**  
    - Uses geospatial fields and indexes for mapping.
    - Supports location-based queries for site management.
- **HistoryEvent Schema (HistoryEvents):**
  - **Description:** Logs significant system events for auditing.
  - **Logic:**  
    - Captures events with type, timestamps, and metadata.
    - Facilitates audit trails and security reviews.
- **Statistic Schema (Statistics):**
  - **Description:** Aggregates operational and performance metrics.
  - **Logic:**  
    - Employs advanced aggregation pipelines for real-time reporting.
    - Provides data for dashboard analytics and operational insights.

All these schemas leverage Mongoose’s robust features—including validation, middleware (pre/post hooks), virtuals, and population—to ensure data integrity and enforce critical business rules throughout the application.

## JWT, Cookies, and Login Management

This section details the implementation of JSON Web Tokens (JWT), cookie-based session management, and the overall login flow used in the application.

### JWT Generation & Validation
- **Token Creation:**  
  After successful login, the server generates a JWT using a secret key (configured via the `JWT_SECRET` environment variable). The token payload includes essential user information (such as user ID and role) and an expiration time.

- **Token Validation:**  
  For each incoming request, middleware verifies the presence and validity of the JWT (typically stored in an HTTP-only cookie). This ensures that only authenticated users can access protected routes.

- **Token Expiry & Refresh:**  
  JWTs are configured to expire after a set duration to enhance security. A refresh mechanism, using a secondary secret (`REFRESH_SECRET`), allows for new tokens to be issued without requiring the user to log in again, ensuring a smooth user experience.

### Cookie-Based Session Management
- **HTTP-only Cookies:**  
  JWTs are stored in HTTP-only cookies, which are inaccessible via JavaScript, reducing the risk of XSS (Cross-Site Scripting) attacks.
  
- **Secure Cookie Attributes:**  
  Cookies are set with Secure and SameSite attributes in production environments to prevent CSRF (Cross-Site Request Forgery) attacks and enhance overall security.

- **Server-Side Handling:**  
  Authentication middleware extracts JWTs from cookies, validates them, and attaches the corresponding user information to the request object for further processing by protected routes.

### Login & Logout Flow
- **Login Flow:**  
  1. User submits credentials via the login form.
  2. The server validates credentials (comparing with securely hashed passwords).
  3. Upon successful authentication, a JWT is generated and sent in an HTTP-only cookie.
  4. The user is redirected to a secure area (e.g., dashboard).

- **Logout Flow:**  
  1. User initiates logout.
  2. The server clears the authentication cookie, effectively terminating the session.
  3. Subsequent requests will require re-authentication.

### Error Handling & Security Enhancements
- **Rate Limiting:**  
  Login routes are protected with rate limiting to mitigate brute-force attacks.
- **Logging & Monitoring:**  
  Failed login attempts and other suspicious activities are logged for security review.
- **Middleware Integration:**  
  Centralized authentication middleware (e.g., in `authMiddlewares.js`) ensures consistent token validation and error handling across all routes.

All these techniques work together to provide a secure, scalable, and user-friendly approach to managing authentication and sessions in the SpaceY application.