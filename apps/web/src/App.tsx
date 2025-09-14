import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { Layout } from '@/components/layout/layout'
import { HomePage } from '@/pages/home'
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
        </Routes>
      </Layout>
      <Toaster />
    </ThemeProvider>
  )
}

export default App
