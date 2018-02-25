# dmhy-subscribe

[![npm](https://img.shields.io/npm/v/dmhy-subscribe.svg)](https://www.npmjs.com/package/dmhy-subscribe)

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

  [![Youtube Demo](https://img.youtube.com/vi/sGjh77-72vE/0.jpg)](https://www.youtube.com/watch?v=sGjh77-72vE)

</p>

## Requirement 必須軟體

### node & npm
- Recommend using [creationix/nvm](https://github.com/creationix/nvm)
 or [tj/n](https://github.com/tj/n) on Linux
- Recommend using [official installer](https://nodejs.org/) on Windows 10

### deluge & deluge-console

Linux:
```
$ sudo add-apt-repository ppa:deluge-team/ppa
$ sudo apt update
$ sudo apt install deluge deluged deluge-console
```

Windows 10:
Use [official installer](http://dev.deluge-torrent.org/wiki/Download)

## Installation 安裝方法

### Linux
```
$ npm i -g dmhy-subscribe
$ deluged # Open the daemon
$ deluge-console info # if no error, OK.
```

### Windows 10

There are some previous work for Windows 10:

- Add deluge path (`C:\Program Files (x86)\deluge` in default) into PATH environment variable *or* open **PowerShell(Administrator)** and type following shell script to complete previous work
  ```shell
  PS C:\>  $delugepath = 'C:\Program Files (x86)\deluge' # Your deluge path
  PS C:\>  $oldpath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::Machine)
  PS C:\>  $newpath = "$oldpath;$delugepath"
  PS C:\>  [Environment]::SetEnvironmentVariable("Path", "$newPath", [EnvironmentVariableTarget]::Machine)
  PS C:\>  exit # To reload profile
  ```
- Goto your deluge path and execute `deluged.exe` *or* open **PowerShell(Administrator)** and type `deluged` to execute deamon

Test previous work with PowerShell:
```
PS C:\>  deluge-console info
# if no error, OK.
# if error message is "Failed to connect to ..." means deluged.exe isn't opened.
```

### Windows 10 中文版

Windows 10 需要做些前置作業:

- 把 deluge 路徑 (預設是 `C:\Program Files (x86)\deluge`) 加到 PATH 環境變數 *或* 打開 **PowerShell(系統管理員)** 並輸入以下指令完成前置作業
  ```shell
  PS C:\>  $delugepath = 'C:\Program Files (x86)\deluge' # 你的 deluge 路徑
  PS C:\>  $oldpath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::Machine)
  PS C:\>  $newpath = "$oldpath;$delugepath"
  PS C:\>  [Environment]::SetEnvironmentVariable("Path", "$newPath", [EnvironmentVariableTarget]::Machine)
  PS C:\>  exit # 關掉重開是必須的
  ```
- 到 deluge 路徑執行 `deluged.exe` *或*  打開 **PowerShell(系統管理員)** 並輸入 `deluged` 執行服務

用 PowerShell 測試前置作業是否成功:
```
PS C:\>  deluge-console info
# 如果沒有錯誤就完成了.
# 如果錯誤訊息是 "Failed to connect to ..." 代表 deluged.exe 沒打開
```

## Usage 使用方法

```
  Usage: dmhy [options] [command]

  Options:

    -V, --version  output the version number
    -h, --help     output usage information

  Commands:

    add [options] [subscribable...]  Add {subscribable} to subscribe.
    remove|rm [options] [sid...]     Remove {subscription} by {sid}.
    list|ls [options] [sid...]       List the {subscription}s or the {thread}s of the {subscription}s.
    download|dl [thid...]            Download the {thread}s of the {subsciption}s which are subscribed in list.

  Examples:

    $ dmhy add '紫羅蘭永恆花園,動漫國,繁體,1080P'
    $ dmhy
```

## Work with crontab/pm2 使用 crontab/pm2 自動排程

cron format: http://www.nncron.ru/help/EN/working/cron-format.htm

### Linux

Check and fetch every 6 hour
```
$ (crontab -l 2>/dev/null; echo "0 */6 * * * `which dmhy`") | crontab -
```

Use [pm2](http://pm2.keymetrics.io/) instead
```
$ npm i -g pm2
$ pm2 start dmhy --cron '0 */6 * * *'
$ pm2 ls
```

### Windows 10

Use [pm2](http://pm2.keymetrics.io/) with PowerShell
```
PS C:\>  npm i -g pm2 # Install pm2
PS C:\>  pm2 start %appdata%\npm\node_modules\dmhy-subscribe\index.js --name "dmhy" --cron "* */6 * * *"
PS C:\>  pm2 ls
```

### Windows 10 中文版

在 PowerShell 使用 [pm2](http://pm2.keymetrics.io/)
```
PS C:\>  npm i -g pm2 # 安裝 pm2
PS C:\>  pm2 start %appdata%\npm\node_modules\dmhy-subscribe\index.js --name "dmhy" --cron "* */6 * * *"
PS C:\>  pm2 ls
```
