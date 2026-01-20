# 🚀 AlgoVista

AlgoVista is a **full‑stack e‑learning platform** focused on **Data Structures, Algorithms, and Systematic Learning**. It provides **roadmaps, courses, mentorship, problem solving, progress tracking, certificates, and payments**, all secured with **JWT, cookies, middleware, and role‑based authentication**.

The platform is built with **scalability, security, and modularity** in mind, following a **microservice‑friendly architecture**.

---

## 🌟 Key Features

### 👥 Multi‑Role System

AlgoVista supports **four major roles**:

| Role                           | Description                                                                         |
| ------------------------------ | ----------------------------------------------------------------------------------- |
| **Student (User)**             | Learns via roadmaps & courses, solves problems, tracks progress, earns certificates |
| **Admin (Mentor)**             | Creates courses, problems, success stories, manages content                         |
| **Super Admin (Super Mentor)** | Manages mentors, roadmap structure, global platform control                         |
| **System Admin (CLI)**         | Admins created securely via CLI (not public signup)                                 |

🔐 All routes are **protected using cookies + JWT** and enforced via **custom middleware guards**.

---

## 🔐 Authentication & Security

* **JWT‑based authentication** (Access + Refresh Tokens)
* **HTTP‑only cookies** for session security
* **Role‑based authorization middleware**
* **Protected API routes** (User / Admin / SuperAdmin)
* **Password hashing (bcrypt)**
* **Webhook verification (Razorpay)**

Example Guards:

* `UserGuard`
* `AdminGuard`
* `SuperAdminGuard`
* `AdminUserSuperAdminGuard`
* `RefreshTokenGuard`

---

## 🧭 Learning Roadmaps

* Structured **DSA / Skill Roadmaps**
* Topics & resources inside each roadmap
* **Progress tracked per resource**
* Completion percentage auto‑calculated

🎯 **When roadmap progress reaches 100% → Certificate is auto‑generated**

---

## 📈 Progress Tracking

* Track roadmap completion
* Update individual topic/resource progress
* Fetch progress per user & roadmap
* Stored securely per authenticated user

---

## 🎓 Courses

* Created by **Mentors (Admin)** and **Super Admins**
* Supports:

  * 🆓 Free Courses
  * 💳 Paid Courses
* Course media uploads (videos, thumbnails)
* Enrollments tracked per user

---

## 💳 Payments & Orders

* Integrated with **Razorpay**
* Secure order creation
* Webhook verification
* Payment → Course enrollment mapping

---

## 🧑‍🏫 Mentorship System

* **Mentors = Admins**
* **Super Mentors = Super Admins**
* Mentor profiles managed only by Super Admin
* Mentor success stories
* Mentor discovery for students

---

## 🧠 Problem Solving Engine

* DSA Problems
* Multiple submissions per problem
* Submission history per user
* **Judge0 integration** for code execution
* **Monaco Editor** for in‑browser coding

---

## 🧾 Certificates

* Auto‑generated after 100% roadmap completion
* Downloadable PDF certificates
* Viewable via secure routes
* Fetch certificates per user

---

## 📊 Recent Activity Tracking

* Tracks user actions:

  * Roadmap updates
  * Course enrollments
  * Problem submissions
* Used for dashboards & analytics

---

## 🧩 Algo Visualizer

* Algorithm visualization tools
* Helps students visually understand DSA concepts

---

## 🖥️ CLI Tools & Automation

AlgoVista includes powerful **CLI utilities** to securely manage system‑level operations and speed up development.

### 👤 Create Admin / Super Admin (CLI Only)

Admins and Super Admins **cannot sign up publicly**. They are created securely via CLI:

```bash
npm run create-user
```

This command:

* Creates **Admin / Super Admin** users
* Hashes passwords securely
* Assigns roles directly in the database
* Prevents unauthorized public access

---

### 🧩 Automated Service Generator

To maintain a clean and scalable architecture, AlgoVista provides a **service scaffolding command**:

```bash
npm run service service-name
```

This automatically creates:

* Route file
* Controller
* Model
* Service logic
* Index exports
* Folder structure aligned with best practices

✅ Ensures consistency
✅ Reduces boilerplate
✅ Microservice‑ready

---

## 🏗️ Backend Architecture

* **Node.js + Express**
* **MongoDB + Mongoose**
* Modular route‑based structure
* Middleware‑first security design
* Ready for microservice separation

### Core Services

* Auth Service
* Roadmap Service
* Progress Service
* Course Service
* Payment Service
* Certificate Service
* Activity Service

---

## 🌐 API Overview

Some key routes:

* `/auth` → Authentication & session
* `/roadmap` → Roadmap management
* `/progress` → User progress
* `/course` → Courses
* `/course-enrollment` → Enrollments
* `/payment` → Orders & webhooks
* `/certificate` → Certificate generation
* `/activity` → User activity
* `/problem` → DSA problems
* `/submission` → Problem submissions

---

## 🛠️ Tech Stack

### Frontend

* React
* Ant Design
* Tailwind CSS
* Remix Icons
* Axios
* Monaco Editor

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT & Cookies
* Multer (uploads)
* Cloudinary / AWS S3

### Payments & Tools

* Razorpay
* Judge0 (Code Execution)

---

## 🚀 Installation & Setup

```bash
# Clone repo
git clone https://github.com/your-repo/algovista

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Run server
npm run dev
```

---

## 🔮 Future Enhancements

* AI‑powered learning suggestions
* Leaderboards
* Peer discussion forums
* Advanced analytics dashboard
* Mobile app support

---

## ❤️ Vision

AlgoVista aims to be a **complete ecosystem for mastering algorithms**, combining:

> Structured learning + mentorship + practice + visualization + real progress

---

### ⭐ Built with passion for learners & problem solvers
