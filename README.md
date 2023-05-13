# dmhy-subscribe

在動漫花園訂閱並排程下載磁鏈

- [範例影片](#範例影片)
- [依賴](#依賴)
- [安裝方法](#安裝方法)
- [使用方法](#使用方法)
- [0.6.x 遷移指南](#06x-遷移指南)
- [自動排程](#自動排程)
- [回報問題](#回報問題)
- [已知問題](#已知問題)
  - [首頁已經有最新一集出現了，但是 `dmhy pull` 卻沒更新](#首頁已經有最新一集出現了但是-dmhy-pull-卻沒更新)
- [授權](#授權)

## 範例影片

<!-- markdownlint-disable-next-line no-bare-urls -->
https://github.com/FlandreDaisuki/dmhy-subscribe/assets/5981459/0b2edd42-9a1a-4d7e-9af5-d665e18bdb45

## 依賴

- nodejs (18+)

下載器目前提供下面四種，擇一即可 (推薦使用 `system`)

- system(預設): 若系統有註冊 `magnet://` 關聯程式，則啟動該程式
- webhook: [webhook 安裝教學](docs/webhook.md)
- aria2c: [aria2 安裝教學](docs/aria2.md)
- stdout: 直接印出連結到 stdout

## 安裝方法

<details close>
  <summary>確認 nodejs 安裝完成後</summary>
  <p>
  PowerShell:

  ```powershell
  PS C:\> node -v
  v18.16.0
  PS C:\> npm -v
  9.5.1
  ```

  Others:

  ```bash
  $ node -v
  v18.16.0
  $ npm -v
  9.5.1
  ```

  </p>
</details>

```bash
$ npm i -g dmhy-subscribe
```

如果習慣想使用 Docker 安裝，可以參考[Docker 安裝與使用教學](docs/docker.md)。

## 使用方法

```txt
dmhy [命令]

命令：
  dmhy add <title> [keywords..]            新增一筆訂閱
  dmhy find <title> [keywords..]           用關鍵字搜尋貼文
  dmhy pull [sid..]                        更新訂閱的貼文
  dmhy list [sid]                          列出指定或全部訂閱          [別名： ls]
  dmhy config [config-name] [config-value] 個人化設定
  dmhy remove [sid..]                      移除訂閱                  [別名： rm]
  dmhy download <sid> [episode-queries..]  下載訂閱貼文               [別名： dl]

選項：
  -h, --help     顯示說明                                                 [布林]
  -v, --version  顯示版本                                                 [布林]
```

個別命令使用方法可以在個別命令下用 `--help` 顯示說明，或是從 [tests/cli/commands/](tests/cli/commands/) 下找 `*.spec.mjs`。

## 0.6.x 遷移指南

如果已經有安裝 v0.6.x 版的話，可以先用 `dmhy ls -ss` 將字串保留起來，舉例如下：

```sh
$ dmhy -v
0.6.33

$ dmhy ls --ss
天國大魔境,SweetSub,繁日雙語
冰海戰記 第二季,繁體,豌豆
地獄樂,1080p,喵萌,繁日雙語
```

安裝新版之後寫法稍有不同：

```sh
$ dmhy -v
1.0.0

$ dmhy add 天國大魔境 SweetSub 繁日雙語
成功新增訂閱「天國大魔境」！
$ dmhy add '冰海戰記 第二季' 繁體 豌豆 # 注意如果標題有空白要用單引號夾起來
成功新增訂閱「冰海戰記 第二季」！
$ dmhy add 地獄樂 1080p 喵萌 繁日雙語
成功新增訂閱「地獄樂」！
```

以前的話 `dmhy add` 完就會下 `dmhy` 來下載沒載過的集數；新版的話要改下 `dmhy pull --then-download`

其他差異請參考 [v1.0.0 的版本細節](https://github.com/FlandreDaisuki/dmhy-subscribe/releases/v1.0.0)

## 自動排程

參考[自動排程](docs/scheduling.md)教學

## 回報問題

先到 [issue](https://github.com/FlandreDaisuki/dmhy-subscribe/issues) 看看有沒有相似的問題，若沒有相似問題請點擊 New issue 描述問題。

## 已知問題

### 首頁已經有最新一集出現了，但是 `dmhy pull` 卻沒更新

這是正常的，因為動漫花園因為一些未知的原因，搜尋的結果會有點延遲。

## 授權

[ISC](LICENSE)

<!--
## Developer guide

The environment variables `DATABASE_DIR` and `DEBUG` are useful.

Here are some commands I use while developing:

```
alias dmhy-dev='DEBUG=dmhy:* DATABASE_DIR=. npx -p dmhy-subscribe src/cli/index.mjs'
```
-->
