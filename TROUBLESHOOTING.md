# Troubleshooting Guide

## 500 Internal Server Error

If you're getting a 500 error, check the following:

### 1. Check Server Console Logs

The server now logs detailed error information. Look at your server terminal for:
- Error messages
- Stack traces
- API request details

### 2. Verify Environment Variables

Make sure your `server/.env` file exists and has all required variables:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lootbox_db
JWT_SECRET=your_jwt_secret_here
PORT=3001
RAWG_API_KEY=your_rawg_api_key_here
```

**To check if variables are loaded:**
- Look at server startup logs - they now show which variables are set
- The server will warn if RAWG_API_KEY or JWT_SECRET are missing

### 3. Node.js Version

The server uses `fetch()` which requires Node.js 18 or higher.

**Check your version:**
```bash
node --version
```

**If you have Node.js < 18:**
- Upgrade to Node.js 18+ (recommended)
- Or install `node-fetch` package:
  ```bash
  cd server
  npm install node-fetch
  ```
  Then update `server.js` to import it:
  ```js
  import fetch from 'node-fetch';
  ```

### 4. Database Connection

If authentication endpoints fail, check:
- MySQL is running
- Database exists: `lootbox_db`
- User has correct permissions
- Connection credentials in `.env` are correct

**Test database connection:**
```bash
mysql -u root -p -e "USE lootbox_db; SHOW TABLES;"
```

### 5. RAWG API Key Issues

**Common problems:**
- API key not set in `.env`
- API key is invalid or expired
- API rate limit exceeded
- Network connectivity issues

**To verify:**
- Check server logs for RAWG API errors
- Test API key directly:
  ```bash
  curl "https://api.rawg.io/api/games?key=YOUR_API_KEY&page=1&page_size=1"
  ```

### 6. CORS Issues

If you see CORS errors in browser console:
- Make sure server is running on port 3001
- Check that frontend URL matches CORS configuration
- Verify `FRONTEND_URL` in `.env` if in production

### 7. Authentication Token Issues

**Symptoms:**
- 401 Unauthorized errors
- 403 Forbidden errors

**Solutions:**
- Check JWT_SECRET is set in `.env`
- Verify token is being sent in Authorization header
- Token might be expired (1 hour default)
- Try logging in again to get a new token

## Common Error Messages

### "API key not configured"
- **Solution:** Set `RAWG_API_KEY` in `server/.env`

### "fetch is not available"
- **Solution:** Upgrade to Node.js 18+ or install `node-fetch`

### "Access token required"
- **Solution:** Make sure you're logged in and token is in localStorage

### "Invalid or expired token"
- **Solution:** Log out and log in again

### "ER_ACCESS_DENIED_ERROR" (MySQL)
- **Solution:** Check database credentials in `.env`

### "ER_BAD_DB_ERROR" (MySQL)
- **Solution:** Create the database: `CREATE DATABASE lootbox_db;`

## Debug Mode

To see more detailed error messages, set in `server/.env`:
```env
NODE_ENV=development
```

This will include error details in API responses (only use in development!).

## Getting Help

1. Check server console logs for detailed errors
2. Verify all environment variables are set
3. Test database connection
4. Verify Node.js version (18+)
5. Check RAWG API key is valid
6. Review browser console for client-side errors

## Quick Fixes

**Restart everything:**
```bash
# Stop server (Ctrl+C)
# Then restart:
cd server
npm start

# In another terminal:
cd client
npm run dev
```

**Clear browser data:**
- Clear localStorage
- Clear cookies
- Hard refresh (Ctrl+Shift+R)

**Reset database:**
```bash
mysql -u root -p
DROP DATABASE lootbox_db;
CREATE DATABASE lootbox_db;
USE lootbox_db;
SOURCE server/database/schema.sql;
```





