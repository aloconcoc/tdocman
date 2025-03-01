import AuthProvider from './context/authProvider.tsx'
import Routes from './routers/index.tsx'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import 'suneditor/dist/css/suneditor.min.css'
import { Suspense } from 'react'
import LoadingPage from './components/shared/LoadingPage/LoadingPage.tsx'

function App() {
  return (
    <AuthProvider>
      <DndProvider backend={HTML5Backend}>
        <Routes />
      </DndProvider>
    </AuthProvider>
  )
}

export default App
