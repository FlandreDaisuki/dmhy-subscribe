# dmhy-subscribe

[![npm](https://img.shields.io/npm/v/dmhy-subscribe.svg)](https://www.npmjs.com/package/dmhy-subscribe) [![Build Status](https://travis-ci.org/FlandreDaisuki/dmhy-subscribe.svg?branch=master)](https://travis-ci.org/FlandreDaisuki/dmhy-subscribe)

Subscribe and schedule downloading magnets on dmhy. Support Linux & Windows 10.

在動漫花園訂閱並排程下載磁鏈，支援 Linux & Windows 10

* [Demo 範例影片](#demo-%E7%AF%84%E4%BE%8B%E5%BD%B1%E7%89%87)
* [Requirements 依賴軟體](#requirements-%E4%BE%9D%E8%B3%B4%E8%BB%9F%E9%AB%94)
* [Installation 安裝方法](#installation-%E5%AE%89%E8%A3%9D%E6%96%B9%E6%B3%95)
* [Usage 使用方法](#usage-%E4%BD%BF%E7%94%A8%E6%96%B9%E6%B3%95)
* [Scheduling 自動排程](#scheduling-%E8%87%AA%E5%8B%95%E6%8E%92%E7%A8%8B)

## Demo 範例影片

<p align="center">
  <a href="https://www.youtube.com/watch?v=sGjh77-72vE">
    <img src="https://img.youtube.com/vi/sGjh77-72vE/0.jpg">
  </a>
</p>

## Requirements 依賴軟體

* nodejs (v8.9+) & npm
  * Ubuntu 推薦使用：[creationix/nvm](https://github.com/creationix/nvm)
        或 [tj/n](https://github.com/tj/n)
  * Windows 10 推薦使用：[官方安裝](https://nodejs.org/)

下載器下面兩種擇一即可 (推薦使用 `deluge`)

* deluge & deluge-console: [deluge 安裝教學](docs/deluge.md)
* aria2c & (webui-aria2 或 AriaNg): [aria2 安裝教學](docs/aria2.md)

## Installation 安裝方法

<details close>
  <summary>確認 nodejs 安裝</summary>
  <p>
  Ubuntu:

  ```
  $ node -v
  v9.4.0
  $ npm -v
  5.6.0
  ```

  Windows10 (PowerShell):

  ```
  PS C:\> node -v
  v9.4.0
  PS C:\> npm -v
  5.6.0
  ```
  </p>
</details>

```
$ npm i -g dmhy-subscribe
```

## Usage 使用方法

```
  Usage: dmhy [options] [command]


  Options:

    -V, --version             output the version number
    -d, --destination <path>  下載路徑 (預設: 預設下載資料夾)
    --client <client>         強制使用指定下載器。 <client>: "aria2", "deluge"(預設)
    --jsonrpc <jsonrpc_uri>   jsonrpc url for --client=aria2
    -h, --help                output usage information


  Commands:

    add [options] [subscribable...]     使用 {可訂閱字串} 新增 {訂閱}
    remove|rm [options] [sid...]        根據 {sid} 刪除 {訂閱}
    list|ls [options] [sid...]          列出所有 {訂閱} 或指定 {訂閱} 的詳細資訊
    download|dl [thid...]               根據 {thid} 下載 {訂閱} 中的 {貼文}
    search|find [options] <keywords>    直接搜尋 dmhy 網頁結果 (關鍵字用半形逗號分開)
    update [sid...]                     只更新已訂閱的 {訂閱} 但不下載
    config|cfg [options] [key] [value]  設定內部參數

  例子:

    $ dmhy add "紫羅蘭永恆花園,動漫國,繁體,1080P"
    $ dmhy

    或

    $ dmhy --client aria2
```

## Scheduling 自動排程

參考[自動排程](docs/scheduling.md)教學

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars0.githubusercontent.com/u/5981459?v=4" width="100px;"/><br /><sub><b>Chun-Hao Lien</b></sub>](https://github.com/FlandreDaisuki)<br />[💻](https://github.com/FlandreDaisuki/dmhy-subscribe/commits?author=FlandreDaisuki "Code") [📖](https://github.com/FlandreDaisuki/dmhy-subscribe/commits?author=FlandreDaisuki "Documentation") [⚠️](https://github.com/FlandreDaisuki/dmhy-subscribe/commits?author=FlandreDaisuki "Tests") [👀](#review-FlandreDaisuki "Reviewed Pull Requests") | [<img src="https://avatars1.githubusercontent.com/u/9370547?v=4" width="100px;"/><br /><sub><b>maple</b></sub>](https://blog.maple3142.net/)<br />[💻](https://github.com/FlandreDaisuki/dmhy-subscribe/commits?author=maple3142 "Code") [📖](https://github.com/FlandreDaisuki/dmhy-subscribe/commits?author=maple3142 "Documentation") [🤔](#ideas-maple3142 "Ideas, Planning, & Feedback") [🐛](https://github.com/FlandreDaisuki/dmhy-subscribe/issues?q=author%3Amaple3142 "Bug reports") |
| :---: | :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->
Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!
