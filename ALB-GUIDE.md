# AWS Application Load Balancer (ALB) & Multi-Replica Architecture

This guide details the procedure to deploy an **AWS Application Load Balancer (ALB)** backed by multiple replicated EC2 instances, and build the frontend with the **Multi-Stage Build** pattern.

---

## 1. Frontend Multi-Stage Build

The `Dockerfile.frontend` follows the official multi-stage pattern:
- **Stage 1 (`frontend-builder`):** Uses `node:20-alpine` to process static assets into `dist/`.
- **Stage 2 (`runtime`):** Copies solely the `dist/` artifacts into `nginx:alpine` to serve assets with minimal footprint and zero build dependencies.

```bash
docker build -t sebas11221/tienda-frontend:v1.0.0 -f Dockerfile.frontend .
```

---

## 2. AWS Application Load Balancer (ALB) Setup

### Step A: Launch 2 or 3 Replicated EC2 Instances
1. In the EC2 console, launch 2 instances (e.g. `tienda-replica-1`, `tienda-replica-2`).
2. Attach the same Security Group with HTTP port `80` open.
3. On both instances, run the stack using Docker Compose:
   ```bash
   git clone -b dev https://github.com/sebastian123magno1-eng/tienda_pokeApi.git
   cd tienda_pokeApi
   docker compose up -d
   ```

### Step B: Create a Target Group
1. Go to **EC2** > **Target Groups** > **Create target group**.
2. Target type: **Instances**.
3. Name: `tienda-pokeapi-tg`.
4. Protocol: **HTTP**, Port: **80**.
5. Health checks:
   - Protocol: **HTTP**
   - Health check path: `/index.html` (or `/api/products`)
6. Register the 2 or 3 running EC2 instances and click **Create target group**.

### Step C: Create the Application Load Balancer
1. Go to **EC2** > **Load Balancers** > **Create Load Balancer** > **Application Load Balancer**.
2. Name: `tienda-pokeapi-alb`.
3. Scheme: **Internet-facing**, IP address type: **IPv4**.
4. Network mapping: Select your default VPC and at least two Subnets (Availability Zones).
5. Security groups: Select your Security Group allowing HTTP port `80`.
6. Listeners and routing:
   - Protocol: **HTTP**, Port: **80**.
   - Default action: Forward to `tienda-pokeapi-tg`.
7. Click **Create load balancer**.

---

## 3. Verifying the Load Balancer DNS

Once the ALB state changes from `Provisioning` to `Active`:
1. Copy the **DNS name** (e.g., `tienda-pokeapi-alb-123456789.us-east-1.elb.amazonaws.com`).
2. Access in browser:
   - `http://<ALB_DNS_NAME>/index.html`
   - `http://<ALB_DNS_NAME>/pokemon.html`
3. Execute the k6 load testing suite against the ALB DNS:
   ```bash
   k6 run -e TARGET_URL=http://<ALB_DNS_NAME> k6/load-test.js
   ```
