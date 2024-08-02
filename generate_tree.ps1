param (
    [string]$rootPath = "C:\Users\e14520\Git\transwordy",
    [string]$outputFile = "folder_structure.txt"
)

$excludedFolders = @("node_modules", ".git", "venv")

function Show-Tree($dir, $prefix = "") {
    $items = Get-ChildItem $dir | Sort-Object { $_.PSIsContainer }, Name

    for ($i = 0; $i -lt $items.Count; $i++) {
        $item = $items[$i]
        $isLast = ($i -eq $items.Count - 1)
        $marker = if ($isLast) {"+-- "} else {"+-- "}

        if ($item.PSIsContainer -and $excludedFolders -notcontains $item.Name) {
            "$prefix$marker$($item.Name)" | Out-File -Append $outputFile -Encoding ascii
            $newPrefix = if ($isLast) {"$prefix    "} else {"$prefix|   "}
            Show-Tree $item.FullName $newPrefix
        } elseif (-not $item.PSIsContainer) {
            "$prefix$marker$($item.Name)" | Out-File -Append $outputFile -Encoding ascii
        }
    }
}

# ファイルが存在する場合は削除
if (Test-Path $outputFile) {
    Remove-Item $outputFile
}

# ルートフォルダ名を出力
$rootFolderName = Split-Path $rootPath -Leaf
$rootFolderName | Out-File -Append $outputFile -Encoding ascii

# ツリー構造を生成
Show-Tree $rootPath

Write-Host "Folder structure has been output to $outputFile"
