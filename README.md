# MEAN Stack Login and Signup with Email Verification and Forgot Password

This project is a full-stack web application built with the MEAN stack (MongoDB, Express.js, Angular, Node.js) that provides user authentication features, including login, signup, email verification, and a "forgot password" flow.

## Features

- User registration with email verification
- Secure login with JWT authentication
- "Forgot Password" functionality with email-based password reset
- Protected routes for authenticated users
- Responsive and user-friendly UI

## Prerequisites

- Node.js and npm
- MongoDB (local or a cloud-based service like MongoDB Atlas)

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Backend Setup:**
    - Navigate to the `backend` directory:
      ```bash
      cd backend
      ```
    - Install dependencies:
      ```bash
      npm install
      ```
    - Create a `.env` file in the `backend` directory and add the following environment variables:
      ```
      PORT=5000
      MONGO_URI=<your_mongodb_connection_string>
      JWTPRIVATEKEY=<your_jwt_private_key>
      EMAIL_HOST=<your_email_host>
      EMAIL_PORT=<your_email_port>
      EMAIL_USER=<your_email_user>
      EMAIL_PASS=<your_email_password>
      ```
    - Start the backend server:
      ```bash
      npm start
      ```

3.  **Frontend Setup:**
    - Navigate to the `frontend` directory:
      ```bash
      cd ../frontend
      ```
    - Install dependencies:
      ```bash
      npm install
      ```
    - Create a `.env` file in the `frontend` directory and add the following environment variable:
      ```
      VITE_API_URL=http://localhost:5000/api
      ```
    - Start the frontend development server:
      ```bash
      npm run dev
      ```

4.  **Access the application:**
    Open your browser and navigate to `http://localhost:5173`.

## Project Structure

- `backend/`: Contains the Express.js server, API routes, controllers, models, and middleware.
- `frontend/`: Contains the React application, components, pages, and routes.
