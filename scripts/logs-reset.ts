import fs from 'fs/promises'
import path from 'path'

async function resetLogs() {
  try {
    const logsPath = path.join(process.cwd(), 'logs')

    // Check if logs directory exists
    try {
      await fs.access(logsPath)

      // Remove all log files in logs/
      const entries = await fs.readdir(logsPath)
      for (const entry of entries) {
        if (entry !== '.gitkeep') {
          await fs.rm(path.join(logsPath, entry), { force: true })
          console.log(`✓ Removed ${entry}`)
        }
      }
    } catch (error) {
      // Directory doesn't exist, create it
      await fs.mkdir(logsPath, { recursive: true })
      console.log(`✓ Created ${logsPath}`)
    }

    // Ensure .gitkeep exists
    await fs.writeFile(path.join(logsPath, '.gitkeep'), '')
    console.log('✅ Logs reset completed')
  } catch (error) {
    console.error('❌ Logs reset failed:', error)
    process.exit(1)
  }
}

resetLogs()
