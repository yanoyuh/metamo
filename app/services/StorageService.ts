import { promises as fs } from 'fs'
import path from 'path'
import { loadEnv } from '@/utils/env'

export class StorageService {
  private storageRoot: string

  constructor() {
    const env = loadEnv()
    this.storageRoot = env.storageRoot
  }

  async createProjectDirectory(storagePath: string): Promise<void> {
    const projectRoot = path.join(this.storageRoot, storagePath)

    // ディレクトリ作成
    await fs.mkdir(path.join(projectRoot, 'assets'), { recursive: true })
    await fs.mkdir(path.join(projectRoot, 'current'), { recursive: true })
    await fs.mkdir(path.join(projectRoot, 'history'), { recursive: true })

    // config.json 作成
    const config = {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {},
    }

    await fs.writeFile(
      path.join(projectRoot, 'config.json'),
      JSON.stringify(config, null, 2),
      'utf-8'
    )
  }

  async saveAsset(
    storagePath: string,
    fileName: string,
    data: Buffer
  ): Promise<string> {
    const assetPath = path.join(this.storageRoot, storagePath, 'assets', fileName)
    await fs.writeFile(assetPath, data)
    return assetPath
  }

  async saveCurrent(
    storagePath: string,
    fileName: string,
    data: Buffer
  ): Promise<string> {
    const currentPath = path.join(this.storageRoot, storagePath, 'current', fileName)
    await fs.writeFile(currentPath, data)
    return currentPath
  }

  async saveHistory(
    storagePath: string,
    sequenceNumber: number,
    ext: string,
    data: Buffer
  ): Promise<string> {
    const historyPath = path.join(
      this.storageRoot,
      storagePath,
      'history',
      `${sequenceNumber}.${ext}`
    )
    await fs.writeFile(historyPath, data)
    return historyPath
  }

  async loadCurrent(storagePath: string, fileName: string): Promise<Buffer> {
    const currentPath = path.join(this.storageRoot, storagePath, 'current', fileName)
    return await fs.readFile(currentPath)
  }

  async loadHistory(
    storagePath: string,
    sequenceNumber: number,
    ext: string
  ): Promise<Buffer> {
    const historyPath = path.join(
      this.storageRoot,
      storagePath,
      'history',
      `${sequenceNumber}.${ext}`
    )
    return await fs.readFile(historyPath)
  }

  async updateConfig(storagePath: string, config: any): Promise<void> {
    const configPath = path.join(this.storageRoot, storagePath, 'config.json')
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8')
  }

  async getConfig(storagePath: string): Promise<any> {
    const configPath = path.join(this.storageRoot, storagePath, 'config.json')
    const content = await fs.readFile(configPath, 'utf-8')
    return JSON.parse(content)
  }
}
