@echo off
:: Request Administrator elevation if not already running as admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Elevating privileges to configure Windows Firewall...
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

echo =================================================================
echo   BAMAS COLLECTIONS - 1-CLICK PERMANENT MOBILE WI-FI FIX
echo =================================================================
echo.
echo [1/3] Setting Wi-Fi network profile to Private...
powershell -NoProfile -Command "Get-NetConnectionProfile | Where-Object { $_.InterfaceAlias -match 'Wi-Fi' } | Set-NetConnectionProfile -NetworkCategory Private" >nul 2>&1

echo [2/3] Opening Port 3000 for Next.js in Windows Defender Firewall (All Profiles)...
netsh advfirewall firewall delete rule name="Bamas Next.js Port 3000" >nul 2>&1
netsh advfirewall firewall add rule name="Bamas Next.js Port 3000" dir=in action=allow protocol=TCP localport=3000 profile=any >nul 2>&1

echo [3/3] Opening Port 8080 ^& 5000 in Windows Defender Firewall (All Profiles)...
netsh advfirewall firewall delete rule name="Bamas Port 8080" >nul 2>&1
netsh advfirewall firewall add rule name="Bamas Port 8080" dir=in action=allow protocol=TCP localport=8080 profile=any >nul 2>&1
netsh advfirewall firewall delete rule name="Bamas Port 5000" >nul 2>&1
netsh advfirewall firewall add rule name="Bamas Port 5000" dir=in action=allow protocol=TCP localport=5000 profile=any >nul 2>&1

echo.
echo =================================================================
echo   SUCCESS! Windows Firewall is now permanently open for phone access.
echo.
echo   Your Laptop Wi-Fi IP is:
powershell -NoProfile -Command "(Get-NetIPAddress -InterfaceAlias 'Wi-Fi' -AddressFamily IPv4).IPAddress"
echo.
echo   Open this URL on your phone browser for Next.js:
echo   http://192.168.1.68:3000
echo =================================================================
echo.
pause
