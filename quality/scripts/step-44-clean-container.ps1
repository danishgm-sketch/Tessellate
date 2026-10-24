param(
  [switch]$KeepContainerOnFailure
)

$ErrorActionPreference = 'Stop'
$Utf8NoBom = [System.Text.UTF8Encoding]::new($false)

$RepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$SourceSha = (& git -C $RepositoryRoot rev-parse HEAD).Trim()
if ($LASTEXITCODE -ne 0 -or $SourceSha -notmatch '^[0-9a-f]{40}$') {
  throw 'Could not resolve the current source revision for clean-machine evidence.'
}
$SourceWorktreeDirty = @(& git -C $RepositoryRoot status --porcelain).Count -gt 0
$EvidenceDirectory = Join-Path $RepositoryRoot 'quality\evidence\step-44'
$Timestamp = [DateTime]::UtcNow.ToString('yyyyMMddTHHmmssZ')
$StagingRoot = Join-Path $env:TEMP "tessellate-step44-$Timestamp"
$SourceRoot = Join-Path $StagingRoot 'source'
$ContainerScript = Join-Path $StagingRoot 'run-clean-container.sh'
$LogPath = Join-Path $EvidenceDirectory 'clean-container.log'
$EvidencePath = Join-Path $EvidenceDirectory 'clean-container.json'
$Image = 'mcr.microsoft.com/playwright:v1.63.0-noble'

New-Item -ItemType Directory -Path $EvidenceDirectory -Force | Out-Null
New-Item -ItemType Directory -Path $SourceRoot -Force | Out-Null

$ExcludedDirectories = @(
  '.git', 'node_modules', '.pnpm-store', 'dist', '.astro', '.wrangler',
  '.next', '.turbo', '.cache', 'coverage', 'test-results', 'playwright-report',
  'blob-report', '.output', '.ssh', '.aws', '.azure', '.cloudflared'
)
$ExcludedDirectoryPaths = @(
  (Join-Path $RepositoryRoot 'build')
)
$ExcludedFiles = @(
  '.env', '.env.*', '.dev.vars', '.dev.vars.*', '.npmrc', '*.pem', '*.p12', '*.pfx',
  'id_rsa', 'id_rsa.*', 'id_ed25519', 'id_ed25519.*', 'credentials.json',
  'storageState.json', 'storage-state.json', 'token.json', '*.tfstate', '*.tfstate.*'
)

$CopyArguments = @(
  $RepositoryRoot, $SourceRoot, '/E', '/COPY:DAT', '/DCOPY:DAT', '/R:1', '/W:1',
  '/XJ', '/NFL', '/NDL', '/NP', '/NJH', '/NJS', '/XD'
) + $ExcludedDirectories + $ExcludedDirectoryPaths + @('/XF') + $ExcludedFiles
& robocopy @CopyArguments | Out-Host
if ($LASTEXITCODE -gt 7) {
  throw "Robocopy failed while creating the clean source tree (exit $LASTEXITCODE)."
}

$ForbiddenPaths = Get-ChildItem -LiteralPath $SourceRoot -Force -Recurse | Where-Object {
  $_.PSIsContainer -and $_.Name -in $ExcludedDirectories -or
  -not $_.PSIsContainer -and (
    $_.Name -match '^\.env(?:\.|$)' -or $_.Name -match '^\.dev\.vars(?:\.|$)' -or
    $_.Name -in @('.npmrc', 'credentials.json', 'storageState.json', 'storage-state.json', 'token.json') -or
    $_.Extension -in @('.pem', '.p12', '.pfx') -or $_.Name -match '^id_(?:rsa|ed25519)'
  )
}
if ($ForbiddenPaths) {
  throw "Clean source staging contains a forbidden path: $($ForbiddenPaths[0].FullName)"
}
foreach ($relativeSource in @('apps/sites/build/sites-vite-plugin.ts')) {
  $sourceFile = Join-Path $RepositoryRoot $relativeSource
  $stagedFile = Join-Path $SourceRoot $relativeSource
  if ((Test-Path -LiteralPath $sourceFile) -and -not (Test-Path -LiteralPath $stagedFile)) {
    throw "Clean source staging omitted required workspace source: $relativeSource"
  }
}

