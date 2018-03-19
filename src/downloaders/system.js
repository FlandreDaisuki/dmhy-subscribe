const { open } = require('openurl')
const log = require('debug')('dmhy:downloaders:system')
const { console, l10n } = require('../utils')

const args = process.argv.slice(2)
const thread = JSON.parse(args[0])

log(args)

try {
  open(thread.link, () => {
    console.success(l10n('CLIENT_DL_SUCCESS_MSG', { title: thread.title }))
  })
} catch (err) {
  console.error(l10n('CLIENT_DL_FAILED_MSG', { title: thread.title }))
  console.error('Failed to start subprocess. %o', err)
}
