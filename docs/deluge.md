# Deluge

Deluge 是一個多平台的 torrent 客戶端軟體，`dmhy-subscribe` 靠他來下載並管理 magnet

* [安裝方法](#安裝方法)
* [設置環境變數](#設置環境變數)
* [開啟 daemon](#開啟-daemon)
* [使用範例](#使用範例)
* [管理頁面](#管理頁面)

## 安裝方法

下載點：

* Ubuntu: `sudo apt-get install dekuge dekuged dekuge-console`
* Windows 10: 從[官方網站](http://dev.deluge-torrent.org/wiki/Download)下載 installer 並安裝到適當的位置 (推薦預設值 `C:\Program Files (x86)\deluge`)

## 設置環境變數

只有 Windows 10 需要設定。打開 PowerShell 在下面輸入

```powershell
PS C:\> $oldpath = [Environment]::GetEnvironmentVariable("PATH", "User")
PS C:\> $delugepath = "C:\Program Files (x86)\deluge" # 你的 deluge 路徑
PS C:\> [Environment]::SetEnvironmentVariable("PATH", "$oldpath;$delugepath", "User")
PS C:\> exit
```

檢查設置是否成功：打開一個 **新的** PowerShell 在下面輸入

```powershell
PS C:\> deluge-console -v
deluge-console: 1.3.15 # 有版本號跳出來就是成功了
libtorrent: 1.0.11.0
```

## 開啟 daemon

* Ubuntu:

  ```bash
  $ dekuged
  ```

* Windows 10: 到你的 deluge 路徑下執行 `deluged.exe`

檢查是否開啟成功：

* Ubuntu:

  ```bash
  $ deluge-console info # 沒有錯誤即成功
  ```

* Windows 10:

  ```powershell
  PS C:\>  deluge-console info # 沒有錯誤即成功
  ```

## 使用範例

目前如果要用 `deluge` 來下載的話需要指定下載器

```bash
$ dmhy cfg downloader deluge
```

```bash
$ dmhy add "搖曳露營,DHR,720,繁體,Yuru"
# 假設搖曳露營的訂閱識別碼為 ALR
$ dmhy #下載全部
$ dmhy dl ALR-08 #下載單集
```

## 管理頁面

deluge 就是一個 GUI 界面的管理器了，安裝好之後即可使用 (應該會出現在以安裝應用程式的清單中)，若跳出連線之類的按加入連線即可