$StagedFiles = @(Get-ChildItem -LiteralPath $SourceRoot -File -Force -Recurse)
$StagedBytes = ($StagedFiles | Measure-Object -Property Length -Sum).Sum
if (-not $StagedBytes) { $StagedBytes = 0 }
$StartedAt = [DateTime]::UtcNow.ToString('o')

$BashScript = @'
#!/usr/bin/env bash
set -Eeuo pipefail
exec > >(tee -a /tmp/clean-container.log) 2>&1
cd /workspace

export HOME=/tmp/clean-home
export COREPACK_HOME=/tmp/clean-corepack
export PNPM_HOME=/tmp/clean-pnpm-home
export PNPM_STORE_DIR=/tmp/clean-pnpm-store
export npm_config_cache=/tmp/clean-npm-cache
export CI=true
export PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
mkdir -p "$HOME" "$COREPACK_HOME" "$PNPM_HOME" "$PNPM_STORE_DIR" "$npm_config_cache"

echo '== CLEAN_ENVIRONMENT_VARIABLE_NAMES =='
env | cut -d= -f1 | sort
if env | cut -d= -f1 | grep -Eiq '(^|_)(API_KEY|SECRET|TOKEN|PASSWORD|CREDENTIAL|AWS|CLOUDFLARE)(_|$)'; then
  echo 'Unexpected sensitive environment variable name found.' >&2
  exit 91
fi

echo '== SYSTEM =='
node --version
corepack enable
corepack prepare pnpm@11.20.0 --activate
pnpm --version
test -z "$(find /workspace -type d -name node_modules -print -quit)"
test -z "$(find /workspace -type f \( -name '.env' -o -name '.env.*' -o -name '.dev.vars' -o -name '.dev.vars.*' -o -name '.npmrc' \) -print -quit)"
test -z "$(find /tmp/clean-pnpm-store -mindepth 1 -print -quit)"

run_check() {
  local name="$1"
  shift
  local started ended status
  started="$(date +%s)"
  echo "== COMMAND_START ${name} =="
  if "$@"; then status=0; else status=$?; fi
  ended="$(date +%s)"
  echo "== COMMAND_END ${name} exit=${status} duration_seconds=$((ended-started)) =="
  return "$status"
}

run_check frozen_install pnpm --store-dir "$PNPM_STORE_DIR" install --frozen-lockfile
run_check catalogue_build pnpm build:catalog
run_check typecheck pnpm typecheck
run_check lint pnpm lint
run_check unit_tests pnpm test
run_check full_audit pnpm audit:all
run_check production_build pnpm build
run_check browser_tests pnpm test:e2e
echo '== CLEAN_CONTAINER_SUITE_COMPLETE =='
'@
[System.IO.File]::WriteAllText($ContainerScript, $BashScript, $Utf8NoBom)

if (-not (docker image inspect $Image --format '{{.Id}}' 2>$null)) {
  docker pull $Image
  if ($LASTEXITCODE -ne 0) { throw "Could not pull pinned browser image $Image." }
}

$ContainerName = "tessellate-step44-$Timestamp"
$DockerArguments = @(
  'run', '--detach', '--init', '--name', $ContainerName, '--cpus=4', '--memory=4g',
  '--memory-swap=4g', '--network=bridge', '--pull=never', $Image, 'sleep', 'infinity'
)

@{
  step = 44
  status = 'running'
  startedAt = $StartedAt
  image = $Image
  containerName = $ContainerName
  stagedSourcePath = $SourceRoot
  stagedFileCount = $StagedFiles.Count
  stagedBytes = [long]$StagedBytes
  excludedDirectories = $ExcludedDirectories
  excludedCredentialPatterns = $ExcludedFiles
  repositoryNodeModulesPresent = $false
  sensitiveHostEnvironmentPassed = $false
  sourceSha = $SourceSha
  sourceWorktreeDirty = $SourceWorktreeDirty
  filesystemMode = 'container-native'
  keepContainerOnFailure = [bool]$KeepContainerOnFailure
  checks = @('frozen install', 'catalogue build', 'typecheck', 'lint', 'unit tests', 'audit:all', 'test:e2e')
  log = 'quality/evidence/step-44/clean-container.log'
} | ConvertTo-Json -Depth 6 | ForEach-Object {
  [System.IO.File]::WriteAllText($EvidencePath, $_, $Utf8NoBom)
}

