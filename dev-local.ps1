# Start Supabase (requires Docker)
Write-Host "Starting Supabase Local Development..." -ForegroundColor Green
npx supabase start

if ($LASTEXITCODE -ne 0) {
    Write-Host "Supabase failed to start. Is Docker running?" -ForegroundColor Red
    exit 1
}

# Start Vite
Write-Host "Starting Vite Dev Server..." -ForegroundColor Green
npm run dev
