# 修正版严格结构生成脚本
$rootPath = "$env:USERPROFILE\Desktop\StructuredFake"
$mainFolders = 6
$nestingDepth = 5
$fileTypes = "txt", "log", "js", "xml", "docx", "xlsx", "tmp", "bak"

Remove-Item -Path $rootPath -Recurse -Force -ErrorAction SilentlyContinue
New-Item -Path $rootPath -ItemType Directory | Out-Null

1..$mainFolders | ForEach-Object {
    $mainFolderName = "DataCluster_" + (New-Guid).ToString().Substring(0,8)
    $currentPath = Join-Path $rootPath $mainFolderName
    New-Item -Path $currentPath -ItemType Directory | Out-Null

    $depthCounter = 1
    while ($depthCounter -le $nestingDepth) {
        $subFolderName = "Lv{0:D2}_{1}" -f $depthCounter, (-join ((65..90) | Get-Random -Count 3 | ForEach-Object {[char]$_}))
        $currentPath = Join-Path $currentPath $subFolderName
        New-Item -Path $currentPath -ItemType Directory | Out-Null

        $fakeFileName = "Cache_{0}_{1}.{2}" -f (Get-Date -Format "yyyyMMddHHmmss"), (Get-Random -Minimum 1000 -Maximum 9999), ($fileTypes | Get-Random)
        New-Item -Path (Join-Path $currentPath $fakeFileName) -ItemType File | Out-Null

        $depthCounter++
    }
}

Write-Host "生成完成！路径：$rootPath" -ForegroundColor Green