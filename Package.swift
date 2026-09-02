// swift-tools-version: 6.0
//
// Paket AIKit — mesin bank soal dan algoritma kecerdasan buatan.
//
// Tidak ada satu pun dependensi luar, dan Foundation pun tidak dipakai. Di
// bawah WASI, menarik Foundation membesarkan biner WebAssembly-nya berkali
// lipat; yang dibutuhkan paket ini hanya matematika dasar dan pustaka standar.
//
// .Deckyx

import PackageDescription

let package = Package(
    name: "AIKit",
    products: [
        .library(name: "AIKit", targets: ["AIKit"]),
        .executable(name: "aikit-cli", targets: ["aikit-cli"]),
    ],
    targets: [
        .target(
            name: "AIKit",
            swiftSettings: [
                // Peringatan diperlakukan sebagai galat. Peringatan yang
                // dibiarkan menumpuk berhenti dibaca orang dalam hitungan
                // minggu, dan sejak itu peringatan yang penting pun ikut hilang.
                .unsafeFlags(["-warnings-as-errors"])
            ]
        ),
        .executableTarget(
            name: "aikit-cli",
            dependencies: ["AIKit"],
            swiftSettings: [.unsafeFlags(["-warnings-as-errors"])]
        ),
        .testTarget(name: "AIKitTests", dependencies: ["AIKit"]),
    ]
)
