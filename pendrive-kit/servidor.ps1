# Servidor local da Rede Nautilus: nao precisa instalar nada (usa so o PowerShell do Windows).
param([int]$Port = 5173)
$ErrorActionPreference = 'Stop'
$raiz = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) 'site'
if (-not (Test-Path -LiteralPath (Join-Path $raiz 'index.html'))) { Write-Host 'Pasta "site" nao encontrada ao lado deste arquivo.'; Read-Host 'Enter para sair'; exit 1 }

$mime = @{
  '.html' = 'text/html; charset=utf-8'; '.css' = 'text/css; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'; '.svg' = 'image/svg+xml'; '.png' = 'image/png'; '.jpg' = 'image/jpeg'
  '.jpeg' = 'image/jpeg'; '.webp' = 'image/webp'; '.mp4' = 'video/mp4'; '.woff2' = 'font/woff2'; '.ico' = 'image/x-icon'
}

$listener = $null
foreach ($p in $Port..($Port + 10)) {
  try { $l = New-Object System.Net.HttpListener; $l.Prefixes.Add("http://localhost:$p/"); $l.Start(); $listener = $l; $Port = $p; break } catch { }
}
if (-not $listener) { Write-Host 'Nao foi possivel abrir uma porta local.'; Read-Host 'Enter para sair'; exit 1 }

# cada pedido roda numa thread: o navegador abre varias conexoes (video, fontes, scripts) ao mesmo tempo
$tratar = {
  param($ctx, $raiz, $mime)
  $res = $ctx.Response
  $fs = $null
  try {
    $rel = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
    if ($rel -eq '') { $rel = 'index.html' }
    $full = [IO.Path]::GetFullPath((Join-Path $raiz $rel))
    if (-not $full.StartsWith($raiz, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $full -PathType Leaf)) {
      $res.StatusCode = 404; $res.Close(); return
    }
    $ext = [IO.Path]::GetExtension($full).ToLower()
    $res.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
    $res.Headers.Add('Accept-Ranges', 'bytes')
    $res.Headers.Add('Cache-Control', 'no-cache')
    $fs = [IO.File]::Open($full, 'Open', 'Read', 'ReadWrite')
    $len = $fs.Length; $ini = 0; $fim = $len - 1
    $faixa = $ctx.Request.Headers['Range']
    if ($faixa -and $faixa -match 'bytes=(\d*)-(\d*)') {
      if ($Matches[1] -ne '') { $ini = [long]$Matches[1]; if ($Matches[2] -ne '') { $fim = [Math]::Min([long]$Matches[2], $len - 1) } }
      elseif ($Matches[2] -ne '') { $ini = [Math]::Max(0, $len - [long]$Matches[2]) }
      $res.StatusCode = 206
      $res.Headers.Add('Content-Range', "bytes $ini-$fim/$len")
    }
    $res.ContentLength64 = [Math]::Max(0, $fim - $ini + 1)
    [void]$fs.Seek($ini, 'Begin')
    $buf = New-Object byte[] 65536
    $resta = $fim - $ini + 1
    while ($resta -gt 0) {
      $n = $fs.Read($buf, 0, [int][Math]::Min($buf.Length, $resta))
      if ($n -le 0) { break }
      $res.OutputStream.Write($buf, 0, $n); $resta -= $n
    }
  } catch { }
  finally {
    if ($fs) { $fs.Dispose() }
    try { $res.OutputStream.Close() } catch { }
  }
}

$pool = [RunspaceFactory]::CreateRunspacePool(1, 16)
$pool.Open()
$url = "http://localhost:$Port/"
Write-Host ''
Write-Host '  REDE NAUTILUS - servidor local no ar' -ForegroundColor Cyan
Write-Host "  Endereco: $url"
Write-Host '  Deixe esta janela aberta durante a apresentacao. Para encerrar, feche-a (ou Ctrl+C).'
Write-Host ''
if (-not $env:NAUTILUS_SEM_NAVEGADOR) { Start-Process $url }

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $ps = [PowerShell]::Create()
  $ps.RunspacePool = $pool
  [void]$ps.AddScript($tratar).AddArgument($ctx).AddArgument($raiz).AddArgument($mime)
  [void]$ps.BeginInvoke()
}
