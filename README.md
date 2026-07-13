# 🥗 Nutrition Assistant

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application that helps users manage their daily nutrition by tracking food intake, calculating calories, and maintaining a healthy lifestyle.

## 📌 Project Overview

The Nutrition Assistant is designed to help users monitor their daily food consumption and calorie intake. Users can register, log in securely, add food items, view their calorie records, and manage their nutrition data through a user-friendly dashboard.

---

## 🚀 Features

- User Registration
- User Login with JWT Authentication
- Secure Password Encryption
- Add Food Items
- Delete Food Items
- View Daily Food Records
- Automatic Total Calorie Calculation
- Protected Dashboard
- MongoDB Database Integration
- Responsive User Interface

---

## 🛠️ Technologies Used

### Frontend
- React.js
- Vite
- HTML5
- CSS3
- JavaScript
- Axios
- React Router DOM

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcryptjs
- dotenv
- CORS

---

## 📂 Project Structure

```
NutritionAssistant
│
├── client/
│   ├── src/
│   ├── public/
│   ├── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── index.js
│   └── package.json
│
├── README.md
└── package.json
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/supriyaA5/NutritionAssisstant.git
```

Move into the project folder:

```bash
cd NutritionAssistant
```

---

## Install Dependencies

### Backend

```bash
cd server
npm install
```

### Frontend

```bash
cd ../client
npm install
```

---

## Environment Variables

Create a `.env` file inside the `server` folder.

```
PORT=5000
JWT_SECRET=your_jwt_secret
MONGO_URI=your_mongodb_connection_string
```

---

## ▶️ Run the Application

### Start Backend

```bash
cd server
npm start
```

### Start Frontend

```bash
cd client
npm run dev
```

The application will run on:

Frontend

```
http://localhost:5173
```

Backend

```
http://localhost:5000
```

---

## 📸 Screens

- Home Page
- Register Page
- Login Page
- Nutrition Dashboard
- Food Management

---

## 🔐 Authentication

- JWT Token Authentication
- Protected Routes
- Password Encryption using bcryptjs

---

## 📊 Database

MongoDB Atlas stores:

- User Information
- Food Records
- Calorie Details

---

## 🌟 Future Enhancements

- BMI Calculator
- Nutrition Recommendations
- Meal Planning
- Weekly Reports
- Charts and Analytics
- AI-based Diet Suggestions

---

## 👩‍💻 Author

**Saisupriya Alla**

GitHub:
https://github.com/supriyaA5

---

## 📜 License

This project is developed for educational and internship purposes.
