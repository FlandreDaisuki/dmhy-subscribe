# 自動排程

寫一個搭配自動排程檢查並下載我要的字幕組是這個工具的初衷，下面介紹幾種搭配排程的方法。

- [Linux cron/crontab](#linux-croncrontab)
- [Windows 10 排程](#windows-10-排程)

## Linux cron/crontab

確定 `dmhy-subscribe` 確實安裝完成：

```bash
$ dmhy --version
1.0.0 # 有版本跳出來
```

加入到 crontab

```bash
$ (crontab -l 2>/dev/null; echo "0 * * * * $(which dmhy) pull --then-download") | crontab -
```

其中 `0 * * * *` 為 cron 語法，表示每小時 0 分時執行，語法詳細請參考[鳥哥](http://linux.vbird.org/linux_basic/0430cron.php#crontab)的介紹

## Windows 10 排程

到 PowerShell 執行並記住 Source 路徑

```powershell
PS C:\> Get-Command dmhy
```

1. 執行 `taskschd.msc` 或是 Windows 10 的尋找功能打 `工作排程器` 即可開啟
2. 建立基本工作 {名稱: 隨便, 描述：隨便} → 下一步
3. 每天 (之後可以調整) → 下一步 → (開始時間之後可以調整) → 下一步
4. 動作：啟動程式 → 下一步
5. 程式路徑：`{剛剛的 Source 路徑} pull --then-download` → 完成
6. 之後可到左邊側欄的 `工作排程器程式庫` 找到這個工作重新設定

測試是否成功

1. 到 PowerShell 隨便新增一筆訂閱

   ```powershell
   PS C:\> dmhy add 搖曳露營 喵萌 繁體 yuru -x 合集 電影
   PS C:\> dmhy ls
   ┌─────┬──────────┬──────────┐
   │ sid │ 最新集數  │  訂閱標題 │
   ├─────┼──────────┼──────────┤
   │ BNS │    ??    │ 搖曳露營  │
   └─────┴──────────┴──────────┘
   ```

2. 到 `工作排程器程式庫` 找到這個工作 → 右鍵[執行]
3. 在輸入一次 `dmhy ls`，有最新集數就成功了

   ```powershell
   PS C:\> dmhy ls
   ┌─────┬──────────┬──────────┐
   │ sid │ 最新集數  │  訂閱標題 │
   ├─────┼──────────┼──────────┤
   │ BNS │    12    │ 搖曳露營  │
   └─────┴──────────┴──────────┘
   ```

<!-- cSpell:ignore taskschd -->
