# ============================================================
# Opulanz Frontend - Azure Deployment Script
# ============================================================

$APP_NAME = "rg-opulanz-frontend"
$RESOURCE_GROUP = "opulanz-rg"
$FRONTEND_PATH = "C:\Users\Toufi\AndroidStudioProjects\azuree"

Set-Location $FRONTEND_PATH

# ── STEP 1: Set environment variables ───────────────────────
Write-Host "`nStep 1: Setting environment variables..." -ForegroundColor Cyan

$settings = @(
  @{ name="NEXT_PUBLIC_API_URL";            value="https://rg-opulanz-backend-ffa3bgfze4a4g6gf.canadacentral-01.azurewebsites.net" },
  @{ name="NEXT_PUBLIC_APP_URL";            value="https://rg-opulanz-frontend-hdd4ddcvd4gsc6cx.canadacentral-01.azurewebsites.net" },
  @{ name="NEXT_PUBLIC_APP_NAME";           value="Opulanz Banking" },
  @{ name="NEXT_PUBLIC_GOOGLE_CLIENT_ID";   value="213751673679-2iucu4qt4itvq18kjnj7e4rvbe9tm3hs.apps.googleusercontent.com" },
  @{ name="NEXT_PUBLIC_PAYPAL_CLIENT_ID";   value="AY2J7gUncxDdmNXWjLaw5E9A4Gz6X-hcQvagQBhi2erpaMLeHoaHbGIi7dgns3GZ3oFxg-wO0Xhwy0qo" },
  @{ name="NEXT_PUBLIC_PAYPAL_CURRENCY";    value="EUR" },
  @{ name="NEXT_PUBLIC_ENABLE_ANALYTICS";  value="false" },
  @{ name="NEXT_PUBLIC_ENABLE_DEBUG";       value="false" },
  @{ name="NEXT_PUBLIC_ENVIRONMENT";        value="production" },
  @{ name="NEXT_PUBLIC_BASE_URL";           value="https://rg-opulanz-frontend-hdd4ddcvd4gsc6cx.canadacentral-01.azurewebsites.net" },
  @{ name="WEBSITE_NODE_DEFAULT_VERSION";   value="~20" },
  @{ name="SCM_DO_BUILD_DURING_DEPLOYMENT"; value="true" },
  @{ name="WEBSITE_RUN_FROM_PACKAGE";       value="0" }
) | ConvertTo-Json -Compress

$settings | Out-File -FilePath "appsettings-frontend.json" -Encoding utf8

az webapp config appsettings set --name $APP_NAME --resource-group $RESOURCE_GROUP --settings "@appsettings-frontend.json" | Out-Null

Remove-Item "appsettings-frontend.json" -ErrorAction SilentlyContinue
Write-Host "Environment variables set." -ForegroundColor Green

# ── STEP 2: Build the Next.js app ────────────────────────────
Write-Host "`nStep 2: Building Next.js app..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Fix errors before deploying." -ForegroundColor Red
    exit 1
}
Write-Host "Build complete." -ForegroundColor Green

# ── STEP 3: Create deployment zip ────────────────────────────
Write-Host "`nStep 3: Creating deployment zip..." -ForegroundColor Cyan

if (Test-Path "deploy-frontend.zip") { Remove-Item "deploy-frontend.zip" }

Add-Type -Assembly "System.IO.Compression.FileSystem"
$zip = [System.IO.Compression.ZipFile]::Open("$FRONTEND_PATH\deploy-frontend.zip", "Create")

$include = @(".next", "public", "package.json", "next.config.js", "i18n", "messages")

foreach ($item in $include) {
    $fullPath = Join-Path $FRONTEND_PATH $item
    if (Test-Path $fullPath -PathType Container) {
        $files = Get-ChildItem -Path $fullPath -Recurse -File
        foreach ($file in $files) {
            $relative = $file.FullName.Substring($FRONTEND_PATH.Length + 1)
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $relative) | Out-Null
        }
    } elseif (Test-Path $fullPath -PathType Leaf) {
        $relative = $item
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $fullPath, $relative) | Out-Null
    }
}

$zip.Dispose()
$zipSize = [math]::Round((Get-Item "deploy-frontend.zip").Length / 1MB, 1)
Write-Host "Zip created: $zipSize MB" -ForegroundColor Green

# ── STEP 4: Deploy ───────────────────────────────────────────
Write-Host "`nStep 4: Deploying to Azure (this takes 3-5 minutes)..." -ForegroundColor Cyan

az webapp deploy --name $APP_NAME --resource-group $RESOURCE_GROUP --src-path "deploy-frontend.zip" --type zip --timeout 600

Write-Host "`nStep 5: Setting startup command..." -ForegroundColor Cyan
az webapp config set --name $APP_NAME --resource-group $RESOURCE_GROUP --startup-file "node_modules/.bin/next start" | Out-Null

# ── STEP 5: Test ─────────────────────────────────────────────
Write-Host "`nStep 6: Testing frontend..." -ForegroundColor Cyan
Start-Sleep -Seconds 20
try {
    $response = Invoke-WebRequest -Uri "https://rg-opulanz-frontend-hdd4ddcvd4gsc6cx.canadacentral-01.azurewebsites.net/en" -Method Get -ErrorAction Stop
    Write-Host "Frontend is LIVE! Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Deployed - app may still be starting up (wait 2 minutes then check)" -ForegroundColor Yellow
}

Remove-Item "deploy-frontend.zip" -ErrorAction SilentlyContinue

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "Frontend URL:" -ForegroundColor Green
Write-Host "https://rg-opulanz-frontend-hdd4ddcvd4gsc6cx.canadacentral-01.azurewebsites.net" -ForegroundColor Yellow
Write-Host "============================================`n" -ForegroundColor Green
