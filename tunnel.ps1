# HelloPay - Neural Tunnel Controller
# This script starts your local backend and exposes it to the internet for FREE using Localtunnel.

$PORT = 5000
$SUBDOMAIN = "hellopay-preview-" + (Get-Random -Minimum 1000 -Maximum 9999)

Write-Host "--- HelloPay Neural Tunnel Initializing ---" -ForegroundColor Cyan
Write-Host "Target Port: $PORT"
Write-Host "Suggested Subdomain: $SUBDOMAIN"
Write-Host "------------------------------------------"

# Start the Backend in a new window
Write-Host "[1/2] Launching Neural Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Wait for server to initialize
Start-Sleep -Seconds 3

# Start Localtunnel
Write-Host "[2/2] Establishing External Uplink (Localtunnel)..." -ForegroundColor Yellow
Write-Host "Your public URL will appear below:" -ForegroundColor Green
npx localtunnel --port $PORT --subdomain $SUBDOMAIN
