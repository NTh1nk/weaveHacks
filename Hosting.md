# Plan for Hosting (Excluding CodeTurtle)

This document provides step-by-step instructions for hosting the remaining components of this project on Azure. **CodeTurtle** is already hosted on Vercel and is not included here.

---

## 1. Dashboard (Next.js App)

### Recommended Azure Service
- **Azure Static Web Apps** (for static export)
- **Azure App Service** (for SSR or API routes)

### Steps for Azure Static Web Apps (Static Export)
1. **Build the app:**
   ```bash
   cd dashboard
   npm install
   npm run build
   npm run export
   ```
   The static output will be in the `out/` directory.
2. **Push your code to GitHub.**
3. **Create an Azure Static Web App** in the Azure Portal and link your GitHub repo.
4. **Configure build settings:**
   - App location: `dashboard`
   - Output location: `out`
5. **Azure will build and deploy automatically.**

### Steps for Azure App Service (SSR/Server-side)
1. **Build the app:**
   ```bash
   cd dashboard
   npm install
   npm run build
   ```
2. **Create an Azure App Service** (Node.js runtime).
3. **Deploy code** via GitHub Actions, Azure CLI, or FTP.
4. **Set environment variables** in the Azure portal as needed.
5. **Configure custom domains and SSL** if required.

---

## 2. first-agent (Python Backend)

### Recommended Azure Service
- **Azure App Service (Linux, Python runtime)**
- **Azure Container Apps** (if using Docker)

### Steps for Azure App Service
1. **Prepare your app:**
   - Ensure `requirements.txt` is up to date.
   - (Optional) Add a `startup.txt` or `gunicorn` command if using Flask/FastAPI.
2. **Push your code to GitHub.**
3. **Create an Azure App Service** (Python runtime, e.g., Python 3.10).
4. **Configure deployment:**
   - Use GitHub Actions or Azure CLI for deployment.
5. **Set environment variables/secrets** in the Azure portal.
6. **Configure scaling, custom domains, and SSL** as needed.

### Steps for Azure Container Apps (Docker)
1. **Add a Dockerfile** to your project root (if not present).
2. **Build and test your container locally.**
3. **Push your image to Azure Container Registry or Docker Hub.**
4. **Create an Azure Container App** and use your image.
5. **Set environment variables/secrets** in the Azure portal.

---

## 3. testBrowserbase (Node.js/TypeScript Utilities)

### Recommended Azure Service
- **Azure App Service (Node.js runtime)**
- **Azure Functions** (for serverless jobs)
- **Azure Container Apps** (for Dockerized services)

### Steps for Azure App Service
1. **Prepare your app:**
   - Ensure `package.json` and dependencies are up to date.
2. **Push your code to GitHub.**
3. **Create an Azure App Service** (Node.js runtime).
4. **Configure deployment:**
   - Use GitHub Actions or Azure CLI for deployment.
5. **Set environment variables/secrets** in the Azure portal.

### Steps for Azure Functions (Serverless)
1. **Identify scripts or endpoints suitable for serverless execution.**
2. **Refactor as Azure Functions if needed.**
3. **Deploy using Azure Functions Core Tools or VS Code Azure extension.**

---

## 4. Database/Storage (If Needed)
- **Azure Database for PostgreSQL/MySQL** for relational data
- **Azure Cosmos DB** for NoSQL
- **Azure Blob Storage** for files/assets

---

## 5. CI/CD
- Use **GitHub Actions** or **Azure DevOps Pipelines** for automated deployment to all services.

---

## References
- [Azure Static Web Apps Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [Azure App Service Documentation](https://learn.microsoft.com/en-us/azure/app-service/)
- [Deploy Python apps to Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/quickstart-python)
- [Deploy Next.js to Azure](https://learn.microsoft.com/en-us/azure/static-web-apps/deploy-nextjs)

---

# VM Hosting

This section describes how to host all project components (except CodeTurtle web app) on a single Azure Virtual Machine (VM).

## 1. Provision the Azure VM
- Use the Azure Portal to create a Linux VM (Ubuntu recommended).
- Choose a VM size based on your expected workload.
- Open required ports (e.g., 80/443 for web, 22 for SSH).

## 2. Set Up the Environment
- SSH into your VM. 
- Update the system:
  ```bash
  sudo apt update && sudo apt upgrade -y
  ```
- Install Node.js and npm:
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```
- Install Python and pip:
  ```bash
  sudo apt-get install -y python3 python3-pip python3-venv
  ```
- (Optional) Install Docker if you want to use containers:
  ```bash
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  ```

## 3. Deploy Your Apps
- Clone your repository onto the VM:
  ```bash
  git clone <your-repo-url>
  cd <project-root>
  ```
- For each app:
  - **dashboard**:
    ```bash
    cd dashboard
    npm install
    npm run build
    npm start # or next start
    ```
  - **first-agent**:
    ```bash
    cd first-agent
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    python server.py # or use gunicorn/uvicorn as needed
    ```
  - **testBrowserbase**:
    ```bash
    cd testBrowserbase/stagehandtest
    npm install
    node test.ts # or your desired entry point
    ```

## 4. Process Management
- Use **pm2** for Node.js apps:
  ```bash
  sudo npm install -g pm2
  pm2 start npm --name dashboard -- start
  pm2 start node --name testBrowserbase -- test.ts
  pm2 save
  pm2 startup
  ```
- Use **systemd** or **supervisor** for Python apps, or run with pm2 if using gunicorn/uvicorn.

## 5. Reverse Proxy (Recommended)
- Install nginx:
  ```bash
  sudo apt-get install -y nginx
  ```
- Example nginx config:
  ```nginx
  server {
      listen 80;
      server_name yourdomain.com;

      location /dashboard/ {
          proxy_pass http://localhost:3000/;
      }

      location /api/ {
          proxy_pass http://localhost:8000/;
      }
  }
  ```
- Adjust ports and paths as needed.
- Reload nginx:
  ```bash
  sudo systemctl reload nginx
  ```

## 6. Domain and SSL
- Point your domain(s) to the VM’s public IP.
- Use **Let’s Encrypt** for free SSL certificates:
  ```bash
  sudo apt-get install -y certbot python3-certbot-nginx
  sudo certbot --nginx
  ```

## 7. Security
- Keep your system and dependencies updated.
- Use firewalls (e.g., UFW) and restrict SSH access.
- Regularly back up your VM or use Azure’s backup services.

---

**Note:** This approach gives you full control but also full responsibility for maintenance, security, and scaling. For production workloads, consider Azure’s managed services for easier scaling and management.
