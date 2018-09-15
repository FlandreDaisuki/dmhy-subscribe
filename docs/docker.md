# Docker

您也可以使用 [Docker](https://www.docker.com/) 來執行 `dmhy-subscribe`。在無法透過 npm 安裝、設定過於複雜、或有其他支援問題的作業系統中使用 `dmhy-subscribe`。

專案中的 Docker 設定整合了 `dmhy-subscribe` 、 `cron`(排程) 和 `aria2`(下載器) 的功能。


## Requirements 依賴軟體

 - Docker
   * [Ubuntu](https://docs.docker.com/install/linux/docker-ce/ubuntu/)
   * [MacOS](https://docs.docker.com/docker-for-mac/install/)
   * [Windows](https://docs.docker.com/docker-for-windows/install/)
   * [Synology NAS](https://www.synology.com/zh-tw/dsm/packages/Docker)
   * 其他 Linux 系統族繁不及備載，敬請自行研究。

 - [Docker Compose](https://docs.docker.com/compose/install/) (optional)

## Installation 安裝方式

下載本專案原始碼後，進入 `docker` 目錄，可以用以下方式建立 Docker Image:

```sh
# 直接從 DockerHub 上下載 Image
docker pull wabilin/dmhy-subscribe
docker tag wabilin/dmhy-subscribe dmhy-subscribe

# 或自行 build image
docker build . -t dmhy-subscribe

```

執行腳本建立必要之檔案環境與設定檔。

這個腳本會建立 `data` 資料夾，包含了 `dmhy-subscribe` 、 `cron` 和 `aria2` 的設定檔。可以直接使用或依個人需求修改。

```sh
./setup.bash
```


## 執行方式

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

要執行 dmhy 指令可以透過以下方式:

```sh
# 進入 container 進行操作
docker exec -it dmhy sh

# 或直接傳送命令
# 以 dmhy ls 為例:
docker exec dmhy dmhy ls

```

## Aria2 設定

我們使用 [docker-aria2-with-webui](https://github.com/abcminiuser/docker-aria2-with-webui) 作為下載容器。如果要修改相關設定請參考連結說明。

為相容 MacOS，預設 `file-allocation` 為 `prealloc`，若系統允許可以更改 `data/aria2` 中的設定檔為更高速的 `falloc`。


## Docker Compose 設定

可以修改 docker-compose.yml 以進行設定。

### 重要設定
請使用 `id` 指令查看自己的 `UID` 和 `GID`，並將 docker-compose.yml 中的 `PUID` 和 `PGID` 分別設定為個人之 `UID` 與 `GID` ，以確保 aria2 有正確的讀寫權限。
