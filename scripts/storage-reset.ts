import fs from 'fs/promises'
import path from 'path'

const STORAGE_ROOT = process.env.STORAGE_ROOT || 'storages/storage1'

async function resetStorage() {
  try {
    const projectsPath = path.join(process.cwd(), STORAGE_ROOT, 'projects')

    // Check if projects directory exists
    try {
      await fs.access(projectsPath)

      // Remove all subdirectories in projects/
      const entries = await fs.readdir(projectsPath, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.isDirectory()) {
          await fs.rm(path.join(projectsPath, entry.name), { recursive: true, force: true })
          console.log(`✓ Removed ${entry.name}`)
        }
      }
    } catch (error) {
      // Directory doesn't exist, create it
      await fs.mkdir(projectsPath, { recursive: true })
      console.log(`✓ Created ${projectsPath}`)
    }

    // Ensure .gitkeep exists
    await fs.writeFile(path.join(projectsPath, '.gitkeep'), '')
    console.log('✅ Storage reset completed')
  } catch (error) {
    console.error('❌ Storage reset failed:', error)
    process.exit(1)
  }
}

resetStorage()
