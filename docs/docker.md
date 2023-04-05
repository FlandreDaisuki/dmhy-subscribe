# Docker

您也可以使用 [Docker](https://www.docker.com/) 來執行 `dmhy-subscribe` 在無法透過 npm 安裝、設定過於複雜、或有其他支援問題的作業系統中使用 `dmhy-subscribe`。

專案中的 Docker 設定整合了 `dmhy-subscribe` 、 `cron`(排程) 和 `aria2`(下載器) 的功能。

- [依賴軟體](#依賴軟體)
- [建置 docker image](#建置-docker-image)
- [執行方式](#執行方式)
  - [docker run](#docker-run)
  - [docker compose](#docker-compose)
    - [dmhy-subscribe 個人化設定](#dmhy-subscribe-個人化設定)
    - [Aria2 設定](#aria2-設定)
    - [重要設定](#重要設定)
    - [啟動服務](#啟動服務)

## 依賴軟體

- Docker
  - [Ubuntu](https://docs.docker.com/install/linux/docker-ce/ubuntu/)
  - [MacOS](https://docs.docker.com/docker-for-mac/install/)
  - [Windows](https://docs.docker.com/docker-for-windows/install/)
  - [Synology NAS](https://www.synology.com/zh-tw/dsm/packages/Docker)
  - 其他 Linux 系統族繁不及備載，請自行研究。
- [Docker Compose](https://docs.docker.com/compose/install/) (optional)

## 建置 docker image

```sh
# 直接從 GitHub 下載 Image
docker pull docker pull ghcr.io/flandredaisuki/dmhy-subscribe
docker tag ghcr.io/flandredaisuki/dmhy-subscribe dmhy-subscribe

# 或自行 build image
git clone https://github.com/FlandreDaisuki/dmhy-subscribe.git
cd dmhy-subscribe
docker build . -f docker/Dockerfile -t dmhy-subscribe
```

## 執行方式

### docker run

只啟動 dmhy-subscribe 主要功能及排程

```sh
mkdir -p ./data
touch ./data/cron.log
touch ./data/dmhy.sqlite3

docker run --rm -itd \
  --name dmhy \
  -w '/root/app' \
  -v "$(pwd)/data/cron.log:/root/app/cron.log" \
  -v "$(pwd)/data/dmhy.sqlite3:/root/app/dmhy.sqlite3" \
  -e "DATABASE_DIR=/root/app" \
  -e "LANG=C.UTF-8" \
  -e "CRON_FREQ=0 * * * *" \
  dmhy-subscribe
```

### docker compose

執行 `setup.sh` 建立必要之檔案環境與設定檔。

這個腳本會建立 `data` 資料夾，包含了 `cron` 和 `aria2` 的設定檔。

```sh
./setup.sh
```

可以修改並執行完 `setup.sh` 再開始設定 `docker-compose.yml`。

#### dmhy-subscribe 個人化設定

在 `setup.sh` 內可以設定個人化參數

```sh
# dmhy 的語系設定
LANG='C.UTF-8'
#    'zh_TW.UTF-8' # 繁體中文

# cron 的排程週期設定
CRON_FREQ='0 * * * *'

# aria2 token
ARIA2_SECRET='dockerdmhy'

# aria2 rpc port
ARIA2_PORT='6800'
```

#### Aria2 設定

我們使用 [docker-aria2-with-webui](https://github.com/abcminiuser/docker-aria2-with-webui) 作為下載容器。如果要修改相關設定請參考連結說明。

為相容 MacOS，預設 `file-allocation` 為 `prealloc`，若系統允許可以更改 `data/aria2` 中的設定檔為更高速的 `falloc`。

#### 重要設定

請使用 `id -u` 和 `id -g` 指令查看自己的 `UID` 和 `GID`，並將 `docker-compose.yml` 中的 `PUID` 和 `PGID` 分別設定為個人之 `UID` 與 `GID` ，以確保 aria2 有正確的讀寫權限。

`setup.sh` 會試著設定目前使用者的 `UID` 及 `GID`。

#### 啟動服務

啟動 dmhy-subscribe 背景服務:

```sh
# 執行服務
docker-compose up -d
# 暫停服務
docker-compose stop
# 完全清除容器
docker-compose down
```

在啟用服務之後，可以在 `http://localhost:6880` 看到 aria2 的 WebUI。

若發現有連線到 RPC 伺服器但出現警告，是因為 WebUI 有設定 token，預設為 `dockerdmhy` (可在 `docker-compose.yml` 設定)，可以到 **設定>連線設定>密碼令牌** 輸入

要執行 dmhy 指令可以透過以下方式:

```sh
# 進入 container 進行操作
docker exec -it dmhy sh

# 或直接傳送命令
# 以 dmhy ls 為例:
docker exec dmhy dmhy ls
```

<!-- cSpell:ignore dockerdmhy prealloc falloc PUID PGID -->
