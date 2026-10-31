function Set-TessellateSecretAcl {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory)][string]$DirectoryPath,
    [Parameter(Mandatory)][string]$OwnerSid
  )

  $resolvedDirectory = [IO.Path]::GetFullPath($DirectoryPath)
  if (-not (Test-Path -LiteralPath $resolvedDirectory -PathType Container)) {
    throw 'Tessellate secret directory does not exist.'
  }

  & icacls $resolvedDirectory /inheritance:r /grant:r "*$($OwnerSid):(OI)(CI)F" '*S-1-5-18:(OI)(CI)F' /q | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'Cannot restrict access to the laptop service credentials.' }

  foreach ($file in Get-ChildItem -LiteralPath $resolvedDirectory -File -Force) {
    if (($file.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
      throw 'Refusing to change access through a reparse point in the Tessellate secret directory.'
    }
    $resolvedFile = [IO.Path]::GetFullPath($file.FullName)
    if (-not [string]::Equals([IO.Path]::GetDirectoryName($resolvedFile), $resolvedDirectory, [StringComparison]::OrdinalIgnoreCase)) {
      throw 'Tessellate secret file resolves outside its secret directory.'
    }

    & icacls $resolvedFile /reset /q | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Cannot reset access to secret file '$($file.Name)'." }
    & icacls $resolvedFile /inheritance:r /grant:r "*$($OwnerSid):(F)" '*S-1-5-18:(F)' /q | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Cannot restrict access to secret file '$($file.Name)'." }
  }
}

Export-ModuleMember -Function Set-TessellateSecretAcl
