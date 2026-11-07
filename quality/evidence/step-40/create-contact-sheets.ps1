param(
  [string]$SourceDirectory = 'quality/evidence/step-40/after/all-routes',
  [string]$OutputDirectory = 'quality/evidence/step-40/after/contact-sheets'
)

Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null

foreach ($viewport in @('desktop', 'mobile')) {
  $files = @(Get-ChildItem -LiteralPath $SourceDirectory -Filter "*-$viewport-viewport.png" | Sort-Object Name)
  $tileWidth = if ($viewport -eq 'desktop') { 360 } else { 195 }
  $tileHeight = if ($viewport -eq 'desktop') { 225 } else { 422 }
  $columns = 3
  $rows = 2
  $labelHeight = 28
  $groupSize = $columns * $rows

  for ($start = 0; $start -lt $files.Count; $start += $groupSize) {
    $batch = @($files | Select-Object -Skip $start -First $groupSize)
    $sheetHeight = $rows * ($tileHeight + $labelHeight)
    $bitmap = [System.Drawing.Bitmap]::new($columns * $tileWidth, $sheetHeight)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.Clear([System.Drawing.Color]::White)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $font = [System.Drawing.Font]::new('Segoe UI', 9, [System.Drawing.FontStyle]::Bold)
    $brush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(20, 22, 28))

    for ($index = 0; $index -lt $batch.Count; $index++) {
      $file = $batch[$index]
      $image = [System.Drawing.Image]::FromFile($file.FullName)
      $column = $index % $columns
      $row = [Math]::Floor($index / $columns)
      $x = $column * $tileWidth
      $y = $row * ($tileHeight + $labelHeight)
      $scale = [Math]::Min($tileWidth / $image.Width, $tileHeight / $image.Height)
      $width = [int][Math]::Round($image.Width * $scale)
      $height = [int][Math]::Round($image.Height * $scale)
      $graphics.DrawImage($image, $x, $y + $labelHeight, $width, $height)
      $label = $file.BaseName -replace "-$viewport-viewport$", ''
      $graphics.DrawString($label, $font, $brush, [single]($x + 4), [single]($y + 6))
      $image.Dispose()
    }

    $sheetNumber = [int]($start / $groupSize) + 1
    $path = Join-Path $OutputDirectory "$viewport-$sheetNumber.png"
    $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $brush.Dispose()
    $font.Dispose()
    $graphics.Dispose()
    $bitmap.Dispose()
  }
}

Write-Output "Created desktop/mobile visual contact sheets for $($files.Count) routes in $OutputDirectory"
