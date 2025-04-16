@echo on
setlocal

echo ===== Starting project setup =====

echo Installing pnpm globally...
call npm install -g pnpm
echo npm install -g pnpm exit code: %errorlevel%
if errorlevel 1 (
  echo ERROR: Failed to install pnpm globally. Exiting.
  pause
  exit /b 1
)

echo Ensuring pnpm is available in PATH...
call pnpm -v
echo pnpm -v exit code: %errorlevel%
if errorlevel 1 (
  echo ERROR: pnpm command not found after installation. Check PATH environment variable. Exiting.
  pause
  exit /b 1
)

echo Current directory: %CD%
echo Checking package.json...
if not exist package.json (
  echo ERROR: package.json not found! Exiting.
  pause
  exit /b 1
) else (
  echo package.json found.
)

echo Running pnpm install with verbose output...
call pnpm install --reporter=verbose
echo pnpm install exit code: %errorlevel%

echo Checking if node_modules folder was created...
if not exist node_modules (
  echo WARNING: node_modules folder not created by pnpm install.
  echo Trying alternative installation method with npm...
  call npm install
  echo npm install exit code: %errorlevel%
  
  if not exist node_modules (
    echo ERROR: node_modules folder still not created after pnpm and npm attempts.
    echo Please try running "npm install" manually.
    pause
    exit /b 1
  ) else (
    echo node_modules folder created by npm install.
  )
) else (
  echo node_modules folder created by pnpm install.
)

echo Checking for next.js binary...
if not exist node_modules\.bin\next.cmd (
  echo WARNING: next.js binary not found in node_modules\.bin. Installing explicitly...
  call npm install next
  echo npm install next exit code: %errorlevel%
  if not exist node_modules\.bin\next.cmd (
    echo ERROR: Failed to install next.js binary. Exiting.
    pause
    exit /b 1
  )
) else (
  echo next.js binary found.
)

echo ===== Setup complete! =====
echo You should now be able to run the project with run.bat
pause
endlocal
