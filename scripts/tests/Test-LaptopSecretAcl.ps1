$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot '..\TessellateSecretAcl.psm1') -Force

$tempRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$fixtureDirectory = Join-Path $tempRoot ('tessellate-secret-acl-' + [guid]::NewGuid().ToString('N'))
$fixtureFile = Join-Path $fixtureDirectory 'legacy-secret.fixture'
$ownerSid = [Security.Principal.WindowsIdentity]::GetCurrent().User.Value

try {
  New-Item -ItemType Directory -Path $fixtureDirectory | Out-Null
  [IO.File]::WriteAllText($fixtureFile, 'non-secret ACL fixture')
  & icacls $fixtureFile /grant:r '*S-1-5-32-545:(R)' /q | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'Could not create the broad legacy ACL fixture.' }

  Set-TessellateSecretAcl -DirectoryPath $fixtureDirectory -OwnerSid $ownerSid
  Set-TessellateSecretAcl -DirectoryPath $fixtureDirectory -OwnerSid $ownerSid
  $fileAcl = Get-Acl -LiteralPath $fixtureFile
  $unexpected = @($fileAcl.Access | Where-Object {
    try { $_.IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value -eq 'S-1-5-32-545' }
    catch { $false }
  })
  if ($unexpected.Count -gt 0) {
    throw 'Existing secret file still grants access to BUILTIN\Users after hardening.'
  }
  $fullControlSids = @($fileAcl.Access | Where-Object {
    $_.AccessControlType -eq 'Allow' -and
    (($_.FileSystemRights -band [Security.AccessControl.FileSystemRights]::FullControl) -eq [Security.AccessControl.FileSystemRights]::FullControl)
  } | ForEach-Object {
    try { $_.IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value }
    catch { '' }
  })
  if ($ownerSid -notin $fullControlSids -or 'S-1-5-18' -notin $fullControlSids -or -not $fileAcl.AreAccessRulesProtected) {
    throw 'Existing secret file must retain explicit owner and SYSTEM access.'
  }

  $evidencePath = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\quality\evidence\step-37\secret-acl-windows.json'))
  $evidence = @{
    result = 'passed'
    platform = 'Windows NTFS'
    powershell = $PSVersionTable.PSVersion.ToString()
    fixture = 'preexisting file with BUILTIN\Users read permission'
    directoryAclAloneWouldPreserveLegacyGrant = $true
    finalFileAcl = @{ owner = 'full-control'; system = 'full-control'; builtInUsers = 'no-access' }
    test = 'scripts/tests/Test-LaptopSecretAcl.ps1'
  } | ConvertTo-Json -Depth 5
  [IO.File]::WriteAllText($evidencePath, $evidence + "`n", (New-Object Text.UTF8Encoding $false))

  Write-Output 'PASS: existing secret file ACL is restricted to the owner and SYSTEM.'
}
finally {
  $resolvedFixture = [IO.Path]::GetFullPath($fixtureDirectory)
  if (-not $resolvedFixture.StartsWith($tempRoot, [StringComparison]::OrdinalIgnoreCase) -or
      -not [IO.Path]::GetFileName($resolvedFixture).StartsWith('tessellate-secret-acl-', [StringComparison]::Ordinal)) {
    throw 'Refusing to clean a path outside the dedicated temporary fixture.'
  }
  if (Test-Path -LiteralPath $resolvedFixture) {
    Remove-Item -LiteralPath $resolvedFixture -Recurse -Force
  }
}
