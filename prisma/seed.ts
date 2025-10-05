import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // プランの初期データ
  const freePlan = await prisma.plan.upsert({
    where: { name: '無料プラン' },
    update: {},
    create: {
      name: '無料プラン',
      description: '基本的な画像編集機能を無料で利用できます',
      price: 0,
      max_storage: 100, // 100MB
      max_ai_calls: 10, // 月10回まで
    },
  })
  console.log('✓ Created plan:', freePlan.name)

  const proPlan = await prisma.plan.upsert({
    where: { name: 'プロプラン' },
    update: {},
    create: {
      name: 'プロプラン',
      description: 'すべての機能を無制限で利用できます',
      price: 980,
      max_storage: 10000, // 10GB
      max_ai_calls: 1000, // 月1000回まで
    },
  })
  console.log('✓ Created plan:', proPlan.name)

  const businessPlan = await prisma.plan.upsert({
    where: { name: 'ビジネスプラン' },
    update: {},
    create: {
      name: 'ビジネスプラン',
      description: 'チーム向けの高度な機能とサポートを提供',
      price: 2980,
      max_storage: 50000, // 50GB
      max_ai_calls: 5000, // 月5000回まで
    },
  })
  console.log('✓ Created plan:', businessPlan.name)

  // AIモデルの初期データ
  const googleGemini = await prisma.aiModel.upsert({
    where: { model_name: 'gemini-2.0-flash-exp' },
    update: {},
    create: {
      provider: 'google',
      model_name: 'gemini-2.0-flash-exp',
      display_name: 'Google Gemini 2.0 Flash',
      description: '高速で効率的な画像生成・編集モデル',
      is_active: true,
    },
  })
  console.log('✓ Created AI model:', googleGemini.display_name)

  const openaiGpt4o = await prisma.aiModel.upsert({
    where: { model_name: 'gpt-4o' },
    update: {},
    create: {
      provider: 'openai',
      model_name: 'gpt-4o',
      display_name: 'OpenAI GPT-4o',
      description: '高精度な画像理解と編集が可能なモデル',
      is_active: true,
    },
  })
  console.log('✓ Created AI model:', openaiGpt4o.display_name)

  const claudeSonnet = await prisma.aiModel.upsert({
    where: { model_name: 'claude-3-5-sonnet-20241022' },
    update: {},
    create: {
      provider: 'anthropic',
      model_name: 'claude-3-5-sonnet-20241022',
      display_name: 'Claude 3.5 Sonnet',
      description: '詳細な画像分析と編集指示に優れたモデル',
      is_active: true,
    },
  })
  console.log('✓ Created AI model:', claudeSonnet.display_name)

  console.log('✅ Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
