# Blake3 Contamination → Murmur3 Stabilization Plan

Status: Draft

Purpose

- Document the non‑breaking remediation approach for removing Blake3 usage from main-system crates and restoring Murmur3 as the canonical hashing implementation (per v7.3 schema).
- Provide step-by-step actions, validation, and rollback procedures so engineering can apply changes safely.

Background

- The repository's ground-truth hashing engine and many schemas are Murmur3-first (e.g., `ctas7-hashing-engine`, `CRATE_INTERVIEW_SCHEMA_V7.3.1.toml`, DB defaults `MURMUR3_BASE96`).
- Over time, Blake3 references have proliferated across docs, front-end, and several crates causing model drift and build inconsistencies.
- We must remove Blake3 from _main-system_ crates without introducing breaking changes.

Scope (priority — main-system crates)

- ctas7-foundation-core
  - `src/genetic_hash.rs`, `src/nist_level_hash_validation.rs`, `src/enhanced_handlers.rs`
- ctas7-foundation-data
  - `src/database_pubsub.rs`, `src/project_clearprint_integration.rs`
- ctas7-smart-cdn-gateway
  - `src/contextual_evidence_illumination.rs`, `src/ip_protection_obfuscator.rs`, `src/intel_retrieval.rs`, `src/usim_header.rs`
- smart-crate-system / ctas7-smart-crate-orchestrator
  - `src/hash_engine.rs`, `src/usim.rs`, `src/rust_workflow_orchestrator.rs`, `src/hash_orchestrator.rs`
- ctas7-enhanced-geolocation
  - `src/core/device_fp.rs`, `src/core/geo_resolver.rs`
- ctas7-layer2-mathematical-intelligence
  - `src/main.rs`
- ctas7-qa-analyzer
  - `src/usim.rs`, `src/usim_header.rs`, `provenance/*`

Goals

- Ensure all main-system crates produce Murmur3-based outputs while preserving existing API signatures and avoiding runtime changes.
- Keep builds passing and enable incremental refactors toward the canonical hashing client.
- Mark crypto-sensitive call-sites to ensure cryptographic hashes remain cryptographically secure (SHA-256/Blake3 where required).

Non‑breaking remediation strategy

1. Implement a compatibility shim crate named `blake3` (workspace-local, documented as a shim).
   - Expose the minimal Blake3 API currently referenced across crates: `Hasher`, `Hash`, `Hasher::update`, `Hasher::finalize`, `Hash::to_hex`, etc.
   - Internally delegate to the workspace canonical hashing service (`ctas7-hashing-engine`) or to Murmur3 implementations (`murmurhash3` crate) as appropriate.
   - Clearly document in the crate README: "compat shim — returns Murmur3-backed results; not a cryptographic Blake3 implementation."
2. Add the shim to the workspace and use `path` dependencies in the affected crate `Cargo.toml` files. This preserves existing `use blake3::Hasher` imports.
3. Run `cargo build --all` and `cargo test --all` to validate compilation and basic test behavior.
4. Validate runtime outputs against Murmur3 golden data where available (hash format, base96 encoding, trivariate seeds). Use hashing-engine endpoint or unit test harness.
5. Gradually replace shimbed call-sites with explicit calls to the canonical hashing client (for clarity), then deprecate and remove the shim.

Implementation details (developer notes)

- Shim crate layout (example):
  - `blake3-shim/` (crate name: `blake3`)
    - `src/lib.rs` — public types `pub struct Hasher`, `pub struct Hash` with expected methods.
    - `Cargo.toml` — no external `blake3` dependency; `murmurhash3` or client crate as needed.
    - `README.md` — clearly label compatibility behavior and non-cryptographic status.
- Example shim behavior:
  - `Hasher::update(bytes)` -> feed bytes to the Murmur3 trivariate pipeline or call local `ctas7-hashing-engine` client.
  - `finalize()` -> produce a 16-byte digest (128-bit Murmur3 x64 variant) and present `to_hex()`/`to_base96()` helpers.
- Cargo changes: replace direct `blake3 = "..."` dependency with `blake3 = { path = "../blake3" }` for affected crates. (No source edits to imports required.)

Validation checklist

- [ ] `cargo build --all` completes with zero compiler errors.
- [ ] `cargo test --all` runs unit/integration tests (or a representative subset) in main-system crates.
- [ ] Hash outputs used for addressing match Murmur3-format expectations (size, base96 encoding, seed usage).
- [ ] Runtime smoke test of critical flows (SCO orchestration, USIM addressing, IO/CDN write/read) produces expected routing results.

Rollback plan

- If any regression or test failure occurs, revert Cargo.toml changes to the prior state (restore original crate references) and remove the shim path from the workspace.
- The shim approach is fully reversible because it only changes dependency resolution, not source-level logic.

Security caveat

- Murmur3 is not cryptographically secure. For any code paths that require cryptographic integrity, do NOT use the shim. Identify and keep explicit calls to proven cryptographic functions (e.g., `sha2::Sha256` or a dedicated Blake3 crypto client) for content integrity, signatures, provenance attestation, or any place where collision resistance or preimage resistance is required.
- I can produce a short audit list of call-sites where Blake3 was likely used for cryptographic guarantees so they can be preserved or migrated safely.

