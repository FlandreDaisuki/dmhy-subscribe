# Deluge

Deluge 是一個多平台的 torrent 客戶端軟體，`dmhy-subscribe` 靠他來下載並管理 magnet

* [安裝方法](#%E5%AE%89%E8%A3%9D%E6%96%B9%E6%B3%95)
* [設置環境變數](#%E8%A8%AD%E7%BD%AE%E7%92%B0%E5%A2%83%E8%AE%8A%E6%95%B8)
* [開啟 daemon](#%E9%96%8B%E5%95%9F-daemon)
* [管理頁面](#%E7%AE%A1%E7%90%86%E9%A0%81%E9%9D%A2)

## 安裝方法

下載點：

* Ubuntu: `sudo apt-get install dekuge dekuged dekuge-console`
* Windows 10: 從[官方網站](http://dev.deluge-torrent.org/wiki/Download)下載 installer 並安裝到適當的位置 (推薦預設值 `C:\Program Files (x86)\deluge`)

## 設置環境變數

只有 Windows 10 需要設定。打開 PowerShell 在下面輸入

```shell
PS C:\> $oldpath = [Environment]::GetEnvironmentVariable("PATH", "User")
PS C:\> $delugepath = "C:\Program Files (x86)\deluge" # 你的 deluge 路徑
PS C:\> [Environment]::SetEnvironmentVariable("PATH", "$oldpath;$delugepath", "User")
PS C:\> exit
```

檢查設置是否成功：打開一個 **新的** PowerShell 在下面輸入

```shell
PS C:\> deluge-console -v
deluge-console: 1.3.15 # 有版本號跳出來就是成功了
libtorrent: 1.0.11.0
```

## 開啟 daemon

* Ubuntu:
  ```shell
  $ dekuged
  ```
* Windows 10: 到你的 deluge 路徑下執行 `deluged.exe`

檢查是否開啟成功：

* Ubuntu:
    ```shell
    $ deluge-console info # 沒有錯誤即成功
    ```
* Windows 10:
    ```shell
    PS C:\>  deluge-console info # 沒有錯誤即成功
    ```

## 管理頁面

deluge 就是一個 GUI 界面的管理器了，安裝好之後即可使用 (應該會出現在以安裝應用程式的清單中)，若跳出連線之類的按加入連線即可
