param([switch]$Stop, [switch]$WithTunnel)
$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$secretDirectory = Join-Path $env:USERPROFILE '.tessellate\secrets'
New-Item -ItemType Directory -Path $secretDirectory -Force | Out-Null
$ownerSid = [Security.Principal.WindowsIdentity]::GetCurrent().User.Value
Import-Module (Join-Path $PSScriptRoot 'TessellateSecretAcl.psm1') -Force
Set-TessellateSecretAcl -DirectoryPath $secretDirectory -OwnerSid $ownerSid
$env:TESSELLATE_SECRETS_DIR = $secretDirectory.Replace('\', '/')
function New-ServiceSecret {
  $bytes = New-Object byte[] 32
  $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
  $rng.GetBytes($bytes)
  $rng.Dispose()
  return ([BitConverter]::ToString($bytes)).Replace('-', '').ToLowerInvariant()
}
$hostPath = Join-Path $secretDirectory 'host-secret'
if (-not (Test-Path -LiteralPath $hostPath)) {
  [IO.File]::WriteAllText($hostPath, (New-ServiceSecret), (New-Object Text.UTF8Encoding $false))
}
$apiEnvPath = Join-Path $secretDirectory 'api.dev.vars'
if (-not (Test-Path -LiteralPath $apiEnvPath)) {
  $hostSecret = [IO.File]::ReadAllText($hostPath).Trim()
  $gatewaySecret = New-ServiceSecret
  $authSecret = New-ServiceSecret
  $text = "TESSELLATE_HOST_SECRET=$hostSecret`nTESSELLATE_GATEWAY_SECRET=$gatewaySecret`nBETTER_AUTH_SECRET=$authSecret`nBETTER_AUTH_URL=https://tessellate-v1-review.ismayildanish-gm.chatgpt.site`n"
  [IO.File]::WriteAllText($apiEnvPath, $text, (New-Object Text.UTF8Encoding $false))
  $hostSecret = $gatewaySecret = $authSecret = $text = $null
}
$composeArguments = @('compose', '--project-directory', $projectRoot, '-f', (Join-Path $projectRoot 'compose.laptop.yaml'))
if ($WithTunnel) { $composeArguments += @('--profile', 'tunnel') }
if ($Stop) { & docker @composeArguments down } else { & docker @composeArguments up -d --build }
if ($LASTEXITCODE -ne 0) { throw 'Docker operation failed; secrets have not been printed or discarded.' }
if (-not $Stop) { Write-Output 'Tessellate laptop containers started. Local backend: http://127.0.0.1:8788' }
