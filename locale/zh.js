module.exports = {
  MAIN_HELP_MSG: `
  例子:

    $ dmhy add '紫羅蘭永恆花園,動漫國,繁體,1080P'
    $ dmhy

    或

    $ dmhy --client aria2
  `,
  MAIN_OPT_DESTINATION_MSG: '下載路徑 (預設: 預設下載資料夾)',
  MAIN_OPT_CLIENT_MSG: '強制使用指定下載器。 <client>: "aria2", "deluge"(預設)',
  MAIN_OPT_JSONRPC_MSG: 'jsonrpc url for --client=aria2',
  CMD_ADD_OPT_FILE_MSG: '從檔案新增 {訂閱}',
  CMD_ADD_OPT_YES_MSG: '如果 {可訂閱字串} 名字存在，自動加入',
  CMD_ADD_OPT_NO_MSG: '如果 {可訂閱字串} 名字存在，自動捨棄',
  CMD_ADD_DESC_MSG: '使用 {可訂閱字串} 新增 {訂閱}',
  CMD_ADD_EXISTED_QUESTION_MSG: '訂閱{%name%} 已存在, 繼續新增? [y/n]:',
  CMD_ADD_HELP_MSG: `
  詳細解釋:

  一個 {可訂閱字串} 需要包含一個名字和讓訂閱更精準的一連串關鍵字。
  使用 CSV 格式將他們串起來。

  例子:

    直接使用 {可訂閱字串}:
      $ dmhy add '紫羅蘭永恆花園,動漫國,繁體,1080P'
      $ dmhy add '紫羅蘭永恆花園,動漫國,繁體,1080P' 'pop team epic,極影,BIG5'

    從檔案新增:
      $ dmhy ls --subscribable > a.txt  # 輸出所有 {可訂閱字串} 到 a.txt
      $ dmhy rm --all                   # 刪除所有 {訂閱}
      $ dmhy add --file a.txt           # 從 a.txt 新增 {訂閱}
  `,
  CMD_RM_OPT_ALL_MSG: '刪除所有 {訂閱}',
  CMD_RM_DESC_MSG: '根據 {sid} 刪除 {訂閱}',
  CMD_RM_NOTFOUND_MSG: '找不到 {訂閱} 為此 {sid}: %sid%.',
  CMD_RM_HELP_MSG: `
  詳細解釋:

  可以從指令\`dmhy list\`查詢 {訂閱} 的 {sid}。

  例子:

    $ dmhy rm XYZ ABC
    $ dmhy rm --all
  `,
  CMD_LS_OPT_SUBSCRIBABLE_MSG: '列出所有已訂閱的 {可訂閱字串}',
  CMD_LS_DESC_MSG: '列出所有 {訂閱} 或指定 {訂閱} 的詳細資訊',
  CMD_LS_HELP_MSG: `
  例子:

    $ dmhy list ABC
    $ dmhy ls -s
  `,
  CMD_DL_DESC_MSG: '根據 {thid} 下載 {訂閱} 中的 {貼文}',
  CMD_DL_UNKNOWN_CLIENT_MSG: '未知的下載器: %client%.',
  CMD_DL_HELP_MSG: `
  詳細解釋:

  {thid} 的格式: {sid}-{ep}
  {ep} 的格式: 整數 | 小數 | {整數|小數}..{整數|小數} | {ep},{ep} | 'all'
  如果 {thid} 只有 {sid} 表示 {sid}-all。

  例子:

    $ dmhy ls
    sid  latest  name
    ---  ------  --------------
    AAA  09      動畫AAA
    BBB  07      動畫BBB(其中有5.5集)

    $ dmhy download AAA-01 BBB-5.5,7 # 下載 1 + 2 個 {貼文}

    相當於下列指令

    $ dmhy download AAA-01 BBB-5.5 BBB-7

    也支援不同的下載器

    $ dmhy --client aria2 download AAA BBB

  更複雜的例子:

    $ dmhy dl AAA BBB-5..6,9 # 下載 9 + 3 個 {貼文}

    上面指令會下載「動畫AAA」所有 {貼文} 及「動畫BBB」第 5, 5.5, 6 集的 {貼文}

    若「動畫AAA」有合集：

    $ dmhy ls AAA
    Episode  Title
    -------  --------------
    1        [字幕組][動畫AAA][01]
    2,3      [字幕組][動畫AAA][02-03]

    $ dmhy dl AAA-02 # 下載該包含兩集的 {貼文}
  `,
  CMD_FIND_OPT_RAW_MSG: '顯示 JSON 結果',
  CMD_FIND_DESC_MSG: '直接搜尋 dmhy 網頁結果 (關鍵字用半形逗號分開)',
  CMD_FIND_SUMMARY_MSG: '找到 %total% 個結果',
  CMD_FIND_HELP_MSG: '',
  CMD_UPDATE_DESC_MSG: '只更新已訂閱的 {訂閱} 但不下載',
  CMD_UPDATE_UPDATED_MSG: '已更新: %title%',
  CMD_UPDATE_HELP_MSG: '',
  UNHANDLED_EP_PARSING_MSG: '這行只有在出現 bug 時會印出。\n請將下面印出的資訊貼上到 https://github.com/FlandreDaisuki/dmhy-subscribe/issues 回報'
}
