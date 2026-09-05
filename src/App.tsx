import { SemanticShell } from './components/shell/SemanticShell'
import { ExperienceBoundary } from './components/experience/ExperienceBoundary'
import { ArchitectureTableProvider } from './experience/architecture/ArchitectureTableContext'
import { ArchitectureTableRoot } from './experience/architecture/ArchitectureTableRoot'

function App() {
  return (
    <ArchitectureTableProvider>
      <SemanticShell>
        <ExperienceBoundary />
      </SemanticShell>
      <ArchitectureTableRoot />
    </ArchitectureTableProvider>
  )
}

export default App
