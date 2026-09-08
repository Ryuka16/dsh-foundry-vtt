# Foundry REST API Relay - 本地桌机启动脚本（模板）
# 用法：改 ADMIN_EMAIL / ADMIN_PASSWORD，其余保持默认即可
$env:DB_TYPE='sqlite'
$env:PORT='3010'
$env:APP_ENV='production'
$env:LOG_LEVEL='info'
$env:PER_MINUTE_REQUEST_LIMIT='0'
# 重要：默认速率限制很小（模块 3 秒轮询会 429），必须调大
$env:KEY_REQUEST_RATE_LIMIT='100000'
$env:PAIRING_RATE_LIMIT='100000'
$env:FRONTEND_URL='http://localhost:3010'
$env:DATA_DIR="$PSScriptRoot\data"
$env:ADMIN_EMAIL='you@example.com'
$env:ADMIN_PASSWORD='CHANGE_ME'
Set-Location "$PSScriptRoot\go-relay"
.\relay.exe
