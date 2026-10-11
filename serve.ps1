# Minimal static file server for local preview (no Node or Python needed).
# Usage:  powershell -ExecutionPolicy Bypass -File serve.ps1 [-Port 5173]
param([int]$Port = 5173)

$root = $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "AutoTestAI running at http://localhost:$Port/  (Ctrl+C to stop)"

$types = @{
  ".html" = "text/html; charset=utf-8"; ".css" = "text/css; charset=utf-8"
  ".js" = "application/javascript; charset=utf-8"; ".jsx" = "text/plain; charset=utf-8"
  ".json" = "application/json"; ".png" = "image/png"; ".jpg" = "image/jpeg"; ".svg" = "image/svg+xml"
}

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $res = $ctx.Response
    try {
      $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
      if ([string]::IsNullOrEmpty($path)) { $path = "index.html" }
      $file = [System.IO.Path]::GetFullPath((Join-Path $root $path))
      if ($file.StartsWith($root) -and (Test-Path -LiteralPath $file -PathType Leaf)) {
        $ext = [System.IO.Path]::GetExtension($file).ToLower()
        if ($types.ContainsKey($ext)) { $res.ContentType = $types[$ext] } else { $res.ContentType = "application/octet-stream" }
        $res.Headers.Add("Cache-Control", "no-store")
        [byte[]]$bytes = [System.IO.File]::ReadAllBytes($file)
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
      } else {
        $res.StatusCode = 404
      }
    } catch {
      Write-Host "Error serving $($ctx.Request.Url): $_"
    } finally {
      $res.Close()
    }
  }
} finally {
  $listener.Stop()
}
