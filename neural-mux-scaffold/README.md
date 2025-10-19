# Neural Mux iOS Product Scaffold

**Tesla/SpaceX/NASA-Grade iOS App Generator**

Generates complete iOS Xcode projects with enforced quality standards, embedded Phi-3 integration, and Neural Mux routing.

## Features

✅ **Automated Project Generation** - Complete Xcode projects from YAML specs  
✅ **MVC-M Architecture** - Model-View-Controller-Mux separation  
✅ **Quality Enforcement** - Tesla 200 LOC limit, complexity gates  
✅ **Mathematical Validation** - Required tests for all math functions  
✅ **Phi-3 Integration** - Embedded CoreML models with Neural Mux fallback  
✅ **React → SwiftUI Transition** - AI-powered component conversion  

## Installation

```bash
cd neural-mux-scaffold
cargo install --path .
```

This installs the `scaffold` command globally.

## Usage

### 1. Generate New iOS Product

```bash
scaffold generate --spec examples/satellite_network_spec.yaml --output ~/CTAS7-iOS
```

**Output**:
```
🚀 CTAS-7 Neural Mux iOS Product Scaffold Generator

📋 Product: CTAS Satellite Network
   Bundle ID: com.ctas7.satellite-network
   Category: utilities
   Target Devices: iPhone, iPad, Mac

⚙️  Generating project structure...
  📁 Creating directory structure...
  📦 Generating Xcode project...
  📊 Generating 2 data models...
  🎨 Generating 2 SwiftUI views...
  🔧 Generating 2 view models...
  ⚙️  Generating 2 services...
  🧠 Generating Neural Mux client...
  🤖 Generating Phi-3 integration...
  🧮 Generating 1 mathematical validation tests...
  🛡️  Generating quality gates...

✅ Project structure generated successfully!

🔍 Validating generated project...
✅ All quality gates passed!

📚 Next Steps:
   1. cd ~/CTAS7-iOS/SatelliteNetwork
   2. open SatelliteNetwork.xcodeproj
   3. Implement TODOs in generated files
   4. Run tests: xcodebuild test -scheme SatelliteNetwork
```

### 2. Validate Existing Project

```bash
scaffold validate ~/CTAS7-iOS/SatelliteNetwork --report
```

**Checks**:
- File size (200 LOC limit)
- Mathematical function test coverage
- Naming honesty (class names vs capabilities)
- Cyclomatic complexity (<10 target)
- Swift compilation

### 3. Transition React Component to iOS

```bash
scaffold transition \
  --component ~/ctas7-command-center/src/components/MissionCriticalDevOps.tsx \
  --output ~/CTAS7-iOS/DevCenter/Views/
```

Uses Neural Mux + Phi to analyze React component and generate SwiftUI equivalent.

### 4. Install Quality Gate Hooks

```bash
cd ~/CTAS7-iOS/SatelliteNetwork
scaffold install-hooks .
```

Installs pre-commit hook that automatically validates quality before each commit.

## Product Specification Format

Create a YAML file describing your iOS product:

```yaml
name: ProductName
display_name: "Product Display Name"
bundle_id: com.ctas7.product-name
category: utilities  # productivity, business, utilities, etc.
target_devices:
  - iPhone
  - iPad

features:
  - "Feature description 1"
  - "Feature description 2"

data_models:
  - name: ModelName
    properties:
      - name: id
        type: String
      - name: value
        type: Double
    protocols:
      - Codable
      - Identifiable

views:
  - name: MainView
    view_model: MainViewModel
    subviews:
      - List
      - DetailRow

services:
  - name: DataService
    methods:
      - name: fetchData
        signature: "func fetchData() async -> [Model]"
    dependencies:
      - CTASFoundation

math_functions:
  - name: calculateMetric
    description: "Description of mathematical function"
    reference_implementation: "NASA Standard XYZ"
    test_cases:
      - input: { "x": 1.0 }
        expected: { "result": 2.0 }
        tolerance: 0.01

phi_prompts:
  - "AI prompt for this product's intelligence"

dependencies:
  - CTASFoundation
  - NeuralMuxClient
```

## Generated Project Structure

```
ProductName/
├── ProductName.xcodeproj/
├── ProductName/
│   ├── Models/               # <200 LOC each
│   ├── Views/                # SwiftUI (<200 LOC each)
│   ├── ViewModels/           # @Published properties
│   ├── Services/             # Business logic
│   ├── NeuralMux/            # Mux client
│   └── PhiIntegration/       # Embedded Phi-3
├── ProductNameTests/
│   └── MathValidationTests/  # Required for math functions
└── README.md
```

## Quality Standards

All generated projects enforce:

| Standard | Threshold | Source |
|----------|-----------|--------|
| File LOC | 200 max | Tesla Software Engineering |
| Function LOC | 50 max | SpaceX Flight Software |
| Cyclomatic Complexity | 10 max | NASA Software Engineering Handbook |
| Math Function Test Coverage | 100% | DOD Software Engineering Manual |
| Test RMSE | Spec-defined | Engineering specification |

## Pre-Commit Quality Gates

When installed, runs automatically before each commit:

```bash
🔍 Running CTAS-7 Quality Gates...
  ✅ File Size (Tesla 200 LOC Standard)
  ✅ Mathematical Function Testing
  ✅ Naming Honesty
  ✅ Cyclomatic Complexity
  ✅ Swift Compilation
✅ All quality gates passed!
```

Blocks commit if any gate fails.

## Integration with CTAS-7 Ecosystem

### Neural Mux

All generated apps include a Neural Mux client for intelligent routing:

```swift
let muxClient = ProductNameMuxClient()
let status = try await muxClient.getStatus()
let response = try await muxClient.queryPhi(prompt: "Analyze this data")
```

### Embedded Phi-3

Phi-3 Mini (3.8B params) compiled to CoreML for on-device inference:

```swift
let phiEngine = try PhiInferenceEngine()
let result = await phiEngine.infer(prompt: "Predict satellite health")
```

Falls back to Neural Mux API if CoreML model unavailable.

## Commands Reference

```bash
# Generate new product
scaffold generate --spec <YAML> --output <DIR>

# Validate existing project
scaffold validate <PROJECT_DIR> [--report]

# Transition React component
scaffold transition --component <FILE> --output <DIR>

# Install quality hooks
scaffold install-hooks <PROJECT_DIR>
```

## Development

```bash
# Build
cargo build --release

# Run tests
cargo test

# Check code quality
cargo clippy -- -D warnings
cargo fmt --check
```

## License

MIT

## See Also

- [FORENSIC_ANALYSIS_AND_IOS_SOP.md](/Users/cp5337/Developer/CTAS7-SDC-iOS/FORENSIC_ANALYSIS_AND_IOS_SOP.md) - Complete iOS development standard
- [IOS_BUILD_ANALYSIS_2025-10-12.md](/Users/cp5337/Developer/CTAS7-SDC-iOS/IOS_BUILD_ANALYSIS_2025-10-12.md) - Build failure forensic analysis
- [CROSS_APPLICATION_MATH_QUALITY_ANALYSIS.md](/Users/cp5337/Developer/CTAS7-SDC-iOS/CROSS_APPLICATION_MATH_QUALITY_ANALYSIS.md) - Mathematical quality assessment




