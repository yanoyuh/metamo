import { createRootRoute, Outlet } from '@tanstack/react-router'
import { AuthProvider } from '@/contexts/AuthContext'
import { Layout } from '@/components/common/layout/Layout'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <AuthProvider>
      <Layout>
        <Outlet />
      </Layout>
    </AuthProvider>
  )
}
