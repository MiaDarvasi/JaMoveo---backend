# JaMoveo Backend

This is the **backend** of the JaMoveo project — a collaborative platform for real-time music sharing and lyric display. It is built using **Node.js**, **Express**, **MongoDB**, and **Socket.IO**, and serves both as an API and as the real-time engine that powers live user experiences.

---

## 🚀 Features

- 🔐 User login with session-based authentication
- 📡 RESTful API for users and songs
- 🎵 WebSocket support for live song broadcasts
- 🌐 CORS-configured for development & production

---

## 🧑‍💻 Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- Socket.IO
- Express-session
- CORS
- dotenv

---

## 📁 Project Setup

<!-- 1. Install dependencies -->
npm install

<!-- 1. Development server -->
npm start

---

## 🧩 Folder Structure

backend/
├── config/
│   └── index.js         
├── services/
├── api/
│   ├── auth/
│   │   ├── auth.controller.js
│   │   ├── auth.routes.js
│   │   └── auth.service.js
│   ├── user/
│   │   ├── user.controller.js
│   │   ├── user.routes.js
│   │   └── user.service.js
├── server.js               
└── package.json

