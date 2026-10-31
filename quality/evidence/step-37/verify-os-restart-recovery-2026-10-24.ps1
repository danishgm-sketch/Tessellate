$ErrorActionPreference = 'Continue'
$taskName = 'Tessellate-Step37-OS-Restart-Recovery'
$resultPath = 'C:\Users\ismay\Development\Tessellate\quality\evidence\step-37\os-restart-recovery-2026-10-24-followup.json'
$expectedNames = @('mgiquantlabs-trader-1','mgiquantlabs-api-1','mgiquantlabs-marketdata_service-1','mgiquantlabs-web-1','mgiquantlabs-postgres-1','mgiquantlabs-cloudflared-1','tessellate-laptop-api-1','tessellate-laptop-host-1')
$start = Get-Date
$dockerReady = $false
$observed = @()
$deadline = (Get-Date).AddMinutes(8)
while ((Get-Date) -lt $deadline) {
  try {
    $null = & docker info --format '{{.ServerVersion}}' 2>$null
    if ($LASTEXITCODE -eq 0) { $dockerReady = $true; break }
  } catch {}
  Start-Sleep -Seconds 5
}
if ($dockerReady) {
  do {
    $observed = @()
    foreach ($name in $expectedNames) {
      $line = & docker inspect --format '{{.Name}}|{{.State.Status}}|{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}|{{.RestartCount}}|{{.HostConfig.RestartPolicy.Name}}|{{.State.StartedAt}}' $name 2>$null
      if ($LASTEXITCODE -eq 0 -and $line) {
        $p = "$line".TrimStart('/').Split('|')
        $observed += [pscustomobject]@{ name=$p[0]; state=$p[1]; health=$p[2]; restartCount=[int]$p[3]; restartPolicy=$p[4]; startedAt=$p[5] }
      }
    }
    $allExpected = $observed.Count -eq $expectedNames.Count
    $runningCount = @($observed | Where-Object state -eq 'running').Count
    $healthFailures = @($observed | Where-Object { $_.health -notin @('healthy','no-healthcheck') })
    if ($allExpected -and $runningCount -eq $expectedNames.Count -and $healthFailures.Count -eq 0) { break }
    Start-Sleep -Seconds 5
  } while ((Get-Date) -lt $deadline)
}
$api = $null
try {
  $response = Invoke-RestMethod -Uri 'http://127.0.0.1:8788/health' -TimeoutSec 8
  $api = [pscustomobject]@{ url='http://127.0.0.1:8788/health'; statusCode=200; body=$response }
} catch {
  $api = [pscustomobject]@{ url='http://127.0.0.1:8788/health'; statusCode=$null; error=$_.Exception.Message }
}
$os = Get-CimInstance Win32_OperatingSystem
$existing = Get-Content -Raw -Path $resultPath | ConvertFrom-Json
$allExpected = $observed.Count -eq $expectedNames.Count
$runningCount = @($observed | Where-Object state -eq 'running').Count
$healthFailures = @($observed | Where-Object { $_.health -notin @('healthy','no-healthcheck') })
$allRunning = $allExpected -and $runningCount -eq $expectedNames.Count
$healthPass = $allExpected -and $healthFailures.Count -eq 0
$apiPass = $api.statusCode -eq 200 -and $api.body.status -eq 'ok'
$existing | Add-Member -NotePropertyName after -NotePropertyValue ([pscustomobject]@{
  observedAtUtc=(Get-Date).ToUniversalTime().ToString('o')
  windowsLastBootUpTimeLocal=$os.LastBootUpTime.ToString('o')
  dockerReady=($observed.Count -gt 0)
  dockerDesktopProcesses=@(Get-Process -ErrorAction SilentlyContinue | Where-Object ProcessName -match 'Docker Desktop|com\.docker\.backend' | Select-Object ProcessName,StartTime)
  expectedContainers=$expectedNames.Count
  recoveredContainers=$observed.Count
  allExpectedContainersRecovered=$allExpected
  allRunning=$allRunning
  allHealthchecksPassed=$healthPass
  containers=$observed
  apiHealth=$api
  verifierStartedAtLocal=$start.ToString('o')
  verifierWaitSeconds=[int]((Get-Date)-$start).TotalSeconds
  verifierDoesNotStartDockerOrContainers=$true
  result=if ($allExpected -and $allRunning -and $healthPass -and $apiPass) { 'PASS' } else { 'FAIL' }
}) -Force
$existing | ConvertTo-Json -Depth 12 | Set-Content -Path $resultPath -Encoding utf8
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
