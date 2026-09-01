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
