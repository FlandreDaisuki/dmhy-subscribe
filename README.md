# dmhy-subscribe

Subscribe and schedule downloading magnets on dmhy. Support Linux & Windows 10.

在動漫花園訂閱並排程下載磁鏈，支援 Linux & Windows 10

## Demo

<p align="center">
  <img src="./preview.gif"/>
</p>

## Requirement

### node & npm
- Recommend using [creationix/nvm](https://github.com/creationix/nvm)
 or [tj/n](https://github.com/tj/n) on Linux
- Recommend using [official installer](https://nodejs.org/) on Windows 10

### deluge & deluge-console

Linux:
```
$ sudo apt install deluge deluged deluge-console
```

Windows 10:
Use [offical installer](http://dev.deluge-torrent.org/wiki/Download)

## Installation

```
$ npm i -g dmhy-subscribe
```

## Usage

```
  Usage: dmhy [options] [command]


  Options:

    -V, --version  output the version number
    -h, --help     output usage information


  Commands:

    add [options] [anime...]
      Add <anime> to subscribe.

      A <anime> contains a name and following keywords
      to identify series you want to download, then
      joins them by CSV format in a string.

      Examples:

        Direct:
          $ dmhy add '紫羅蘭永恆花園,動漫國,繁體,1080P'
          $ dmhy add '紫羅蘭永恆花園,動漫國,繁體,1080P' 'pop team epic,極影,BIG5'

        File:
          $ dmhy ls --addable > a.txt
          $ dmhy rm --all
          $ dmhy add --file a.txt

    remove|rm [options] [vid...]
      Unsubscribe <anime> by <vid>.

      The <vid> are listed at `$ dmhy list`.

      Examples:
        $ dmhy rm XYZ ABC
        $ dmhy rm -a

    download|dl [epid...]
      Download <episode> of <anime> which are subscribed.

      The epid format: <vid>-<ep>
      <ep> : int | float | 'all' | <ep>..<ep> | <ep>,<ep>

      Examples:
        $ dmhy download ABC-01
        $ dmhy dl XYZ-5.5 QWE-all ZZZ-1,3..5,6,8

    list|ls [options]
      List all <anime> which are subscribed.
```

## Work with crontab/pm2

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

There are some previous work for Windows 10:

- Add deluge path (`C:\Program Files (x86)\deluge` in default) into environment variable
- open PowerShell and type `deluged` to execute deamon

Test previous work with PowerShell:
```
> deluge-console info
# if no error, OK
```

Use [pm2](http://pm2.keymetrics.io/) with PowerShell
```
> npm i -g pm2
> pm2 start %appdata%\npm\node_modules\dmhy-subscribe\index.js --name "dmhy" --cron "* */6 * * *"
> pm2 ls
```
