# webhook

webhook 會對目標伺服器 `webhook-url` 發送一個 `POST` 請求，內容如下：

```json
{
  "title": "標題",
  "magnet": "magnet 連結"
}
```

## 驗證

如果伺服器在收到任何請求就直接下載 `magnet` 中的檔案是很危險的，不過這可以透過 `x-dmhy-token` 這個 header 來驗證。

首先請先設定一個只有你知道的 token：

```bash
$ dmhy config webhook-token YOUR_TOKEN
```

接下來請在伺服器比較 `x-dmhy-token` 的內容與 `YOUR_TOKEN` 是否相同，若不相同代表這個 request 可能是假的。

### Express 範例

假設有一檔案 `~/app/server.mjs` 如下：

```js
import express from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());

app.post('/download', (req, res) => {
  const token = req.headers['x-dmhy-token'];
  const expectedToken = process.env.TOKEN;

  if (!token || token !== expectedToken) {
    res.status(403).send('Forbidden');
  } else {
    console.log(req.body);
    res.json(req.body);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
```

將 `TOKEN` 帶入並將 server 跑起來（假設 `TOKEN` 為 `hello-dmhy-subscribe`）

```sh
$ cd ~/app
$ npm init -y
$ npm i express
$ TOKEN='hello-dmhy-subscribe' node ~/app/server.mjs
Server listening on port 3000 # 看到這行代表 server 已經跑起來了
```

接著打開另一個 shell 設定 `dmhy`:

```sh
dmhy config downloader webhook
dmhy config webhook-url 'http://localhost:3000/download'
dmhy config webhook-token 'hello-dmhy-subscribe'
```

完成後就可以試著下載了！

```sh
dmhy add 孤獨搖滾 動漫國 1080 繁體 -x 全集
dmhy pull --then-download #更新並下載全部

# 接著在看到 server 那一個 shell 跳出很多訊息就代表成功了
```

<!-- markdownlint-disable-next-line no-bare-urls -->
https://github.com/FlandreDaisuki/dmhy-subscribe/assets/5981459/b507cd4c-a719-445d-8ef3-e812afd677b1
