@echo off
echo Building frontend...
cd frontend
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Build failed, but continuing with git operations...
)
cd ..
echo.
echo Checking git status...
git status
echo.
echo Adding all changes...
git add .
echo.
echo Committing changes...
git commit -m "Build frontend and update repository"
echo.
echo Pushing to GitHub...
git push
echo.
echo Done!

