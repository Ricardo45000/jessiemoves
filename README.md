# JessieMoves: AI-Powered Pilates Coach 🤸‍♀️🤖

JessieMoves is a web application that provides real-time, automated Pilates coaching using AI. It leverages computer vision (MediaPipe) to analyze Pilates exercises directly in the browser and offers instant, personalized feedback to help users improve their form.

![Demo Screenshot](/Users/ricardoda-silva/.gemini/antigravity/brain/ac891b88-4de5-4ebb-8bfa-a79faef3bc0a/dashboard_scroll_down_1770504197285.png)

## 🚀 Features

-   **Real-time Analysis**: Detects body landmarks and analyzes posture quality instantly.
-   **Pilates Exercises**: Support for Pelvic Curl, Chest Lift, The Hundred, One-Leg Circle, Roll-Up, and Spine Stretch.
-   **Interactive Feedback**: Provides visual cues and textual advice on alignment and stability.
-   **Progress Tracking**: Saves session data (score, detailed metrics) to track improvement over time.
-   **User Dashboard**: Visualizes history with charts and detailed breakdown of past sessions.
-   **Secure Authentication**: User registration and login protected with JWT and HttpOnly cookies.

## 🛠 Tech Stack

-   **Frontend**: React, Vite, Recharts (Visualization), React Router
-   **AI/ML**: MediaPipe Pose (Client-side Computer Vision)
-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB (Atlas)
-   **Authentication**: JWT, bcryptjs

## 📦 Installation

Prerequisites: Node.js (v18+), MongoDB Atlas Account.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/jessiemoves.git
    cd jessiemoves
    ```

2.  **Install Dependencies:**
    ```bash
    # Install server dependencies
    cd server
    npm install

    # Install client dependencies
    cd ../client
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the `server` directory with the following variables:
    ```env
    PORT=5001
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    NODE_ENV=development
    ```

4.  **Run the Application:**
    Open two terminals.

    **Terminal 1 (Backend):**
    ```bash
    cd server
    npm run dev
    ```

    **Terminal 2 (Frontend):**
    ```bash
    cd client
    npm run dev
    ```

    Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🔮 Roadmap

-   [ ] Support for more complex asanas (Tree Pose, Warrior 3).
-   [ ] Voice feedback during live sessions.
-   [ ] Social sharing and community challenges.
-   [ ] Mobile app adaptation (React Native).

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
