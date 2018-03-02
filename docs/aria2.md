# aria2

aria2 是一個強大的下載工具，`dmhy-subscribe` 靠他來下載並管理 magnet

* [安裝方法](#%E5%AE%89%E8%A3%9D%E6%96%B9%E6%B3%95)
* [設置 aria2.conf](#%E8%A8%AD%E7%BD%AE-aria2conf)
* [開啟 daemon 模式](#%E9%96%8B%E5%95%9F-daemon-%E6%A8%A1%E5%BC%8F)
* [使用 webui-aria2](#%E4%BD%BF%E7%94%A8-webui-aria2)

## 安裝方法

下載點：

- Ubuntu: `sudo apt-get install aria2` 或自行編譯
- Windows 10: 從 [GitHub](https://github.com/aria2/aria2/releases/latest) 下載 zip 將 aria2c.exe 解壓到適當的位置 (推薦 `D:\aria2\aria2c.exe`)


## 設置 aria2.conf

<details open>
  <summary>aria2.conf</summary>

  ```
    # 開啟 daemon 模式
    enable-rpc=true
    rpc-allow-origin-all=true
    rpc-listen-all=true
    rpc-listen-port=6800

    # 這邊請自行設置密碼，這邊以 helloworld 為例
    rpc-secret=helloworld
  ```

</details>

- Ubuntu: aria2 預設會去找 `~/.aria2/aria2.conf` 或之後指定
- Windows 10: 複製並存到適當位置 (推薦 `D:\aria2\aria2.conf`) 方便之後指定

## 開啟 daemon

- Ubuntu:
  ```sh
  $ nohup aria2c & # ~/.aria2/aria2.conf
  # 或
  $ nohup aria2c -conf-path="aria2.conf的路徑" &
  ```
- Windows 10:
  將下面程式碼存成 `daemonize.vbs` 並雙擊執行，注意路徑

  <details open>
    <summary>daemonize.vbs</summary>

  ```
  ' https://gist.github.com/aa65535/5e956c4eb4f451ddec29

  CreateObject("Wscript.Shell").Run "D:\aria2\aria2c.exe --conf-path=D:\aria2\aria2.conf -D", 0
  ```

  </details>

如果要關閉 deamon 請直接 `kill $(pidof aria2c)` 或是到工作管理員終止 `aria2c.exe`

## 使用 webui-aria2

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


