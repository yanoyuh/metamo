import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { StorageService } from './StorageService'
import { promises as fs } from 'fs'
import path from 'path'

// 環境変数をモック
vi.mock('@/utils/env', () => ({
  loadEnv: () => ({
    storageRoot: 'storages/test-storage',
    supabaseUrl: 'http://localhost:54321',
    supabaseAnonKey: 'test-key',
    appUrl: 'http://localhost:3000',
    nodeEnv: 'test',
  }),
}))

describe('StorageService', () => {
  let storageService: StorageService
  const testStoragePath = 'test-user/test-project'
  const testStorageRoot = 'storages/test-storage'

  beforeEach(() => {
    storageService = new StorageService()
  })

  afterEach(async () => {
    // テスト後にクリーンアップ
    try {
      await fs.rm(path.join(testStorageRoot, testStoragePath), {
        recursive: true,
        force: true,
      })
    } catch (error) {
      // ディレクトリが存在しない場合は無視
    }
  })

  describe('createProjectDirectory', () => {
    it('should create project directory structure', async () => {
      await storageService.createProjectDirectory(testStoragePath)

      const projectRoot = path.join(testStorageRoot, testStoragePath)

      // ディレクトリの存在確認
      const assetsStat = await fs.stat(path.join(projectRoot, 'assets'))
      expect(assetsStat.isDirectory()).toBe(true)

      const currentStat = await fs.stat(path.join(projectRoot, 'current'))
      expect(currentStat.isDirectory()).toBe(true)

      const historyStat = await fs.stat(path.join(projectRoot, 'history'))
      expect(historyStat.isDirectory()).toBe(true)

      // config.json の存在確認
      const configPath = path.join(projectRoot, 'config.json')
      const configContent = await fs.readFile(configPath, 'utf-8')
      const config = JSON.parse(configContent)

      expect(config).toHaveProperty('created_at')
      expect(config).toHaveProperty('updated_at')
      expect(config).toHaveProperty('metadata')
    })
  })

  describe('saveAsset and file operations', () => {
    beforeEach(async () => {
      await storageService.createProjectDirectory(testStoragePath)
    })

    it('should save asset file', async () => {
      const fileName = 'test-image.png'
      const data = Buffer.from('test image data')

      const savedPath = await storageService.saveAsset(
        testStoragePath,
        fileName,
        data
      )

      expect(savedPath).toContain('assets')
      expect(savedPath).toContain(fileName)

      const savedData = await fs.readFile(savedPath)
      expect(savedData.toString()).toBe('test image data')
    })

    it('should save current file', async () => {
      const fileName = 'current.png'
      const data = Buffer.from('current image data')

      const savedPath = await storageService.saveCurrent(
        testStoragePath,
        fileName,
        data
      )

      expect(savedPath).toContain('current')
      expect(savedPath).toContain(fileName)

      const savedData = await fs.readFile(savedPath)
      expect(savedData.toString()).toBe('current image data')
    })

    it('should save history file with sequence number', async () => {
      const sequenceNumber = 1
      const ext = 'png'
      const data = Buffer.from('history image data')

      const savedPath = await storageService.saveHistory(
        testStoragePath,
        sequenceNumber,
        ext,
        data
      )

      expect(savedPath).toContain('history')
      expect(savedPath).toContain('1.png')

      const savedData = await fs.readFile(savedPath)
      expect(savedData.toString()).toBe('history image data')
    })

    it('should load current file', async () => {
      const fileName = 'current.png'
      const data = Buffer.from('current image data')

      await storageService.saveCurrent(testStoragePath, fileName, data)
      const loadedData = await storageService.loadCurrent(testStoragePath, fileName)

      expect(loadedData.toString()).toBe('current image data')
    })

    it('should load history file', async () => {
      const sequenceNumber = 1
      const ext = 'png'
      const data = Buffer.from('history image data')

      await storageService.saveHistory(testStoragePath, sequenceNumber, ext, data)
      const loadedData = await storageService.loadHistory(
        testStoragePath,
        sequenceNumber,
        ext
      )

      expect(loadedData.toString()).toBe('history image data')
    })
  })

  describe('config management', () => {
    beforeEach(async () => {
      await storageService.createProjectDirectory(testStoragePath)
    })

    it('should update config', async () => {
      const newConfig = {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          ai_model: 'gemini-2.0-flash-exp',
          last_edited: new Date().toISOString(),
        },
      }

      await storageService.updateConfig(testStoragePath, newConfig)

      const config = await storageService.getConfig(testStoragePath)

      expect(config.metadata.ai_model).toBe('gemini-2.0-flash-exp')
      expect(config.metadata).toHaveProperty('last_edited')
    })

    it('should get config', async () => {
      const config = await storageService.getConfig(testStoragePath)

      expect(config).toHaveProperty('created_at')
      expect(config).toHaveProperty('updated_at')
      expect(config).toHaveProperty('metadata')
    })
  })
})
