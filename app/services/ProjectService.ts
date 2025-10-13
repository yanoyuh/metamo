import { PrismaClient, UserProject } from '@prisma/client'
import { StorageService } from './StorageService'

export class ProjectService {
  constructor(
    private prisma: PrismaClient,
    private storageService: StorageService
  ) {}

  async listProjects(userId: string): Promise<UserProject[]> {
    const projects = await this.prisma.userProject.findMany({
      where: { user_id: userId },
      orderBy: { updated_at: 'desc' },
    })

    return projects
  }

  async createProject(
    userId: string,
    name: string,
    description?: string
  ): Promise<UserProject> {
    // プロジェクトをデータベースに作成
    const project = await this.prisma.userProject.create({
      data: {
        user_id: userId,
        name,
        description: description || null,
        storage_path: '', // 一旦空で作成
      },
    })

    // ストレージパスを設定
    const storagePath = `projects/${userId}/${project.id}`

    // プロジェクトのストレージパスを更新
    const updatedProject = await this.prisma.userProject.update({
      where: { id: project.id },
      data: { storage_path: storagePath },
    })

    // ストレージディレクトリを作成
    await this.storageService.createProjectDirectory(storagePath)

    return updatedProject
  }

  async getProject(projectId: string): Promise<UserProject | null> {
    const project = await this.prisma.userProject.findUnique({
      where: { id: projectId },
    })

    return project
  }

  async updateProject(
    projectId: string,
    data: { name?: string; description?: string }
  ): Promise<UserProject> {
    const project = await this.prisma.userProject.update({
      where: { id: projectId },
      data,
    })

    return project
  }

  async deleteProject(projectId: string): Promise<UserProject> {
    // 論理削除: updated_at を更新
    const project = await this.prisma.userProject.update({
      where: { id: projectId },
      data: {
        updated_at: new Date(),
      },
    })

    return project
  }
}
