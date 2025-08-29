@echo off
echo ========================================
echo ECO4 Survey Management - Deployment Helper
echo ========================================
echo.

echo Step 1: Checking if you have the required files...
if not exist "index.html" (
    echo ERROR: index.html not found!
    pause
    exit /b 1
)
if not exist "script.js" (
    echo ERROR: script.js not found!
    pause
    exit /b 1
)
if not exist "server.js" (
    echo ERROR: server.js not found!
    pause
    exit /b 1
)
if not exist "package.json" (
    echo ERROR: package.json not found!
    pause
    exit /b 1
)
echo ✓ All required files found!
echo.

echo Step 2: Instructions for deployment:
echo.
echo 1. Create a GitHub repository:
echo    - Go to https://github.com
echo    - Click "New repository"
echo    - Name it "eco4-survey-management"
echo    - Make it public
echo    - Don't initialize with README
echo.
echo 2. Upload your files to GitHub:
echo    - Upload ALL files in this folder to your repository
echo    - Make sure to include: index.html, script.js, server.js, package.json, railway.json
echo.
echo 3. Deploy to Railway:
echo    - Go to https://railway.app
echo    - Sign in with GitHub
echo    - Click "New Project"
echo    - Select "Deploy from GitHub repo"
echo    - Choose your repository
echo    - Wait for deployment (2-3 minutes)
echo.
echo 4. Get your live URL:
echo    - Railway will give you a URL like: https://your-app.railway.app
echo    - Share this URL with others - they'll see the same data!
echo.

echo ========================================
echo IMPORTANT: This will enable shared data!
echo ========================================
echo.
echo Once deployed, everyone who opens your Railway URL will:
echo - See the same surveys and files
echo - Get real-time updates when data changes
echo - Have data saved permanently on Railway servers
echo.

pause
