$ErrorActionPreference = 'Stop'

$required = @(
  '.agents/AGENTS.md',
  'docs/specs/US-TEMPLATE.md',
  'docs/vision/HOMELAB_VISION.md',
  'docs/vision/WORLD_ARCHITECTURE.md',
  'docs/vision/ART_DIRECTION.md',
  'docs/vision/USER_JOURNEY.md',
  'docs/architecture/TECHNICAL_ARCHITECTURE.md',
  'docs/architecture/PORTFOLIO_KNOWLEDGE_ARCHITECTURE.md',
  'docs/architecture/CONTENT_MODEL.md',
  'docs/architecture/PERFORMANCE_BUDGET.md',
  'docs/architecture/DELIVERY_WORKFLOW.md',
  'docs/architecture/RUNTIME_AGENT_INTEGRATION.md',
  'docs/product/SOFTWARE_ENGINEERING_LAB.md',
  'docs/product/ROADMAP.md'
)

$missing = $required | Where-Object { -not (Test-Path -LiteralPath $_) }
if ($missing) { throw "Missing required files: $($missing -join ', ')" }

$stories = Get-ChildItem -LiteralPath 'docs/specs' -Filter 'US-*.md' |
  Where-Object Name -ne 'US-TEMPLATE.md'
foreach ($story in $stories) {
  $content = Get-Content -Raw -LiteralPath $story.FullName
  if ($content -notmatch 'Status: `(DRAFT|READY|ACCEPTED|IMPLEMENTED|AUDITED|DONE)`') {
    throw "Invalid or missing lifecycle state: $($story.FullName)"
  }
  $status = [regex]::Match($content, 'Status: `(DRAFT|READY|ACCEPTED|IMPLEMENTED|AUDITED|DONE)`').Groups[1].Value
  $last = [regex]::Match($content, 'Last transition: `([^`]+)`').Groups[1].Value
  if (-not $last) { throw "Missing Last transition: $($story.FullName)" }
  if ($status -eq 'IMPLEMENTED' -and $last -notmatch 'ACCEPTED.*IMPLEMENTED') {
    throw "Lifecycle header disagrees with IMPLEMENTED state: $($story.FullName)"
  }
  if ($status -eq 'DRAFT' -and $last -notmatch '^DRAFT') {
    throw "Lifecycle header disagrees with DRAFT state: $($story.FullName)"
  }
  if ($status -in @('READY','ACCEPTED','IMPLEMENTED','AUDITED','DONE') -and $content -match '(?m)^- \[ \]') {
    throw "Unchecked acceptance criterion in $($story.FullName)"
  }
}

$runtimeRequired = @(
  '.opencode/agent/project-lead.md',
  '.opencode/agent/code-reviewer.md',
  '.opencode/agent/visual-reviewer.md',
  '.opencode/agent/performance-reviewer.md',
  '.claude/agents/project-lead.md',
  '.claude/agents/code-reviewer.md',
  '.claude/agents/visual-reviewer.md',
  '.claude/agents/performance-reviewer.md'
)
foreach ($path in $runtimeRequired) {
  if (-not (Test-Path -LiteralPath $path)) { throw "Missing runtime agent: $path" }
}

$referenceFiles = Get-ChildItem -Path '.agents','.opencode','.claude','docs' -Recurse -File -Filter '*.md'
foreach ($file in $referenceFiles) {
  $content = Get-Content -Raw -LiteralPath $file.FullName
  if ($file.FullName -notmatch '\.agents\\AGENTS\.md$' -and $content -match '(?<!docs/architecture/)CONTENT_MODEL\.md') {
    throw "Non-canonical CONTENT_MODEL reference: $($file.FullName)"
  }
  if ($content -match '(?<!docs/architecture/)docs/PERFORMANCE_BUDGET\.md') {
    throw "Non-canonical PERFORMANCE_BUDGET reference: $($file.FullName)"
  }
}

$ocReviewers = Get-ChildItem -LiteralPath '.opencode/agent' -Filter '*-reviewer.md'
foreach ($file in $ocReviewers) {
  $content = Get-Content -Raw -LiteralPath $file.FullName
  if ($content -match '(?m)^\s+bash:\s+allow\s*$' -or $content -match '(?m)^\s+edit:\s+allow\s*$') {
    throw "OpenCode reviewer is not read-only: $($file.FullName)"
  }
}

$claudeReviewers = Get-ChildItem -LiteralPath '.claude/agents' -Filter '*-reviewer.md'
foreach ($file in $claudeReviewers) {
  if ((Get-Content -Raw -LiteralPath $file.FullName) -match '(?i)\bBash\b') {
    throw "Claude reviewer exposes Bash: $($file.FullName)"
  }
}

$badLegacyPaths = @(
  'docs/HOMELAB_VISION.md', 'docs/WORLD_ARCHITECTURE.md',
  'docs/ART_DIRECTION.md', 'docs/USER_JOURNEY.md',
  'docs/SOFTWARE_ENGINEERING_LAB.md', 'docs/TECHNICAL_ARCHITECTURE.md',
  'docs/PERFORMANCE_BUDGET.md', 'docs/CONTENT_MODEL.md', 'docs/ROADMAP.md'
)
foreach ($path in $badLegacyPaths) {
  if (Test-Path -LiteralPath $path) { throw "Legacy document path exists: $path" }
}

Write-Output 'Foundation consistency: PASS'
