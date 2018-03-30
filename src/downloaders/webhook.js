const axios = require('axios')
const log = require('debug')('dmhy:downloaders:webhook')
const { console, l10n } = require('../utils')

const args = process.argv.slice(2)
const thread = JSON.parse(args[0])
const { webhook } = JSON.parse(args[1])

log(args)

axios
  .post(webhook, thread)
  .then(() => console.success(l10n('CLIENT_DL_SUCCESS_MSG', { title: thread.title })))
  .catch(() => console.error(l10n('CLIENT_DL_FAILED_MSG', { title: thread.title })))
