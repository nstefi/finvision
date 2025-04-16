@echo off
echo Starting git operations...

:: Add all files
git add .

:: Get current date and time for commit message
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)

:: Commit with timestamp
git commit -m "Snapshot: %mydate% %mytime%"

:: Push to GitHub
git push

echo Git operations completed!
pause
