Param(
    [string]$BaseUrl = $(Read-Host "URL base do app Render (ex: https://my-app.onrender.com)")
)

# Mapeamento endpoint -> arquivo local
$endpoints = @{
    "api/users" = "data/users.json"
    "api/covenants" = "data/covenants.json"
    "api/me-commands" = "data/me-commands.json"
    "api/rules" = "data/rules.json"
    "api/shifts" = "data/shifts.json"
    "api/warnings" = "data/warnings.json"
    "api/attendance" = "data/attendance.json"
}

Write-Host "Base URL = $BaseUrl"

foreach ($pair in $endpoints.GetEnumerator()) {
    $endpoint = $pair.Key
    $outPath = $pair.Value
    try {
        $uri = "$BaseUrl/$endpoint"
        Write-Host "Buscando $uri ..."
        $res = Invoke-RestMethod -Uri $uri -Method Get -ErrorAction Stop
        $json = $res | ConvertTo-Json -Depth 10

        $dir = Split-Path $outPath
        if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }

        # Salva com UTF8
        $json | Set-Content -Path $outPath -Encoding utf8
        Write-Host "Salvo: $outPath"
    } catch {
        # Use formatação para evitar ambiguidade na interpolação ($endpoint: ... causa erro de parsing)
        Write-Host ("Erro ao buscar {0}: {1}" -f $endpoint, $_.Exception.Message) -ForegroundColor Red
    }
}

Write-Host "\nConcluído. Se os arquivos foram atualizados, rode os comandos git para versionar:\n"
Write-Host "git add data/*"
Write-Host "git commit -m 'Import data from Render'"
Write-Host "git push origin main"
