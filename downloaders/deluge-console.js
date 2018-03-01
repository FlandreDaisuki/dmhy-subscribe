const { spawn } = require('child_process')
const log = require('debug')('dmhy:downloaders:deluge+console')

const args = process.argv.slice(2)
const thread = JSON.parse(args[0])

log(args)

const task = spawn('deluge-console', ['add', thread.link])
log(`start deluge-console on pid ${task.pid}`)

task.on('close', code => {
  if (code === 0) {
    console.log(`Download ${thread.title}`)
  } else {
    console.error(`Failed to download ${thread.title}.`)
  }
})
task.on('error', err => {
  console.error('Failed to start subprocess. %o', err)
})
