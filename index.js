#!/usr/bin/env node

import { intro, text, spinner, multiselect, note, confirm, cancel, outro, isCancel } from '@clack/prompts'
import pc from 'picocolors'
import { readdir, stat, rm, opendir } from 'fs/promises'
import { join } from 'path'
import { cwd, argv, exit } from 'process'

const HEAVY_PATTERNS = new Set([
  'node_modules', '.next', '.nuxt', '.turbo',
  'dist', 'build', '.DS_Store',
  '__pycache__', '.cache', 'coverage', 'out', 'target', '.parcel-cache',
])

function formatSize(bytes) {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(2)} KB`
  return `${bytes} B`
}

function colorSize(bytes) {
  const s = formatSize(bytes)
  if (bytes >= 500e6) return pc.red(s)
  if (bytes >= 100e6) return pc.yellow(s)
  return pc.green(s)
}

function sizeBar(bytes, maxBytes, width = 10) {
  const filled = maxBytes > 0 ? Math.round((bytes / maxBytes) * width) : 0
  const empty = width - filled
  return pc.cyan('\u2588'.repeat(filled)) + pc.dim('\u2591'.repeat(Math.max(0, empty)))
}

function handleCancel(val) {
  if (isCancel(val)) {
    cancel('Operation cancelled')
    exit(0)
  }
  return val
}

function makeRelativePath(root, fullPath) {
  const rel = fullPath.slice(root.length).replace(/\\/g, '/')
  return rel || '/'
}

async function findTargets(rootPath) {
  const targets = []

  async function walk(dir) {
    let entries
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      return
    }

    const subDirs = []

    for (const entry of entries) {
      if (HEAVY_PATTERNS.has(entry.name)) {
        targets.push({
          path: join(dir, entry.name),
          name: entry.name,
          isDirectory: entry.isDirectory(),
        })
      } else if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        subDirs.push(join(dir, entry.name))
      }
    }

    await Promise.all(subDirs.map(d => walk(d)))
  }

  await walk(rootPath)
  return targets
}

async function getDirectorySize(dir) {
  let total = 0
  let dirHandle
  try {
    dirHandle = await opendir(dir)
  } catch {
    return 0
  }

  for await (const entry of dirHandle) {
    const fullPath = join(dir, entry.name)
    try {
      if (entry.isDirectory()) {
        total += await getDirectorySize(fullPath)
      } else if (entry.isFile()) {
        total += (await stat(fullPath)).size
      }
    } catch {
      // skip permission errors
    }
  }
  return total
}

async function calculateSizes(targets) {
  const results = await Promise.allSettled(
    targets.map(async (t) => {
      const size = t.isDirectory
        ? await getDirectorySize(t.path)
        : (await stat(t.path)).size
      return { ...t, size }
    })
  )
  return results.filter(r => r.status === 'fulfilled').map(r => r.value)
}

async function runDryRun(scanPath) {
  console.log('\n' + pc.bold(pc.cyan(' \u26a1 ZapDir \u2014 Dry Run')))
  console.log(pc.dim(' \u2500'.repeat(48)) + '\n')

  const spin = clackSpinner()
  spin.start(pc.cyan('Scanning for junk...'))

  const targets = await findTargets(scanPath)
  const withSizes = await calculateSizes(targets)
  const sorted = withSizes.sort((a, b) => b.size - a.size)

  spin.stop(pc.green(`Found ${pc.bold(sorted.length)} junk item(s)`))

  if (sorted.length === 0) {
    console.log('\n  ' + pc.green('\u2728 Your project looks clean!') + '\n')
    console.log(pc.dim(' \u2500'.repeat(48)))
    console.log('  ' + pc.dim('No files were modified.'))
    return
  }

  const totalWaste = sorted.reduce((acc, t) => acc + t.size, 0)
  const maxSize = sorted[0].size

  console.log()
  for (const t of sorted) {
    const rel = makeRelativePath(scanPath, t.path)
    console.log(
      '  ' +
      sizeBar(t.size, maxSize) + '  ' +
      pc.bold(t.name.padEnd(16)) +
      pc.dim(rel.slice(0, 60)) +
      '  ' +
      colorSize(t.size)
    )
  }

  console.log('\n' + pc.dim(' \u2500'.repeat(48)))
  console.log('  ' + pc.bold(`Total: ${colorSize(totalWaste)} across ${sorted.length} item(s)`))
  console.log('  ' + pc.dim('No files were deleted. Run without --dry-run to clean.'))
}

function clackSpinner() {
  return spinner()
}

async function runInteractive(scanPath) {
  intro(pc.bold(pc.cyan(' \u26a1 ZapDir \u2014 Terminal Cleanup Tool')))

  const resolvedPath = handleCancel(
    await text({
      message: pc.cyan('Which directory should I scan?'),
      placeholder: scanPath,
      defaultValue: scanPath,
    })
  )

  const spin = spinner()
  spin.start(pc.cyan('Scanning for junk...'))

  const targets = await findTargets(resolvedPath)
  const withSizes = await calculateSizes(targets)
  const sorted = withSizes.sort((a, b) => b.size - a.size)

  spin.stop(pc.green(`Found ${pc.bold(sorted.length)} junk item(s)`))

  if (sorted.length === 0) {
    note(pc.green('Your project looks clean! No junk folders found.'), '\u2728 All Clear')
    outro(pc.dim('Nothing to do. Exiting.'))
    return
  }

  const totalWaste = sorted.reduce((acc, t) => acc + t.size, 0)

  const summaryLines = sorted.map(t => {
    const rel = makeRelativePath(resolvedPath, t.path)
    return `  ${t.name.padEnd(16)} ${pc.dim(rel)}  ${colorSize(t.size)}`
  }).join('\n')

  note(
    pc.bold(pc.cyan('Total recoverable: ') + pc.bold(colorSize(totalWaste))) +
    '\n\n' +
    summaryLines,
    '\ud83d\uddd1\ufe0f  Junk Found'
  )

  const selected = handleCancel(
    await multiselect({
      message: pc.cyan('Select items to delete') + pc.dim(` (${formatSize(totalWaste)} recoverable)`),
      options: sorted.map(t => ({
        value: t.path,
        label: `${t.name}  ${pc.dim(makeRelativePath(resolvedPath, t.path))}`,
        hint: colorSize(t.size),
      })),
      required: false,
    })
  )

  if (!selected || selected.length === 0) {
    outro(pc.dim('No items selected. Exiting.'))
    return
  }

  const selectedItems = sorted.filter(t => selected.includes(t.path))
  const selectedTotal = selectedItems.reduce((acc, t) => acc + t.size, 0)

  const confirmed = handleCancel(
    await confirm({
      message:
        pc.cyan('Delete ') +
        pc.bold(`${selected.length} item(s)`) +
        pc.cyan(' freeing ') +
        pc.bold(pc.green(formatSize(selectedTotal))) +
        pc.cyan('?'),
      active: 'Yes, delete them',
      inactive: 'No, keep them',
    })
  )

  if (!confirmed) {
    outro(pc.dim('Cancelled. Nothing was deleted.'))
    return
  }

  const delSpin = spinner()
  delSpin.start(pc.cyan('Deleting selected junk...'))

  const results = await Promise.allSettled(
    selectedItems.map(t =>
      rm(t.path, { recursive: true, force: true }).then(() => t)
    )
  )

  const succeeded = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected')

  const failedTotal = failed
    .map(r => r.reason)
    .filter(Boolean)
    .reduce((sum, err) => sum + 1, 0)

  delSpin.stop(
    pc.green(`Deleted ${succeeded} item(s)`) +
    (failedTotal > 0 ? pc.red(`, ${failedTotal} failed`) : '')
  )

  if (failed.length > 0) {
    for (const f of failed) {
      console.log(pc.dim(`  \u2716 ${f.reason?.message || 'Unknown error'}`))
    }
  }

  outro(
    pc.bold(pc.green(` \u2713 Freed ${formatSize(selectedTotal)} of disk space!`)) +
    '\n' +
    pc.dim('  Your disk thanks you.')
  )
}

async function main() {
  const args = argv.slice(2)
  const isDryRun = args.includes('--dry-run')
  const positionalPath = args.find(a => !a.startsWith('-'))

  const scanPath = positionalPath || cwd()

  if (isDryRun) {
    await runDryRun(scanPath)
  } else {
    await runInteractive(scanPath)
  }
}

main().catch((err) => {
  cancel(pc.red(`Unexpected error: ${err.message}`))
  exit(1)
})
