# qBittorrent

qBittorrent 是個跨平台的 torrent 下載軟體，`dmhy-subscribe` 可以直接呼叫它來幫忙下載。

* [安裝方法](#%E5%AE%89%E8%A3%9D%E6%96%B9%E6%B3%95)
* [開啟 Web UI](#%E9%96%8B%E5%95%9F%20Web%20UI)
* [dmhy-subscribe 的設定](#dmhy-subscribe%20%E7%9A%84%E8%A8%AD%E5%AE%9A)
* [使用範例](#%E4%BD%BF%E7%94%A8%E7%AF%84%E4%BE%8B)

## 安裝方法

* Ubuntu: 先 `sudo add-apt-repository ppa:qbittorrent-team/qbittorrent-stable && sudo apt-get update` 然後再 `sudo apt-get install qbittorrent`
* Windows/Mac: 從[官方下載頁面](https://www.qbittorrent.org/download.php)直接下載安裝

## 開啟 Web UI

`dmhy-subscribe` 是透過它的 Web UI 來呼叫的，所以必須要打開這個功能才能正常使用

打開方法就直接進入 qBittorrent 的設定找到 Web UI，然後打開它並根據自己的需求改一些設定

範例(Windows 10): ![qBittorrent Web Ui page](https://i.imgur.com/9RGAVME.png)

## dmhy-subscribe 的設定

如果你有修改過它的 port 的話(預設 8080)，要先執行下方的指令，沒有的話可以跳過

```bash
$ dmhy config qbittorrent-url http://localhost:1234/ # 1234 是你修改過的 port
```

再來是要設定你登入 Web UI 的帳密

```bash
$ dmhy config qbittorrent-auth username:password # 後面那串請以"帳號:密碼"的格式來輸入
```

## 使用範例

```bash
$ dmhy add "搖曳露營,DHR,720,繁體,Yuru"
# 假設搖曳露營的訂閱識別碼為 ALR
$ dmhy #下載全部
$ dmhy dl ALR-08 #下載單集
```
