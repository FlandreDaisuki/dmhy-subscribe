# dmhy-subscribe


## Requirement

### node & npm
- recommend use [creationix/nvm](https://github.com/creationix/nvm)
 or [tj/n](https://github.com/tj/n)

### deluge & deluge-console

```
$ sudo apt install deluge deluge-console
```

## Installation

```
npm i -g dmhy-subscribe
```

## Usage

```
Usage: dmhy [options] [command]

Options:

  -V, --version  output the version number
  -h, --help     output usage information

Commands:

  add [anime...]
    Add <anime> to subscribe.

    A <anime> contains a name and following keywords
    to identify series you want to download, then
    joins them by CSV format in a string.

    Examples:

    Simple:
        $ dmhy add '紫羅蘭永恆花園,動漫國,繁體,1080P'

    Multiple:
        $ dmhy add '紫羅蘭永恆花園,動漫國,繁體,1080P' 'pop team epic,極影,BIG5'

  remove|rm [vid...]
    Unsubscribe <anime> by <vid>.

    The <vid> are listed at `$ dmhy list`.

  download|dl [epid...]
    Download <episode> of <anime> which are subscribed.

    The epid format: <vid>-<ep>
    <ep> : int | float | 'all' | <ep>..<ep> | <ep>,<ep>

    Examples:
    $ dmhy download ABC-01
    $ dmhy dl XYZ-5.5 QWE-all ZZZ-1,3..5,6,8

  list|ls
    List all <anime> which are subscribed.
```
