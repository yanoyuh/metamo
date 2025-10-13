import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ProjectService } from './ProjectService'
import { PrismaClient } from '@prisma/client'

const mockPrisma = {
  userProject: {
    findMany: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  userPlan: {
    findFirst: vi.fn(),
  },
} as unknown as PrismaClient

const mockStorageService = {
  createProjectDirectory: vi.fn(),
}

describe('ProjectService', () => {
  let projectService: ProjectService

  beforeEach(() => {
    vi.clearAllMocks()
    projectService = new ProjectService(mockPrisma, mockStorageService as any)
  })

  describe('listProjects', () => {
    it('should return list of user projects', async () => {
      const userId = 'user-uuid-1'
      const mockProjects = [
        {
          id: 'project-uuid-1',
          user_id: userId,
          name: 'Project 1',
          description: 'Test project',
          thumbnail: null,
          storage_path: 'projects/user-uuid-1/project-uuid-1',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]

      mockPrisma.userProject.findMany.mockResolvedValue(mockProjects)

      const result = await projectService.listProjects(userId)

      expect(mockPrisma.userProject.findMany).toHaveBeenCalledWith({
        where: { user_id: userId },
        orderBy: { updated_at: 'desc' },
      })
      expect(result).toEqual(mockProjects)
    })
  })

  describe('createProject', () => {
    it('should create a new project with storage directory', async () => {
      const userId = 'user-uuid-1'
      const name = 'New Project'
      const description = 'Test description'

      const mockProjectInitial = {
        id: 'project-uuid-1',
        user_id: userId,
        name,
        description,
        thumbnail: null,
        storage_path: '',
        created_at: new Date(),
        updated_at: new Date(),
      }

      const mockProjectUpdated = {
        ...mockProjectInitial,
        storage_path: `projects/${userId}/project-uuid-1`,
      }

      mockPrisma.userProject.create.mockResolvedValue(mockProjectInitial)
      mockPrisma.userProject.update.mockResolvedValue(mockProjectUpdated)
      mockStorageService.createProjectDirectory.mockResolvedValue(undefined)

      const result = await projectService.createProject(userId, name, description)

      expect(mockPrisma.userProject.create).toHaveBeenCalled()
      expect(mockPrisma.userProject.update).toHaveBeenCalled()
      expect(mockStorageService.createProjectDirectory).toHaveBeenCalledWith(
        expect.stringContaining(`projects/${userId}/`)
      )
      expect(result).toEqual(mockProjectUpdated)
    })
  })

  describe('getProject', () => {
    it('should return project details', async () => {
      const projectId = 'project-uuid-1'
      const mockProject = {
        id: projectId,
        user_id: 'user-uuid-1',
        name: 'Project 1',
        description: 'Test project',
        thumbnail: null,
        storage_path: 'projects/user-uuid-1/project-uuid-1',
        created_at: new Date(),
        updated_at: new Date(),
      }

      mockPrisma.userProject.findUnique.mockResolvedValue(mockProject)

      const result = await projectService.getProject(projectId)

      expect(mockPrisma.userProject.findUnique).toHaveBeenCalledWith({
        where: { id: projectId },
      })
      expect(result).toEqual(mockProject)
    })

    it('should return null when project not found', async () => {
      mockPrisma.userProject.findUnique.mockResolvedValue(null)

      const result = await projectService.getProject('non-existent-id')

      expect(result).toBeNull()
    })
  })

  describe('updateProject', () => {
    it('should update project name and description', async () => {
      const projectId = 'project-uuid-1'
      const updates = { name: 'Updated Name', description: 'Updated description' }

      const mockUpdatedProject = {
        id: projectId,
        user_id: 'user-uuid-1',
        ...updates,
        thumbnail: null,
        storage_path: 'projects/user-uuid-1/project-uuid-1',
        created_at: new Date(),
        updated_at: new Date(),
      }

      mockPrisma.userProject.update.mockResolvedValue(mockUpdatedProject)

      const result = await projectService.updateProject(projectId, updates)

      expect(mockPrisma.userProject.update).toHaveBeenCalledWith({
        where: { id: projectId },
        data: updates,
      })
      expect(result).toEqual(mockUpdatedProject)
    })
  })

  describe('deleteProject', () => {
    it('should soft delete project', async () => {
      const projectId = 'project-uuid-1'

      const mockDeletedProject = {
        id: projectId,
        user_id: 'user-uuid-1',
        name: 'Project 1',
        description: null,
        thumbnail: null,
        storage_path: 'projects/user-uuid-1/project-uuid-1',
        created_at: new Date(),
        updated_at: new Date(),
      }

      mockPrisma.userProject.update.mockResolvedValue(mockDeletedProject)

      const result = await projectService.deleteProject(projectId)

      expect(mockPrisma.userProject.update).toHaveBeenCalledWith({
        where: { id: projectId },
        data: { updated_at: expect.any(Date) },
      })
      expect(result).toEqual(mockDeletedProject)
    })
  })
})
