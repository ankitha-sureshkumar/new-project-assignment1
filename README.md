# 🐾 OGGY Pet Management Clinic  

The **OGGY Pet Management Clinic** is a full-stack web application that allows users to register their pets and book appointments seamlessly. It integrates a **React frontend**, **Node.js/Express backend**, and deployment on **AWS** with CI/CD pipelines for continuous integration and delivery.  

## 🚀 Features  

- **User Authentication**: Secure login system.  
- **Pet Management**: Add, view, and manage pets (name, age, type).  
- **Appointment Booking**: Select a registered pet, choose a date, and book an appointment.  
- **Backend APIs**: Manage users, pets, and appointments with structured routes.  
- **Deployment**: Hosted on AWS EC2 instance with CI/CD pipeline.  

## 🛠️ Tech Used 

- **Frontend**: React, Axios
- **Backend**: Node.js  
- **Database**: MongoDB 
- **Deployment**: AWS EC2, PM2, Nginx  
- **CI/CD**: GitHub Actions  

## 📂 Project Structure  
oggy-pet-clinic/
│
├── backend/ # Express backend
│ ├── models/ # Mongoose models (User, Pet, Appointment, Treatment, Vet)
│ ├── routes/ # API routes (authRoutes, clinicRoutes, petRoutes)
│ ├── server.js # Backend entry point
│
├── frontend/ # React frontend
│ ├── src/components/ # Components (Navbar, Taskform, Tasklist)
│ ├── src/pages/ # Pages (Login,Pets, Profile, Register, Tasks, Home, BookAppointment)
│ ├── src/App.js # App entry point
│
├── .github/workflows/ # CI/CD pipeline config
├── README.md # Project documentation

frontend link: https://github.com/ankitha-sureshkumar/new-project-assignment1/tree/main/frontend
backend link: https://github.com/ankitha-sureshkumar/new-project-assignment1/tree/main/backend

### 1. Clone the repo
bash
git clone https://github.com/ankitha-sureshkumar/new-project-assignment1

### 2. Install dependencies
bash
cd backend && npm install
cd ../frontend && npm install

### 3. Setup environment
In *backend/.env*:

MONGO_URI=mongodb+srv://ankithasuresh1058:BFLe0DwGv7t1zdfa@projectdatabase.oac6ezr.mongodb.net/taskmanager?retryWrites=true&w=majority&appName=ProjectDataBase
JWT_SECRET=2J8zqkP7VN6bxzg+Wy7DQZsd3Yx8mF3Bl0kch6HYtFs=
PORT=5001

### 4. Run the app
Backend:
bash
cd backend
npm run dev

Frontend:
bash
cd frontend
npm start

***User name and Password**
rskumar.ankitha5@gmail.com / Ankitha@123

***JIRA LINK***
https://oggy-petclinic-management.atlassian.net/jira/software/projects/SCRUM/boards/1/timeline


👨Author

Developed by Ankitha Suresh ✨
