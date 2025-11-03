@echo off
setlocal ENABLEDELAYEDEXPANSION

:: Usage: setup-mysql.bat <root_password> [db_name] [app_user] [app_password] [port]
:: Defaults: db_name=csr, app_user=csr_user, app_password=csr_pass, port=3306

set ROOT_USER=root
set ROOT_PASS=%~1
set DB_NAME=%~2
set APP_USER=%~3
set APP_PASS=%~4
set PORT=%~5

if "%DB_NAME%"=="" set DB_NAME=csr
if "%APP_USER%"=="" set APP_USER=csr_user
if "%APP_PASS%"=="" set APP_PASS=csr_pass
if "%PORT%"=="" set PORT=3306

if "%ROOT_PASS%"=="" (
  echo [!] Root password not provided.
  set /p ROOT_PASS=Enter MySQL root password: 
)

echo [i] Using settings:
echo     Host: 127.0.0.1:%PORT%
echo     DB:   %DB_NAME%
echo     User: %APP_USER%
echo     Root: %ROOT_USER%

:: Build temp SQL file
set "SQL_FILE=%TEMP%\csr_mysql_setup.sql"
> "%SQL_FILE%" echo CREATE DATABASE IF NOT EXISTS `%DB_NAME%` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
>>"%SQL_FILE%" echo CREATE USER IF NOT EXISTS '%APP_USER%'@'localhost' IDENTIFIED BY '%APP_PASS%';
>>"%SQL_FILE%" echo GRANT ALL PRIVILEGES ON `%DB_NAME%`.* TO '%APP_USER%'@'localhost';
>>"%SQL_FILE%" echo FLUSH PRIVILEGES;

:: Test mysql presence
where mysql >nul 2>nul
if errorlevel 1 (
  echo [!] mysql client not found in PATH. Install MySQL or add its bin folder to PATH.
  echo     Example: C:\Program Files\MySQL\MySQL Server 8.0\bin
  exit /b 1
)

:: Execute SQL
"mysql" --host=127.0.0.1 --port=%PORT% --user=%ROOT_USER% --password=%ROOT_PASS% --protocol=TCP < "%SQL_FILE%"
if errorlevel 1 (
  echo [!] Failed to apply SQL. Check root password, port, and MySQL service status.
  del /q "%SQL_FILE%" >nul 2>nul
  exit /b 1
)

del /q "%SQL_FILE%" >nul 2>nul

echo [✓] MySQL ready.
echo     Database: %DB_NAME%
echo     App user: %APP_USER%

echo.
echo Next steps:
echo 1) In backend/application.properties:
echo    spring.datasource.url=jdbc:mysql://localhost:%PORT%/%DB_NAME%?useSSL=false^&allowPublicKeyRetrieval=true^&serverTimezone=UTC
echo    spring.datasource.username=%APP_USER%
echo    spring.datasource.password=%APP_PASS%

echo 2) Start Spring Boot backend (port 8080)

echo Done.
exit /b 0