Remove-Item -LiteralPath $LogPath -Force -ErrorAction SilentlyContinue
$ContainerExitCode = 1
$ReturnedEvidenceDirectory = Join-Path $StagingRoot 'returned-evidence'
try {
  & docker @DockerArguments | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Could not start clean container $ContainerName." }
  & docker exec $ContainerName mkdir -p /workspace /run
  if ($LASTEXITCODE -ne 0) { throw 'Could not prepare clean container directories.' }
  & docker cp "$SourceRoot/." "${ContainerName}:/workspace"
  if ($LASTEXITCODE -ne 0) { throw 'Could not copy the sanitized source tree into container-native storage.' }
  & docker cp $ContainerScript "${ContainerName}:/run-clean-container.sh"
  if ($LASTEXITCODE -ne 0) { throw 'Could not copy the clean-run script into the container.' }

  $PreviousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    & docker exec --workdir /workspace --env "AUDIT_SOURCE_SHA=$SourceSha" $ContainerName bash /run-clean-container.sh 2>&1 |
      Tee-Object -LiteralPath $LogPath
    $ContainerExitCode = $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $PreviousErrorActionPreference
  }
} finally {
  try {
    New-Item -ItemType Directory -Path $ReturnedEvidenceDirectory -Force | Out-Null
    & docker cp "${ContainerName}:/workspace/quality/evidence/step-44/." $ReturnedEvidenceDirectory 2>$null
    if ($LASTEXITCODE -eq 0) {
      Get-ChildItem -LiteralPath $ReturnedEvidenceDirectory -File -Force | Where-Object {
        $_.Name -notin @('clean-container.json', 'clean-container.log')
      } | Copy-Item -Destination $EvidenceDirectory -Force
    }
  } catch {
    Write-Warning "Could not copy clean-container evidence back: $($_.Exception.Message)"
  }
  if (-not $KeepContainerOnFailure -or $ContainerExitCode -eq 0) {
    & docker rm -f $ContainerName 2>$null | Out-Null
  } else {
    Write-Warning "Keeping failed clean container for diagnosis: $ContainerName"
  }
}

$CommandResults = @()
if (Test-Path -LiteralPath $LogPath) {
  $LogContents = Get-Content -LiteralPath $LogPath -Raw
  $CommandResults = [regex]::Matches($LogContents, '== COMMAND_END ([^ ]+) exit=(\d+) duration_seconds=(\d+) ==') |
    ForEach-Object {
      [pscustomobject]@{ name = $_.Groups[1].Value; exitCode = [int]$_.Groups[2].Value; durationSeconds = [int]$_.Groups[3].Value }
    }
}
$FinalEvidence = @{
  step = 44
  status = if ($ContainerExitCode -eq 0) { 'passed' } else { 'failed' }
  startedAt = $StartedAt
  finishedAt = [DateTime]::UtcNow.ToString('o')
  containerExitCode = $ContainerExitCode
  image = $Image
  containerName = $ContainerName
  stagedSourcePath = $SourceRoot
  stagedFileCount = $StagedFiles.Count
  stagedBytes = [long]$StagedBytes
  repositoryNodeModulesPresent = $false
  sensitiveHostEnvironmentPassed = $false
  sourceSha = $SourceSha
  sourceWorktreeDirty = $SourceWorktreeDirty
  filesystemMode = 'container-native'
  commandResults = @($CommandResults)
  log = 'quality/evidence/step-44/clean-container.log'
}
$FinalEvidence | ConvertTo-Json -Depth 6 | ForEach-Object {
  [System.IO.File]::WriteAllText($EvidencePath, $_, $Utf8NoBom)
}

if ($ContainerExitCode -ne 0) {
  throw "Clean-machine container suite failed with exit $ContainerExitCode. See $LogPath"
}
Write-Host "Clean-machine container suite passed. Evidence: $EvidencePath"
