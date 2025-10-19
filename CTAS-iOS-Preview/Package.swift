// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CTAS-iOS-Preview",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    products: [
        .library(
            name: "CTAS-iOS-Preview",
            targets: ["CTAS-iOS-Preview"]),
    ],
    targets: [
        .target(
            name: "CTAS-iOS-Preview",
            dependencies: [],
            path: "Sources"),
    ]
)

