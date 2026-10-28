# AWS EC2 & Docker Deployment Guide

This guide details the procedure to deploy the Store & PokéAPI application on an AWS EC2 instance using Docker and Docker Compose.

---

## 1. Launching the EC2 Instance (AWS Academy Learner Lab)

1. Open the **AWS Management Console** via the Learner Lab.
2. Navigate to **EC2** > **Instances** > **Launch instances**.
3. **Name:** `tienda-pokeapi-server`
4. **Application and OS Images (AMI):** Select **Amazon Linux 2023 AMI** (or Amazon Linux 2).
5. **Instance Type:** `t2.micro` (eligible for AWS Learner Lab).
6. **Key pair:** Select `vockey` (default lab key pair) or proceed without key pair if using EC2 Instance Connect.

---

## 2. Network & Security Group Configuration

Under **Network settings**:
- Enable **Allow HTTP traffic from the internet** (Port `80`, Source `0.0.0.0/0`).
- Enable **Allow SSH traffic from** your IP or `0.0.0.0/0` (Port `22`).

---

## 3. User Data / Automated Initialization Script

In **Advanced details** > **User data**, paste the following script to automatically install Docker and Docker Compose on boot:

```bash
#!/bin/bash
# System update
dnf update -y || yum update -y

# Install Docker and Git
dnf install -y docker git || yum install -y docker git

# Start and enable Docker service
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# Install Docker Compose plugin
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.29.1/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
```

---

## 4. Deploying the Application

1. Connect to the running instance using **EC2 Instance Connect** in the AWS console.
2. Clone the repository:
   ```bash
   git clone -b dev https://github.com/sebastian123magno1-eng/tienda_pokeApi.git
   cd tienda_pokeApi
   ```
3. Launch the containerized stack:
   ```bash
   docker compose up -d --build
   ```
4. Verify running containers:
   ```bash
   docker ps
   ```

---

## 5. Verification

Open a web browser and navigate to:
- `http://<EC2_PUBLIC_IP>/index.html` (Products Catalog & CRUD)
- `http://<EC2_PUBLIC_IP>/pokemon.html` (PokéAPI & 4s Debounce)

---

## 6. Credit Management ($50 Budget Preservation)

To avoid exhausting the allocated $50 USD lab credit:
1. When not in use or outside testing/grading sessions, navigate to **Instances** in EC2.
2. Select your instance and choose **Instance state** > **Stop instance**.
3. Click **End Lab** in the Learner Lab canvas.
