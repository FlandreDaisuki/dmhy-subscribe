# dmhy-subscribe

[![npm version](https://badge.fury.io/js/dmhy-subscribe.svg)](https://www.npmjs.com/package/dmhy-subscribe) [![Build Status](https://travis-ci.org/FlandreDaisuki/dmhy-subscribe.svg?branch=master)](https://travis-ci.org/FlandreDaisuki/dmhy-subscribe) [![CircleCI](https://circleci.com/gh/FlandreDaisuki/dmhy-subscribe.svg?style=shield)](https://circleci.com/gh/FlandreDaisuki/dmhy-subscribe)

Subscribe and schedule downloading magnets on dmhy. Support Linux & Windows 10.

在動漫花園訂閱並排程下載磁鏈，支援 Linux & Windows 10

* [Demo 範例影片](#Demo-範例影片)
* [Requirements 依賴軟體](#Requirements-依賴軟體)
* [Installation 安裝方法](#Installation-安裝方法)
* [Usage 使用方法](#Usage-使用方法)
* [Scheduling 自動排程](#Scheduling-自動排程)
* [Feedbacks 回報問題](#Feedbacks-回報問題)
* [Known Issues 已知問題](#Known-Issues-已知問題)
  * [首頁已經有最新一集出現了，但是 `dmhy` 卻沒更新](#首頁已經有最新一集出現了但是-dmhy-卻沒更新)
* [Contributing 貢獻專案](#Contributing-貢獻專案)
* [Contributors](#Contributors)

## Demo 範例影片

GIF 由 [ttygif](https://github.com/icholy/ttygif) 生成

<p align="center">
  <img src="./tty.gif" alt="tty demo">
</p>

## Requirements 依賴軟體

* nodejs (v8.9+) & npm
  * Ubuntu 推薦使用：[creationix/nvm](https://github.com/creationix/nvm)
        或 [tj/n](https://github.com/tj/n)
  * Windows 10 推薦使用：[官方安裝](https://nodejs.org/)

下載器目前提供下面六種，擇一即可 (推薦使用 `system`)

* system(預設): 若系統有註冊 `magnet://` 關聯程式，則啟動該程式
* deluge: [deluge 安裝教學](docs/deluge.md)
* qBittorrent: [qBittorrent 安裝教學](docs/qbittorrent.md)
* aria2c: [aria2 安裝教學](docs/aria2.md)
* webhook: [webhook 安裝教學](docs/webhook.md)(待補)
* stdout: 直接印出連結到 stdout

## Installation 安裝方法

<details close>
  <summary>確認 nodejs 安裝</summary>
  <p>
  Ubuntu:

  ```bash
  $ node -v
  v9.4.0
  $ npm -v
  5.6.0
  ```

  Windows10 (PowerShell):

  ```powershell
  PS C:\> node -v
  v9.4.0
  PS C:\> npm -v
  5.6.0
  ```

  </p>
</details>

```bash
$ npm i -g dmhy-subscribe
```

若之前已有安裝，推薦先輸出可訂閱字串作為備份

```bash
(0.3.x) $ dmhy ls --addable > backup.txt
(0.5.x) $ dmhy ls -s > backup.txt
```

如果習慣使用 Docker 或 npm 無法正確安裝，也可以透過 [Docker](https://www.docker.com) 來執行本程式。

* [Docker 安裝與使用教學](docs/docker.md)

## Usage 使用方法

```txt
使用方法: dmhy [命令] [選項]

  若不指定命令，則到網站檢查更新，並*只*下載尚未紀錄的貼文


命令：
  dmhy add [subscribable...]         新增一筆訂閱
  dmhy list [SID...]                 顯示訂閱資訊                   [別名: ls]
  dmhy remove [SID...]               根據訂閱識別碼刪除訂閱         　[別名: rm]
  dmhy search <subscribable-string>  直接搜尋貼文                   [別名: find]
  dmhy config [key] [value]          設定內部參數                   [別名: cfg]
  dmhy download <THID...>            根據下載識別碼下載訂閱           [別名: dl]

選項：
  -x, --no-dl    只更新訂閱但不下載                                   [布林]
  -h, --help     顯示說明                                           [布林]
  -v, --version  顯示版本                                           [布林]

例：
  dmhy add "搖曳露營,喵萌,繁體"      最簡單的例子，新增訂閱並全部更新下載
  dmhy
```

## Scheduling 自動排程

參考[自動排程](docs/scheduling.md)教學

## Feedbacks 回報問題

先到 [issue](https://github.com/FlandreDaisuki/dmhy-subscribe/issues) 看看有沒有相似的問題，若沒有相似問題請點擊 New issue 描述問題。

## Known Issues 已知問題

### 首頁已經有最新一集出現了，但是 `dmhy` 卻沒更新

這是正常的，因為動漫花園因為一些未知的原因，搜尋的結果會有點延遲
可以試著去直接搜尋訂閱的關鍵字，是看不到最新一集的

## Contributing 貢獻專案

Fork 並 clone 到本地端

```bash
(master) $ git remote add upstream https://github.com/FlandreDaisuki/dmhy-subscribe.git
(master) $ git merge upstream master # 更新上游分支
(master) $ git checkout -b 0.6.x # *最新版本*的最後一個數字改成x
(0.6.x) $ # 改改改
(0.6.x) $ git push origin 0.6.x
```

到 GitHub 發 PR 到我的同名分支 (不要發到 master)

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars0.githubusercontent.com/u/5981459?v=4" width="100px;"/><br /><sub><b>Chun-Hao Lien</b></sub>](https://github.com/FlandreDaisuki)<br />[💻](https://github.com/FlandreDaisuki/dmhy-subscribe/commits?author=FlandreDaisuki "Code") [📖](https://github.com/FlandreDaisuki/dmhy-subscribe/commits?author=FlandreDaisuki "Documentation") [⚠️](https://github.com/FlandreDaisuki/dmhy-subscribe/commits?author=FlandreDaisuki "Tests") [👀](#review-FlandreDaisuki "Reviewed Pull Requests") | [<img src="https://avatars1.githubusercontent.com/u/9370547?v=4" width="100px;"/><br /><sub><b>maple</b></sub>](https://blog.maple3142.net/)<br />[💻](https://github.com/FlandreDaisuki/dmhy-subscribe/commits?author=maple3142 "Code") [📖](https://github.com/FlandreDaisuki/dmhy-subscribe/commits?author=maple3142 "Documentation") [🤔](#ideas-maple3142 "Ideas, Planning, & Feedback") [🐛](https://github.com/FlandreDaisuki/dmhy-subscribe/issues?q=author%3Amaple3142 "Bug reports") | [<img src="https://avatars1.githubusercontent.com/u/2549826?v=4" width="100px;"/><br /><sub><b>Ting Shu Lin</b></sub>](http://sudopotato.github.io/)<br />[💻](https://github.com/FlandreDaisuki/dmhy-subscribe/commits?author=wabilin "Code") [🤔](#ideas-wabilin "Ideas, Planning, & Feedback") [📦](#platform-wabilin "Packaging/porting to new platform") |
| :---: | :---: | :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->
Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!
