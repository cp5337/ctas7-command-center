import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-4" variant="outline">
              Satellite-First Development
            </Badge>
            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-6xl">
              SwiftUI Porting Guide & Component Library
            </h1>
            <p className="mb-8 text-pretty text-lg text-muted-foreground md:text-xl">
              Transform React Native Web patterns into native SwiftUI for iOS, iPadOS, and macOS. Built for satellite
              operations, industrial control systems, and enterprise security.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="#get-started">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/satellite-components">View Components</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold">34+</div>
              <div className="text-sm text-muted-foreground">Tutorials</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">12+</div>
              <div className="text-sm text-muted-foreground">UI Components</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm text-muted-foreground">Production Ready</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">∞</div>
              <div className="text-sm text-muted-foreground">AI Prompts</div>
            </div>
          </div>
        </div>
      </div>

      <div id="get-started" className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-3xl font-bold">How to Use This Platform Now</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-2xl font-bold text-primary">
                1
              </div>
              <h3 className="mb-2 text-xl font-semibold">Use as React Native Web</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Deploy this platform immediately to build cross-platform satellite control interfaces. All components
                work on web, iOS, and Android.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-primary">→</span>
                  <span>Click "Publish" to deploy to Vercel</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">→</span>
                  <span>Use satellite components and visualizations</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">→</span>
                  <span>
                    Manage secrets at <code className="rounded bg-muted px-1">/secrets</code>
                  </span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-2xl font-bold text-primary">
                2
              </div>
              <h3 className="mb-2 text-xl font-semibold">Port to Native SwiftUI</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                When you need native performance, use our tutorials to convert React Native patterns to SwiftUI.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-primary">→</span>
                  <span>Browse 34+ tutorials below</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">→</span>
                  <span>Copy AI prompts for assisted porting</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">→</span>
                  <span>Follow side-by-side code examples</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-2xl font-bold text-primary">
                3
              </div>
              <h3 className="mb-2 text-xl font-semibold">Explore Components</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Access specialized satellite UI components and data visualizations ready for production use.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-primary">→</span>
                  <span>Knobs, gauges, and control panels</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">→</span>
                  <span>Real-time telemetry charts</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">→</span>
                  <span>Status indicators and meters</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-2xl font-bold text-primary">
                4
              </div>
              <h3 className="mb-2 text-xl font-semibold">Integrate Your Stack</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Connect to your existing infrastructure with tutorials for Rust, Kubernetes, multi-cloud, and more.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-primary">→</span>
                  <span>MCP automation workflows</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">→</span>
                  <span>AWS, GCP, Azure integration</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">→</span>
                  <span>Quantum cryptography for satellites</span>
                </li>
              </ul>
            </Card>
          </div>

          <Card className="mt-8 border-primary/50 bg-primary/5 p-6">
            <h3 className="mb-3 text-lg font-semibold">Quick Start Commands</h3>
            <div className="space-y-3">
              <div>
                <p className="mb-1 text-sm font-medium">Deploy to Vercel:</p>
                <code className="block rounded bg-muted p-2 text-sm">Click "Publish" button (top right)</code>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium">Push to GitHub:</p>
                <code className="block rounded bg-muted p-2 text-sm">Click GitHub icon (top right)</code>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium">Access Secrets Manager:</p>
                <code className="block rounded bg-muted p-2 text-sm">Navigate to /secrets</code>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium">View Component Library:</p>
                <code className="block rounded bg-muted p-2 text-sm">
                  Navigate to /satellite-components or /visualizations
                </code>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Tutorial Grid */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="mb-8 text-3xl font-bold">Core Tutorials</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <TutorialCard
            title="Xcode Overview"
            description="Complete guide to Xcode IDE, project structure, and development workflow"
            href="/tutorials/xcode"
            badge="Essential"
          />
          <TutorialCard
            title="HomeKit Integration"
            description="Build smart home and industrial equipment control systems"
            href="/tutorials/homekit"
            badge="IoT"
          />
          <TutorialCard
            title="Container System"
            description="Master SwiftUI containers and view composition patterns"
            href="/tutorials/containers"
            badge="UI"
          />
          <TutorialCard
            title="Starlink API"
            description="Integrate satellite connectivity and telemetry data"
            href="/tutorials/starlink"
            badge="Satellite"
          />
          <TutorialCard
            title="ElevenLabs + Siri"
            description="Voice synthesis and Siri integration for hands-free control"
            href="/tutorials/elevenlabs-siri"
            badge="AI"
          />
          <TutorialCard
            title="Cesium for iOS"
            description="3D geospatial visualization and satellite tracking"
            href="/tutorials/cesium"
            badge="Mapping"
          />
        </div>

        <h2 className="mb-8 mt-16 text-3xl font-bold">Data & Backend</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <TutorialCard
            title="Supabase Integration"
            description="Real-time database, auth, and storage for SwiftUI apps"
            href="/tutorials/supabase"
            badge="Database"
          />
          <TutorialCard
            title="SurrealDB"
            description="Multi-model database with graph capabilities"
            href="/tutorials/surrealdb"
            badge="Database"
          />
          <TutorialCard
            title="MCP Integration"
            description="Model Context Protocol for AI automation workflows"
            href="/tutorials/mcp"
            badge="AI"
          />
          <TutorialCard
            title="Secrets Management"
            description="Secure credential storage with iCloud Keychain"
            href="/tutorials/secrets-management"
            badge="Security"
          />
        </div>

        <h2 className="mb-8 mt-16 text-3xl font-bold">Apple Ecosystem</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <TutorialCard
            title="MapKit"
            description="Native mapping, location services, and geofencing"
            href="/tutorials/mapkit"
            badge="Maps"
          />
          <TutorialCard
            title="WidgetKit"
            description="Home screen widgets and Live Activities"
            href="/tutorials/widgetkit"
            badge="Widgets"
          />
          <TutorialCard
            title="CloudKit"
            description="iCloud sync, shared databases, and collaboration"
            href="/tutorials/cloudkit"
            badge="Cloud"
          />
          <TutorialCard
            title="App Intents"
            description="Siri shortcuts, Spotlight, and system integration"
            href="/tutorials/app-intents"
            badge="Siri"
          />
        </div>

        <h2 className="mb-8 mt-16 text-3xl font-bold">Enterprise & Industrial</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <TutorialCard
            title="USB-C Accessories"
            description="External hardware integration for iPad and iPhone"
            href="/tutorials/usb-accessories"
            badge="Hardware"
          />
          <TutorialCard
            title="Industrial HomeKit"
            description="Equipment control and monitoring systems"
            href="/tutorials/industrial-homekit"
            badge="Industrial"
          />
          <TutorialCard
            title="Rust FFI"
            description="Call Rust code from Swift for performance-critical operations"
            href="/tutorials/rust-ffi"
            badge="Performance"
          />
          <TutorialCard
            title="Kubernetes Dashboards"
            description="Monitor and manage K8s clusters from iOS"
            href="/tutorials/kubernetes"
            badge="DevOps"
          />
          <TutorialCard
            title="Terminal & SSH"
            description="Remote server access and command execution"
            href="/tutorials/terminal"
            badge="DevOps"
          />
          <TutorialCard
            title="Docker Containers"
            description="Container management and monitoring"
            href="/tutorials/docker"
            badge="DevOps"
          />
        </div>

        <h2 className="mb-8 mt-16 text-3xl font-bold">Security & Deployment</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <TutorialCard
            title="Security & Kasane"
            description="Enterprise security patterns and threat detection"
            href="/tutorials/security"
            badge="Security"
          />
          <TutorialCard
            title="Unified Memory"
            description="Optimize for Apple Silicon architecture"
            href="/tutorials/unified-memory"
            badge="Performance"
          />
          <TutorialCard
            title="Enterprise Deployment"
            description="MDM, Single App Mode, and fleet management"
            href="/tutorials/enterprise-deployment"
            badge="Enterprise"
          />
          <TutorialCard
            title="Quantum Cryptography"
            description="Post-quantum encryption for satellite communications"
            href="/tutorials/quantum-crypto"
            badge="Security"
          />
        </div>

        <h2 className="mb-8 mt-16 text-3xl font-bold">Multi-Cloud Integration</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <TutorialCard
            title="AWS Integration"
            description="Connect to AWS services from SwiftUI apps"
            href="/tutorials/aws"
            badge="Cloud"
          />
          <TutorialCard
            title="Google Cloud"
            description="GCP APIs and Firebase integration"
            href="/tutorials/gcp"
            badge="Cloud"
          />
          <TutorialCard
            title="Azure Integration"
            description="Microsoft Azure services and authentication"
            href="/tutorials/azure"
            badge="Cloud"
          />
          <TutorialCard
            title="Multi-Cloud Architecture"
            description="Design apps that work across cloud providers"
            href="/tutorials/multi-cloud"
            badge="Architecture"
          />
        </div>

        {/* Component Showcase CTA */}
        <Card className="mt-16 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold">Satellite UI Components</h2>
          <p className="mb-6 text-muted-foreground">
            Specialized components for industrial control systems: knobs, gauges, status indicators, and telemetry
            displays
          </p>
          <Button asChild>
            <Link href="/satellite-components">Explore Components</Link>
          </Button>
        </Card>

        {/* Data Visualizations CTA */}
        <Card className="mt-8 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold">Data Visualizations</h2>
          <p className="mb-6 text-muted-foreground">
            Real-time telemetry charts, radial gauges, linear meters, sparklines, status panels, and heatmaps for
            satellite operations
          </p>
          <Button asChild>
            <Link href="/visualizations">View Visualizations</Link>
          </Button>
        </Card>
      </div>
    </div>
  )
}

function TutorialCard({
  title,
  description,
  href,
  badge,
}: {
  title: string
  description: string
  href: string
  badge: string
}) {
  return (
    <Link href={href}>
      <Card className="group h-full p-6 transition-colors hover:border-primary">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-lg font-semibold group-hover:text-primary">{title}</h3>
          <Badge variant="secondary">{badge}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </Card>
    </Link>
  )
}