Next steps (recommended order)

1. Approval: Accept this remediation plan.
2. Create the shim crate `blake3` in the workspace and prepare a single example `Cargo.toml` patch for `ctas7-foundation-core`.
3. Apply patches for the prioritized main-system crates only (Cargo.toml path deps). Build+test.
4. Produce audit report of remaining Blake3 references (docs + non-priority crates) and schedule full cleanup.

Appendix: quick discovery commands

- Find all blake3 usage (code & docs):

```bash
# repo root
git grep -n "blake3" || true
```

- Identify crates with direct blake3 deps in Cargo.toml:

```bash
git grep -n "blake3" -- "**/Cargo.toml" || true
```

## Reference: Ground Truth — Hashing Engine v7.3.1

- Canonical reference: `/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-hashing-engine/README.md` ("CTAS-7 Hashing Engine v7.3.1").
- Ground truth: Murmur3 trivariate addressing (SCH+CUID+UUID) + SHA-256 for integrity (dual-hashing model).

### Non‑compliant crates (code-level Blake3 imports — priority)

These crates contain active `use blake3` imports or direct Blake3 deps and must be brought into compliance (non‑breaking):

- `ctas7-foundation-core` (genetic_hash.rs, nist_level_hash_validation.rs, enhanced_handlers.rs)
- `ctas7-foundation-data` (database_pubsub.rs, project_clearprint_integration.rs)
- `ctas7-smart-cdn-gateway` (contextual_evidence_illumination.rs, ip_protection_obfuscator.rs, intel_retrieval.rs, usim_header.rs)
- `ctas7-smart-crate-orchestrator` / smart-crate-system (hash_engine.rs, usim.rs, rust_workflow_orchestrator.rs, hash_orchestrator.rs)
- `ctas7-enhanced-geolocation` (core/device_fp.rs, core/geo_resolver.rs)
- `ctas7-layer2-mathematical-intelligence` (src/main.rs)
- `ctas7-qa-analyzer` (usim.rs, usim_header.rs, provenance/\*)

Note: additional candidate/staging crates and frontend/docs also reference Blake3 but are lower priority for this compliance play.

## Compliance Play (non‑breaking, per‑crate)

Objective: make listed crates compile and behave under the Murmur3 ground-truth without modifying existing call-sites.

1. Create a workspace compatibility shim crate `blake3` (crate name: `blake3`)

   - Public API surface: minimal types and methods currently used (`Hasher`, `Hash`, `update`, `finalize`, `to_hex`, helpers for Base96 if required).
   - Implementation: internally delegate to the canonical Murmur3 implementation (use the `murmurhash3` crate or call the `ctas7-hashing-engine` client). Document clearly that this is a compatibility shim (Murmur3-backed, not the real Blake3).

2. Wire shim into workspace

   - Add the shim to the workspace and update affected crates' `Cargo.toml` to use `blake3 = { path = "../blake3" }` (or appropriate relative path). No source edits to `use` lines required.
   - Create one PR per logical component (group related crates) to make review small and reversible.

3. Build & test

   - Run `cargo build --all` and `cargo test --all` (or CI job). Validate that builds pass and unit tests are green.
   - Run hash-format validation tests: ensure output length/encoding matches Murmur3 format expected by consumers.

4. Audit cryptographic usage

   - Identify call-sites where Blake3 was used for cryptographic integrity. For those, keep explicit crypto implementations (SHA-256 or a vetted Blake3 service) and do NOT route through the Murmur3 shim. Flag them in code comments and in PRs.

5. Incremental refactor & removal

   - After shim deployment and stabilization, gradually replace internal usage with explicit canonical client calls (e.g., `ctas7_foundation_core::hashing::TrivariateHashEngine` or `ctas7-hashing-engine` client). Deprecate shim and remove once no call-sites remain.

6. Validation & rollout

   - Perform smoke tests on orchestration flows (USIM addressing, smart-crate orchestration, CDN routing).
   - Monitor CI, run a validation suite (inventory + layer2 fabric tests) before merging to main.

7. Rollback plan

   - If regressions are detected, revert the Cargo.toml PRs (quick revert of path dependency changes). The shim approach is fully reversible and low-risk.

8. Communication
   - Open PRs with clear changelogs and testing instructions. Notify owners of affected crates and request targeted review.

### Verification artifacts

- Add unit tests in the shim crate that assert Murmur3-backed outputs for small sample vectors.
- Add a CI job step to validate trivariate format (48-char Base96) and seeds used (SCH/CUID/UUID).

Contact

- If you approve, I will create an initial shim and open a PR draft with the Cargo.toml patches for the selected main crates and run builds/tests.

Note: I created a workspace-local compatibility shim crate at:

- `/Users/cp5337/Developer/ctas-7-shipyard-staging/blake3`

Next immediate action (applied)

- Added the initial `blake3` shim crate to the workspace and prepared example `Cargo.toml` content. The next patch will update `ctas7-foundation-core/Cargo.toml` to point its `blake3` dependency to the workspace shim via a `path` dependency.
