'use strict'

/**
 * `npm run db:shell` — open the MySQL command line client on the configured
 * database.
 *
 * Every connection detail comes from config/database.js, the same module the
 * server and the migrations use, so the shell cannot drift onto a different
 * host, port, schema or certificate than the app. Nothing about the connection
 * is repeated here.
 *
 *   npm run db:shell                       prompts for the password
 *   npm run db:shell -- --pw-env           reads it from backend/.env instead
 *   npm run db:shell -- -e "SELECT 1"      any mysql flag is passed through
 *
 * The password is never placed on the command line. By default the client
 * prompts for it; `--pw-env` hands it over through MYSQL_PWD, which stays out
 * of the process list. See SECURITY.md.
 */

const { spawn, spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const { clientFlags, connection } = require('../src/config/database')

/** Newest first, so an upgraded client wins over an older sibling. */
function installedClients() {
  if (process.env.DB_CLIENT) return [process.env.DB_CLIENT]

  const found = []
  for (const base of [
    'C:\\Program Files\\MySQL',
    'C:\\Program Files (x86)\\MySQL',
    path.join(process.env.LOCALAPPDATA ?? '', 'Programs', 'MySQL'),
  ]) {
    let entries = []
    try {
      entries = fs.readdirSync(base, { withFileTypes: true })
    } catch {
      continue
    }

    const servers = entries
      .filter((e) => e.isDirectory() && /^MySQL Server /i.test(e.name))
      .map((e) => ({
        name: e.name,
        // "MySQL Server 8.4" -> 8.4
        version: parseFloat(e.name.replace(/^MySQL Server\s*/i, '')) || 0,
        exe: path.join(base, e.name, 'bin', 'mysql.exe'),
      }))
      .filter((c) => fs.existsSync(c.exe))
      .sort((a, b) => b.version - a.version)

    found.push(...servers.map((s) => s.exe))
  }

  return found
}

/**
 * Resolve the client to run.
 *
 * `mysql` on PATH comes first, because a deliberate PATH entry should win.
 * Otherwise fall back to the standard install folder — which sidesteps the
 * versioned-folder trap, where a PATH entry keeps pointing at an old client
 * after an upgrade.
 */
function resolveClient() {
  const onPath = spawnSync('mysql', ['--version'], { stdio: 'ignore', shell: true })
  if (onPath.status === 0) return 'mysql'
  return installedClients()[0] ?? null
}

function main() {
  const argv = process.argv.slice(2)
  const useEnvPassword = argv.includes('--pw-env')
  const passthrough = argv.filter((a) => a !== '--pw-env')

  const client = resolveClient()
  if (!client) {
    console.error(
      '\n  Could not find the MySQL command line client.\n' +
        '    Looked on PATH and in C:\\Program Files\\MySQL.\n' +
        '    Set DB_CLIENT to the full path of mysql.exe, or add its folder to PATH.\n',
    )
    process.exit(1)
  }

  // No value after --password means the client prompts for it, so the secret
  // never reaches the process list or a shell history file.
  const flags = [...clientFlags(), useEnvPassword ? undefined : '--password', ...passthrough].filter(
    Boolean,
  )

  const child = spawn(client, flags, {
    stdio: 'inherit',
    env: useEnvPassword ? { ...process.env, MYSQL_PWD: connection.password } : process.env,
    // A Windows .exe needs the shell when spawned without an extension.
    shell: client === 'mysql',
  })

  child.on('error', (err) => {
    console.error(`[Yatrio] Could not start ${client}: ${err.message}`)
    process.exit(1)
  })

  child.on('exit', (code) => process.exit(code ?? 0))
}

main()