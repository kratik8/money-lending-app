# 🚀 Production Dockerization, Docker Hub & AWS EC2 Ubuntu Deployment Guide

This systematic deployment guide walks you through building the Docker image for **LendTrack**, pushing it to **Docker Hub**, pulling it onto an **AWS EC2 Ubuntu server**, and serving it securely behind an **Nginx Reverse Proxy with HTTP Basic Authentication**.

---

## 📌 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Step 1: Build & Test Docker Image Locally](#step-1-build--test-docker-image-locally)
3. [Step 2: Push Image to Docker Hub](#step-2-push-image-to-docker-hub)
4. [Step 3: Setup AWS EC2 Ubuntu Server](#step-3-setup-aws-ec2-ubuntu-server)
5. [Step 4: Install Docker & Nginx on EC2](#step-4-install-docker--nginx-on-ec2)
6. [Step 5: Configure Nginx Basic Authentication](#step-5-configure-nginx-basic-authentication)
7. [Step 6: Pull & Run Docker Container on EC2](#step-6-pull--run-docker-container-on-ec2)
8. [Step 7: Configure Nginx Reverse Proxy](#step-7-configure-nginx-reverse-proxy)
9. [Step 8: Verification & Maintenance](#step-8-verification--maintenance)

---

## 1. Prerequisites

- A **Docker Hub** account ([https://hub.docker.com/](https://hub.docker.com/)). Replace `<your-dockerhub-username>` with your actual username.
- Docker installed on your local computer.
- An active **AWS EC2 Ubuntu Instance** (Ubuntu 22.04 LTS or 24.04 LTS recommended).
- EC2 **Security Group Rules** configured to allow:
  - **SSH (Port 22)**: From your IP
  - **HTTP (Port 80)**: Anywhere (`0.0.0.0/0`)
  - **HTTPS (Port 443)**: Anywhere (`0.0.0.0/0`)
- **GitHub Repository Secrets** (for automated CI/CD via `.github/workflows/docker.yml`):
  - `DOCKERHUB_USERNAME`: Your Docker Hub username.
  - `DOCKERHUB_TOKEN`: Docker Hub Personal Access Token (Create via Docker Hub -> Account Settings -> Security -> New Access Token).

---

## Step 1: Build & Test Docker Image Locally

Open your terminal or command prompt in the project root directory (`money-lending-app`):

### 1. Build the Docker Image
```bash
docker build -t <your-dockerhub-username>/money-lending-app:latest .
```

### 2. Verify Image Created
```bash
docker images
```

### 3. Test Running Locally
```bash
docker run -d \
  -p 3000:3000 \
  --name test-lendtrack \
  -v lendtrack_data:/app/data \
  <your-dockerhub-username>/money-lending-app:latest
```

Open `http://localhost:3000` in your browser to verify it runs smoothly.

### 4. Stop Local Test Container
```bash
docker stop test-lendtrack && docker rm test-lendtrack
```

---

## Step 2: Push Image to Docker Hub

### 1. Log in to Docker Hub from Terminal
```bash
docker login
```
Enter your Docker Hub username and password (or Personal Access Token).

### 2. Push the Docker Image to Docker Hub
```bash
docker push <your-dockerhub-username>/money-lending-app:latest
```

---

## Step 3: Setup AWS EC2 Ubuntu Server

SSH into your AWS EC2 Ubuntu instance:
```bash
ssh -i /path/to/your-key.pem ubuntu@<your-ec2-public-ip-or-dns>
```

Update system packages:
```bash
sudo apt update && sudo apt upgrade -y
```

---

## Step 4: Install Docker & Nginx on EC2

Run the following commands on your EC2 Ubuntu terminal:

### 1. Install Docker & Nginx
```bash
sudo apt install -y docker.io nginx apache2-utils
```

### 2. Enable & Start Services
```bash
sudo systemctl enable --now docker
sudo systemctl enable --now nginx
```

### 3. Add `ubuntu` User to Docker Group (Optional, eliminates need for `sudo` with Docker)
```bash
sudo usermod -aG docker ubuntu
newgrp docker
```

---

## Step 5: Configure Nginx Basic Authentication

Nginx will require a username & password to access the app.

### 1. Create the `.htpasswd` Auth File
Run `htpasswd` to generate credentials for the user `admin`:
```bash
sudo htpasswd -c /etc/nginx/.htpasswd admin
```
> You will be prompted to enter and confirm a password for the `admin` account.

### 2. Verify `.htpasswd` File Exists
```bash
sudo cat /etc/nginx/.htpasswd
```

---

## Step 6: Pull & Run Docker Container on EC2

### 1. Pull Image from Docker Hub
```bash
docker pull <your-dockerhub-username>/money-lending-app:latest
```

### 2. Create Persistent Host Directory for Data (`db.json`)
```bash
sudo mkdir -p /var/lib/money-lending-app/data
sudo chown -R 1000:1000 /var/lib/money-lending-app/data
```

### 3. Run the Container in Background with Restart Policy & Data Volume
```bash
docker run -d \
  --name lendtrack-app \
  --restart always \
  -p 127.0.0.1:3000:3000 \
  -v /var/lib/money-lending-app/data:/app/data \
  <your-dockerhub-username>/money-lending-app:latest
```

### 4. Check Container Status
```bash
docker ps
docker logs lendtrack-app
```

---

## Step 7: Configure Nginx Reverse Proxy

### 1. Create Nginx Site Configuration
Create `/etc/nginx/sites-available/money-lending-app`:
```bash
sudo nano /etc/nginx/sites-available/money-lending-app
```

Paste the following configuration:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name _; # Or replace with your domain name e.g., lend.example.com

    client_max_body_size 10M;

    # NGINX HTTP BASIC AUTHENTICATION
    auth_basic "Restricted Access - LendTrack Admin Authentication";
    auth_basic_user_file /etc/nginx/.htpasswd;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Enable Configuration & Disable Default Nginx Page
```bash
sudo ln -sf /etc/nginx/sites-available/money-lending-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

### 3. Test & Reload Nginx Configuration
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 8: Verification & Maintenance

### 1. Test Application Access
Open your web browser and navigate to your EC2 public IP or domain:
```
http://<your-ec2-public-ip>
```
- Browser will display a authentication prompt requesting **Username** (`admin`) and **Password**.
- After entering valid credentials, the **LendTrack Money Lending System** portal opens!

### 2. How to Update Application in Future
Whenever you update your code:
1. On Local Machine:
   ```bash
   docker build -t <your-dockerhub-username>/money-lending-app:latest .
   docker push <your-dockerhub-username>/money-lending-app:latest
   ```
2. On EC2 Instance:
   ```bash
   docker pull <your-dockerhub-username>/money-lending-app:latest
   docker stop lendtrack-app && docker rm lendtrack-app
   docker run -d --name lendtrack-app --restart always -p 127.0.0.1:3000:3000 -v /var/lib/money-lending-app/data:/app/data <your-dockerhub-username>/money-lending-app:latest
   ```

---

## 🛠️ Summary of Files Created in Project
- [Dockerfile](file:///c:/Users/krati/Desktop/money-lending-app/Dockerfile) - Production Node.js container setup.
- [.dockerignore](file:///c:/Users/krati/Desktop/money-lending-app/.dockerignore) - Excludes `node_modules` and metadata.
- [nginx.conf](file:///c:/Users/krati/Desktop/money-lending-app/nginx.conf) - Pre-configured reverse proxy & authentication rules.
- [docker-compose.yml](file:///c:/Users/krati/Desktop/money-lending-app/docker-compose.yml) - Optional multi-container runner.
- [DEPLOYMENT.md](file:///c:/Users/krati/Desktop/money-lending-app/DEPLOYMENT.md) - Full step-by-step terminal instructions.
