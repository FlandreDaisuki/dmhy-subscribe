# dmhy-subscribe

[![npm](https://img.shields.io/npm/v/dmhy-subscribe.svg)](https://www.npmjs.com/package/dmhy-subscribe) [![Build Status](https://travis-ci.org/FlandreDaisuki/dmhy-subscribe.svg?branch=master)](https://travis-ci.org/FlandreDaisuki/dmhy-subscribe)

Subscribe and schedule downloading magnets on dmhy. Support Linux & Windows 10.

在動漫花園訂閱並排程下載磁鏈，支援 Linux & Windows 10

* [Demo](#demo)
* [Requirement 必須軟體](#requirement-%E5%BF%85%E9%A0%88%E8%BB%9F%E9%AB%94)
  + [node & npm](#node--npm)
  + [deluge & deluge-console](#deluge--deluge-console)
* [Installation 安裝方法](#installation-%E5%AE%89%E8%A3%9D%E6%96%B9%E6%B3%95)
  + [Linux](#linux)
  + [Windows 10](#windows-10)
  + [Windows 10 中文版](#windows-10-%E4%B8%AD%E6%96%87%E7%89%88)
* [Usage 使用方法](#usage-%E4%BD%BF%E7%94%A8%E6%96%B9%E6%B3%95)
* [Work with crontab/pm2 使用 crontab/pm2 自動排程](#work-with-crontabpm2-%E4%BD%BF%E7%94%A8-crontabpm2-%E8%87%AA%E5%8B%95%E6%8E%92%E7%A8%8B)
  + [Linux](#linux-1)
  + [Windows 10](#windows-10-1)
  + [Windows 10 中文版](#windows-10-%E4%B8%AD%E6%96%87%E7%89%88-1)

## Demo

<p align="center">
  <a href="https://www.youtube.com/watch?v=sGjh77-72vE">
    <img src="https://img.youtube.com/vi/sGjh77-72vE/0.jpg">
  </a>
</p>

## Requirement 必須軟體

+ nodejs (v8.9+) & npm
  * Ubuntu 推薦使用： [creationix/nvm](https://github.com/creationix/nvm)
    或 [tj/n](https://github.com/tj/n)
  * Windows 10: 推薦使用：[官方安裝](https://nodejs.org/)

下載器下面兩種擇一即可

+ deluge & deluge-console: [deluge 安裝教學](docs/deluge.md)
+ aria2c & webui-aria2:  [aria2 安裝教學](docs/aria2.md)

## Installation 安裝方法

<details close>
  <summary>確認 nodejs 安裝</summary>

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
    --client <client>         強制使用指定下載器。 <client>: "aria2crpc", "deluge-console"(預設)
    --jsonrpc <jsonrpc_uri>   jsonrpc url for --client=aria2crpc
    -h, --help                output usage information


  Commands:

    add [options] [subscribable...]  使用 {可訂閱字串} 新增 {訂閱}
    remove|rm [options] [sid...]     根據 {sid} 刪除 {訂閱}
    list|ls [options] [sid...]       列出所有 {訂閱} 或指定 {訂閱} 的詳細資訊
    download|dl [thid...]            根據 {thid} 下載 {訂閱} 中的 {貼文}

  例子:

    $ dmhy add '紫羅蘭永恆花園,動漫國,繁體,1080P'
    $ dmhy

    或

    $ dmhy --client aria2crpc
```

## 自動排程

參考[自動排程](docs/scheduling.md)教學
