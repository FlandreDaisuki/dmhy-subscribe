module.exports = {
  MAIN_HELP_MSG: `
  Examples:

    $ dmhy add '紫羅蘭永恆花園,動漫國,繁體,1080P'
    $ dmhy

    or

    $ dmhy --client aria2
  `,
  MAIN_OPT_DESTINATION_MSG: 'Download destination. (default: user downloads folder)',
  MAIN_OPT_CLIENT_MSG: 'Force using downloader. <client>: "aria2", "deluge"(default)',
  MAIN_OPT_JSONRPC_MSG: 'jsonrpc url for --client=aria2',
  CMD_ADD_OPT_FILE_MSG: 'Add {subscription}s from the file contains {subscribable}s.',
  CMD_ADD_OPT_YES_MSG: 'Always add if {subscribable} name existed.',
  CMD_ADD_OPT_NO_MSG: 'Never add if {subscribable} name existed.',
  CMD_ADD_DESC_MSG: 'Add {subscribable} to subscribe.',
  CMD_ADD_EXISTED_QUESTION_MSG: 'The subscription{%name%} is existed, still add? [y/n]:',
  CMD_ADD_HELP_MSG: `
  Details:

  A {subscribable} contains a name and following keywords to identify series
  you want to download, then joins them by CSV format in a string.

  Examples:

    Direct:
      $ dmhy add '紫羅蘭永恆花園,動漫國,繁體,1080P'
      $ dmhy add '紫羅蘭永恆花園,動漫國,繁體,1080P' 'pop team epic,極影,BIG5'

    File:
      $ dmhy ls --subscribable > a.txt  # output all {subscribable}s to a.txt
      $ dmhy rm --all                   # remove all {subscription}
      $ dmhy add --file a.txt           # add {subscription}s from a.txt
  `,
  CMD_RM_OPT_ALL_MSG: 'Remove all subscribed {subscription}.',
  CMD_RM_DESC_MSG: 'Remove {subscription} by {sid}.',
  CMD_RM_NOTFOUND_MSG: 'Not found subscription with sid: %sid%.',
  CMD_RM_HELP_MSG: `
  Details:

  The {sid} are listed at \`dmhy list\`.

  Examples:

    $ dmhy rm XYZ ABC
    $ dmhy rm --all
  `,
  CMD_LS_OPT_SUBSCRIBABLE_MSG: 'List subscribable format.',
  CMD_LS_DESC_MSG: 'List the {subscription}s or the {thread}s of the {subscription}s.',
  CMD_LS_HELP_MSG: `
  Examples:

    $ dmhy list ABC
    $ dmhy ls -s
  `,
  CMD_DL_DESC_MSG: 'Download the {thread}s of the {subsciption}s which are subscribed in list.',
  CMD_DL_UNKNOWN_CLIENT_MSG: 'Unknown client: %client%.',
  CMD_DL_HELP_MSG: `
  Details:

  The {thid} format: {sid}-{ep}
  The {ep} format: int | float | {int|float}..{int|float} | {ep},{ep} | 'all'
  If only {sid}, means {sid}-all.

  Examples:

    $ dmhy ls
    sid  latest  name
    ---  ------  --------------
    AAA  09      nameAAA
    BBB  07      nameBBB(which has ep5.5)

    $ dmhy download AAA-01 BBB-5.5,7 # download (1 + 2) threads

    which is the same as following

    $ dmhy download AAA-01 BBB-5.5 BBB-7

    also support different downloader

    $ dmhy --client aria2 download AAA BBB

  More complicated examples:

    $ dmhy dl AAA BBB-5..6,9 # download (9 + 3) threads

    which download all AAA threads and ep 5, 5.5, 6 in BBB threads

    $ dmhy ls AAA
    Episode  Title
    -------  --------------
    1        [字幕組][nameAAA][01]
    2,3      [字幕組][nameAAA][02-03]

    $ dmhy dl AAA-02 # download 1 threads which has 2 episodes
  `,
  CMD_FIND_OPT_RAW_MSG: 'Print a json array of threads to console.',
  CMD_FIND_DESC_MSG: 'Show the search results of the keyword. (seperated by comma)',
  CMD_FIND_SUMMARY_MSG: 'Total %total% result(s).',
  CMD_FIND_HELP_MSG: '',
  CMD_UPDATE_DESC_MSG: 'Just update {description}s without downloading.',
  CMD_UPDATE_UPDATED_MSG: 'Updated: %title%',
  CMD_UPDATE_HELP_MSG: '',
  UNHANDLED_EP_PARSING_MSG: 'This should never print unless having bugs.\nPlease paste following information to https://github.com/FlandreDaisuki/dmhy-subscribe/issues.'
}
