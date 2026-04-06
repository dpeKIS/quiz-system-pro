# MySQL Setup Guide - Quiz System Pro

## Installation

### Windows (WSL)
```bash
sudo apt update
sudo apt install mysql-server
sudo service mysql start
```

### macOS (Homebrew)
```bash
brew install mysql
brew services start mysql
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

## Initial Configuration

### 1. Secure MySQL Installation
```bash
sudo mysql_secure_installation
```

Follow the prompts:
- Set root password: `yes`
- Remove anonymous users: `yes`
- Disable remote root login: `yes`
- Remove test database: `yes`
- Reload privilege tables: `yes`

### 2. Create Database and User

Login to MySQL:
```bash
mysql -u root -p
```

Then run these SQL commands:
```sql
-- Create database
CREATE DATABASE quiz_system;

-- Create user
CREATE USER 'quiz_user'@'localhost' IDENTIFIED BY 'quiz_password_123';

-- Grant privileges
GRANT ALL PRIVILEGES ON quiz_system.* TO 'quiz_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Exit
EXIT;
```

### 3. Verify Connection
```bash
mysql -u quiz_user -p quiz_system
```

Enter password: `quiz_password_123`

If successful, you'll see the MySQL prompt: `mysql>`

## Update .env.local

Update your `.env.local` file with the correct connection string:

```env
DATABASE_URL="mysql://quiz_user:quiz_password_123@localhost:3306/quiz_system"
```

## Initialize Database Schema

From your project directory:

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

This will create all tables automatically.

## Verify Setup

```bash
mysql -u quiz_user -p quiz_system -e "SHOW TABLES;"
```

You should see these tables:
- users
- quizzes
- questions
- sessions
- attempts

## Troubleshooting

### "Access denied for user"
- Check username and password in .env.local
- Verify user exists: `mysql -u root -p -e "SELECT User FROM mysql.user;"`

### "Can't connect to MySQL server"
- Verify MySQL is running: `sudo service mysql status`
- Start MySQL: `sudo service mysql start`

### "Unknown database"
- Create database: `mysql -u root -p -e "CREATE DATABASE quiz_system;"`

### Port Already in Use
MySQL uses port 3306 by default. If it's in use:
```bash
sudo lsof -i :3306
sudo kill -9 <PID>
```

## Backup & Restore

### Backup Database
```bash
mysqldump -u quiz_user -p quiz_system > backup.sql
```

### Restore Database
```bash
mysql -u quiz_user -p quiz_system < backup.sql
```

## Production Considerations

For production deployment:
1. Use strong passwords (min 16 characters)
2. Enable SSL connections
3. Set up automated backups
4. Use managed database services (AWS RDS, Google Cloud SQL, etc.)
5. Never commit .env files to git

## Next Steps

Once MySQL is set up:
```bash
cd quiz-system-pro
pnpm install
pnpm dev
```

Your app should now run on `http://localhost:3000`

---

**Need help?** Check the main README.md for more information.
