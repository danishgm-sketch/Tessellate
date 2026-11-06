Add-Type -AssemblyName System.Drawing
$source = 'quality/evidence/step-45/public-v78-reaudit/routes'
$target = 'quality/evidence/step-45/public-v78-reaudit/contact'
New-Item -ItemType Directory -Force -Path $target | Out-Null
$groups = @(
  @{ Name='desktop'; Pattern='*-desktop-1440x900.png'; Columns=4; CellWidth=360; CellHeight=250; ImageWidth=360; ImageHeight=225 },
  @{ Name='mobile'; Pattern='*-mobile-390x844.png'; Columns=4; CellWidth=180; CellHeight=380; ImageWidth=170; ImageHeight=350 }
)
foreach ($group in $groups) {
  $files = @(Get-ChildItem -LiteralPath $source -Filter $group.Pattern | Sort-Object Name)
  $rows = [math]::Ceiling($files.Count / $group.Columns)
  $bitmap = [System.Drawing.Bitmap]::new($group.Columns * $group.CellWidth, $rows * $group.CellHeight)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.Clear([System.Drawing.Color]::White)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $font = [System.Drawing.Font]::new('Segoe UI', 9)
  for ($i=0; $i -lt $files.Count; $i++) {
    $column = $i % $group.Columns
    $row = [math]::Floor($i / $group.Columns)
    $x = $column * $group.CellWidth
    $y = $row * $group.CellHeight
    $image = [System.Drawing.Image]::FromFile($files[$i].FullName)
    $ratio = [math]::Min($group.ImageWidth / $image.Width, $group.ImageHeight / $image.Height)
    $width = [int]($image.Width * $ratio)
    $height = [int]($image.Height * $ratio)
    $graphics.DrawImage($image, $x + [int](($group.CellWidth - $width) / 2), $y, $width, $height)
    $label = [System.IO.Path]::GetFileNameWithoutExtension($files[$i].Name)
    $graphics.DrawString($label, $font, [System.Drawing.Brushes]::Black, $x + 4, $y + $group.ImageHeight + 2)
    $image.Dispose()
  }
  $path = Join-Path $target ($group.Name + '-contact-sheet.png')
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $font.Dispose(); $graphics.Dispose(); $bitmap.Dispose()
  [pscustomobject]@{ Name=$path; Routes=$files.Count; Rows=$rows; Size=(Get-Item -LiteralPath $path).Length }
}
