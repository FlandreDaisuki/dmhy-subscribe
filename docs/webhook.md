# webhook

webhook 會對目標伺服器 `webhook-url` 發送一個 `POST` 請求，內容大致如下

```json
{
  "title": "標題",
  "link": "magnet 連結"
}
```

## 驗證

如果伺服器在收到任何請求就直接下載 `link` 中的檔案是很危險的，不過這可以透過 `x-dmhy-token` 這個 header 來驗證。

首先請先設定一個只有你知道的 token：

```shell
$ dmhy config webhook-token YOUR_TOKEN
```

接下來請在伺服器比較 `x-dmhy-token` 的內容與 `sha1("YOUR_TOKEN")` 是否相同，若不相同代表這個 request 可能是假的。

### Express 範例

```js
const app = require('express')();
const crypto = require('crypto');

const TOK = 'YOUR_TOKEN'; // 這邊輸入你的 dmhy config webhook-token 的值

const enc = crypto
  .createHash('sha1')
  .update(TOK)
  .digest('hex');

app.all('*', (req, res) => {
  const tok = req.headers['x-dmhy-token'];
  if(tok === enc){
    res.end();
  }
  else{
    res.status(403).end();
  }
});

app.listen(1234);
```
