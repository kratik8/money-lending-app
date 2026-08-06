# 💰 Fundify – Money Lending Management System

Fundify is a modern **Money Lending Management System** built with **Node.js, Express.js, HTML, CSS, and JavaScript**. It helps manage borrowers, loans, repayments, and financial records through a simple and responsive web interface.

The application is containerized using **Docker**, automatically built and pushed to **Docker Hub** using **GitHub Actions (CI/CD)**, and deployed on an **AWS EC2 Ubuntu Server** behind an **Nginx Reverse Proxy**.

---

## 🌐 Live Demo

**Application URL:**
**http://13.60.238.121/**

> **Note:** If Nginx Basic Authentication is enabled, you will be prompted to enter the configured username and password before accessing the application.

---

## ✨ Features

* 👤 Borrower Management
* 💵 Loan Creation & Management
* 📅 Repayment Tracking
* 📊 Dashboard Overview
* 📱 Responsive User Interface
* 🐳 Dockerized Application
* ⚙️ GitHub Actions CI/CD Pipeline
* ☁️ AWS EC2 Deployment
* 🔐 Nginx Reverse Proxy
* 🔄 Easy Updates using Docker Hub

---

## 🛠️ Tech Stack

| Technology     | Purpose           |
| -------------- | ----------------- |
| Node.js        | Backend Runtime   |
| Express.js     | Web Framework     |
| HTML5          | Frontend          |
| CSS3           | Styling           |
| JavaScript     | Client-side Logic |
| Docker         | Containerization  |
| Docker Hub     | Image Registry    |
| GitHub Actions | CI/CD Pipeline    |
| AWS EC2        | Cloud Hosting     |
| Nginx          | Reverse Proxy     |

---

# 📂 Project Structure

```text
Fundify/
│
├── public/
├── views/
├── routes/
├── controllers/
├── middleware/
├── data/
├── server.js
├── package.json
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── .dockerignore
└── README.md
```

---

# 🚀 Run Locally

## Clone Repository

```bash
git clone https://github.com/kratik8/Fundify.git
cd Fundify
```

## Install Dependencies

```bash
npm install
```

## Start Development Server

```bash
npm start
```

Application runs on:

```
http://localhost:3000
```

---

# 🐳 Docker Setup

## Build Image

```bash
docker build -t kratik8/money-lending-app:latest .
```

## Run Container

> **The application listens on port `3000` inside the container.**

```bash
docker run -d \
  --name fundify-app \
  -p 5000:3000 \
  --restart unless-stopped \
  kratik8/money-lending-app:latest
```

Open:

```
http://localhost:5000
```

---

# 📦 Push Image to Docker Hub

Login

```bash
docker login
```

Push Image

```bash
docker push kratik8/money-lending-app:latest
```

---

# ☁️ AWS EC2 Deployment

## Pull Latest Image

```bash
docker pull kratik8/money-lending-app:latest
```

## Stop Existing Container

```bash
docker stop fundify-app
```

## Remove Existing Container

```bash
docker rm fundify-app
```

## Start Updated Container

```bash
docker run -d \
  --name fundify-app \
  --restart unless-stopped \
  -p 5000:3000 \
  kratik8/money-lending-app:latest
```

---

# 🌐 Nginx Reverse Proxy

Example configuration:

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:5000;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Reload Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

# 🔄 CI/CD Workflow

Every push to the **main** branch automatically:

* Builds Docker image
* Pushes image to Docker Hub
* Makes the latest image available for deployment on AWS EC2

Workflow:

```
Developer
      │
      ▼
GitHub Repository
      │
      ▼
GitHub Actions
      │
      ▼
Docker Hub
      │
      ▼
AWS EC2 Server
      │
      ▼
Docker Container
      │
      ▼
Nginx Reverse Proxy
      │
      ▼
Public Users
```

---

# 📸 Screenshots

You can add screenshots here.

```
screenshots/
    home.png
    dashboard.png
    borrowers.png
    repayments.png
```

---

# 👨‍💻 Author

**Kratik Patidar**

* GitHub: https://github.com/kratik8
* Docker Hub: https://hub.docker.com/u/kratik8

---

# 📄 License

This project is developed for educational and learning purposes.

---

## ⭐ If you like this project

Please consider giving this repository a **Star ⭐** on GitHub.
