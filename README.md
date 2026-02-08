# Task Management Tool

## Quick Start with Docker

### Prerequisites

- Docker
- Docker Compose

### Installation

1. Clone the repository
```bash
git clone https://github.com/hmcdat/task-management-tool
cd task-management-tool
```

2. Create environment file
```bash
cp .env.example .env
```

3. Edit `.env` and fill in your configuration values

4. Start the application
```bash
docker-compose up -d
```

5. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Docker Commands

Stop containers:
```bash
docker-compose down
```

View logs:
```bash
docker-compose logs -f
```

Rebuild containers:
```bash
docker-compose up -d --build
```
