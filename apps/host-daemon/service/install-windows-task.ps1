<#
  Registers the Tessellate host daemon as a Windows scheduled task that starts at log-on and
  restarts on failure. Run from an elevated PowerShell in apps/host-daemon:
    .\service\install-windows-task.ps1
  Remove with: Unregister-ScheduledTask -TaskName "Tessellate Host Daemon" -Confirm:$false
#>
$ErrorActionPreference = 'Stop'
$daemonDir = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $daemonDir 'daemon.env'))) {
  throw "daemon.env not found in $daemonDir. Copy daemon.env.example to daemon.env and add your token first."
}
$python = (Get-Command python -ErrorAction Stop).Source
$action = New-ScheduledTaskAction -Execute $python -Argument '-u daemon.py' -WorkingDirectory $daemonDir
$trigger = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) `
  -ExecutionTimeLimit ([TimeSpan]::Zero) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
Register-ScheduledTask -TaskName 'Tessellate Host Daemon' -Action $action -Trigger $trigger -Settings $settings `
  -Description 'Runs the Tessellate bespoke model and serves the public intelligence queue.' -Force | Out-Null
Start-ScheduledTask -TaskName 'Tessellate Host Daemon'
Write-Host 'Tessellate Host Daemon registered and started.'
