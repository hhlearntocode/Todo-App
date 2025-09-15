import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { Layout } from '@/components/layout/layout'
import { HomePage } from '@/pages/home'
import { AnalyticsPage } from '@/pages/analytics'
import { Toaster } from '@/components/ui/toaster'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="todo-app-theme">
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tasks" element={<HomePage />} />
          <Route path="/today" element={<HomePage />} />
          <Route path="/upcoming" element={<HomePage />} />
          <Route path="/completed" element={<HomePage />} />
          <Route path="/high-priority" element={<HomePage />} />
          <Route path="/do-now" element={<HomePage />} />
          <Route path="/calendar" element={<HomePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </Layout>
      <Toaster />
    </ThemeProvider>
  )
}

export default App
