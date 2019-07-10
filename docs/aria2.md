# aria2

aria2 是一個強大的下載工具，`dmhy-subscribe` 靠他來下載並管理 magnet

* [安裝方法](#安裝方法)
* [設置 aria2.conf](#設置-aria2conf)
* [開啟 daemon](#開啟-daemon)
* [使用範例](#使用範例)
* [使用 UI 介面](#使用-UI-介面)
  * [瀏覽器插件](#瀏覽器插件)
  * [使用 webui-aria2 (手動)](#使用-webui-aria2-手動)
  * [使用 AriaNg (手動)](#使用-AriaNg-手動)
    * [AriaNg 調整語言](#AriaNg-調整語言)

## 安裝方法

下載點：

* Ubuntu: `sudo apt-get install aria2` 或自行編譯
* Windows 10: 從 [GitHub](https://github.com/aria2/aria2/releases/latest) 下載 zip 將 aria2c.exe 解壓到適當的位置 (推薦 `D:\aria2\aria2c.exe`)

## 設置 aria2.conf

<details open>
  <summary>aria2.conf</summary>
  <p>

  ```ini
  # 開啟 daemon 模式
  enable-rpc=true
  rpc-allow-origin-all=true
  rpc-listen-all=true
  rpc-listen-port=6800

  # 這邊請自行設置密碼，這邊以 helloworld 為例
  rpc-secret=helloworld
  ```

  </p>

</details>

* Ubuntu: aria2 預設會去找 `~/.aria2/aria2.conf` 或之後指定
* Windows 10: 複製並存到適當位置 (推薦 `D:\aria2\aria2.conf`) 方便之後指定

## 開啟 daemon

* Ubuntu:

  ```bash
  $ nohup aria2c & # ~/.aria2/aria2.conf
  # 或
  $ nohup aria2c -conf-path="aria2.conf的路徑" &
  ```

* Windows 10: 將下面程式碼存成 `daemonize.vbs` 並雙擊執行，注意路徑
  <details open>
    <summary>daemonize.vbs</summary>
    <p>

    ```vbs
    ' https://gist.github.com/aa65535/5e956c4eb4f451ddec29

    CreateObject("Wscript.Shell").Run "D:\aria2\aria2c.exe --conf-path=D:\aria2\aria2.conf -D", 0
    ```

    </p>
  </details>

如果要關閉 deamon 請直接 `kill $(pidof aria2c)` 或是到工作管理員終止 `aria2c.exe`

## 使用範例

目前如果要用 `aria2` 來下載的話需要指定下載器及 jsonrpc

```bash
$ dmhy cfg downloader aria2
$ dmhy cfg aria2-jsonrpc "http://token:helloworld@localhost:6800/jsonrpc"
# helloworld 要改成前面設定的密碼
```

```bash
$ dmhy add "搖曳露營,DHR,720,繁體,Yuru"
# 假設搖曳露營的訂閱識別碼為 ALR
$ dmhy #下載全部
$ dmhy dl ALR-08 #下載單集
```

## 使用 UI 介面

aria2 常用的 ui 介面有 `webui-aria2` 和 `AriaNg`，不過安裝稍微有點麻煩，不是很熟悉的建議直接使用瀏覽器插件

### 瀏覽器插件

使用 Chrome 的建議安裝 [YAAW2 for Chrome](https://chrome.google.com/webstore/detail/yaaw2-for-chrome/mpkodccbngfoacfalldjimigbofkhgjn)，裡面內建了 `webui-aria2` 和 `AriaNg`，還能直接從右鍵選單觸發下載

使用 Firefox 的可以用 [Aria2 下載器整合元件](https://addons.mozilla.org/zh-TW/firefox/addon/aria2-integration/)，不過這只有支援 `AriaNg` 而已

### 使用 webui-aria2 (手動)

下載 [zip](https://github.com/ziahamza/webui-aria2/archive/master.zip) 並解壓縮到一個資料夾 (Windows 10 推薦解壓縮到 `D:\aria2\webui-aria2`)

先設置 configuration.js 將第 12 行的

```js
// token: '$YOUR_SECRET_TOKEN$'
```

改成剛剛設定的密碼 (以上面 `helloworld` 為例) 並移除註解 (`//`)

```js
token: 'helloworld'
```

然後直接點開 `index.html` 沒有跳錯誤就成功了

### 使用 AriaNg (手動)

到 [AriaNg Releases](https://github.com/mayswind/AriaNg/releases) 頁面選擇最新版的下載

解壓縮到任何資料夾，例如 `AriaNg`。

接下來直接點開裡面的 `index.html`，應該會發現連線失敗，先不用管。找到左側的 `AriaNg Settings`，在上方的選單點 `RPC(localhost:6800)`。

然後在下方的 `Alias` 填入自己認得的名稱，以及 `Aria2 RPC Secret Token` 填入上面設定的密碼(rpc-secret 的值)。完成後重新整理頁面應該就能使用了。

#### AriaNg 調整語言

根據 [README.md 裡的 Usage Notes](https://github.com/mayswind/AriaNg#usage-notes)，他說了因為語言檔是用非同步加載的方式載入的，所以需要用一個伺服器來提供檔案。

其中一種方法可以用 [httpsrv](https://github.com/maple3142/httpsrv) 來快速開啟一個伺服器。

```bash
$ npm i -g httpsrv
$ cd AriaNg # AriaNg 所在的資料夾
$ httpsrv -i .
# 到瀏覽器打開 localhost:3333 就好了
```

或是使用其他能做到一樣的事的伺服器也行(ex: python php nginx...)
