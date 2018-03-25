const open = require('opn')
const log = require('debug')('dmhy:downloaders:system')
const { console, l10n } = require('../utils')

const args = process.argv.slice(2)
const thread = JSON.parse(args[0])

log(args)

open(thread.link).then(() => {
  console.success(l10n('CLIENT_DL_SUCCESS_MSG', { title: thread.title }))
}).catch(err => {
  console.error(l10n('CLIENT_DL_FAILED_MSG', { title: thread.title }))
  console.error('Failed to start subprocess. %o', err)
})
