import { SemanticShell } from './components/shell/SemanticShell'
import { ExperienceBoundary } from './components/experience/ExperienceBoundary'
import { ArchitectureTableProvider } from './experience/architecture/ArchitectureTableContext'

function App() {
  return (
    <ArchitectureTableProvider>
      <SemanticShell>
        <ExperienceBoundary />
      </SemanticShell>
    </ArchitectureTableProvider>
  )
}

export default App
