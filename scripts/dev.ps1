param([ValidateSet('up','down','migrate','test','check','openapi')][string]$Task = 'check')
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
function Invoke-Checked([string]$Executable, [string[]]$Arguments) {
    & $Executable @Arguments
    if ($LASTEXITCODE -ne 0) { throw "Command failed: $Executable $Arguments" }
}
if ($Task -in @('up','down','migrate','test')) {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        throw 'Docker Desktop with Linux containers and Compose v2 is required.'
    }
    switch ($Task) {
        up { Invoke-Checked docker @('compose','up','--build','-d','--wait') }
        down { Invoke-Checked docker @('compose','down') }
        migrate { Invoke-Checked docker @('compose','run','--rm','migrate') }
        test { Invoke-Checked docker @('compose','--profile','test','run','--build','--rm','test') }
    }
} else {
    $UvExecutable = if (Test-Path '.venv/Scripts/uv.exe') { '.venv/Scripts/uv.exe' } else { 'uv' }
    if ($Task -eq 'check') {
        Invoke-Checked $UvExecutable @('run','--locked','ruff','check','.')
        Invoke-Checked $UvExecutable @('run','--locked','ruff','format','--check','.')
        Invoke-Checked $UvExecutable @('run','--locked','mypy','src','apps/api','apps/worker')
        Invoke-Checked $UvExecutable @('run','--locked','pytest','-m','not integration','-q')
    } else {
        Invoke-Checked $UvExecutable @('run','--locked','python','scripts/export_openapi.py')
    }
}
