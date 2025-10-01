# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2025-01-10

### Changed

- **MAJOR REFACTOR**: Complete rewrite following n8n Baserow node patterns and best practices
- Restructured code architecture with proper separation of concerns
- Moved operation definitions to dedicated `OperationDescription.ts` file
- Enhanced TypeScript types with comprehensive interfaces
- Improved code organization following n8n community standards
- Added comprehensive unit tests following Baserow testing patterns
- Implemented proper cache-busting mechanisms with unique request identifiers
- Enhanced error handling with detailed descriptions and guidance

### Added

- `OperationDescription.ts` for clean operation field definitions
- Comprehensive unit test suite with Jest
- `usableAsTool` property for n8n AI agent compatibility
- Better subtitle display showing operation and resource
- Enhanced cache prevention with multiple strategies

### Fixed

- Resolved caching issues that caused stale results in subsequent executions
- Improved request isolation and data handling
- Enhanced CNPJ validation with proper error messages

## [0.2.2] - 2025-01-10

### Fixed

- **CRITICAL**: Fixed caching issues that caused subsequent executions to return cached results from previous runs
- Added comprehensive cache-busting mechanisms including unique timestamps and random IDs for each request
- Implemented proper HTTP cache prevention headers (`Cache-Control`, `Pragma`, `Expires`)
- Enhanced request isolation to ensure each execution is completely independent
- Added deep cloning of response data to prevent reference sharing between executions

### Changed

- Updated User-Agent header to include dynamic timestamp for request uniqueness
- Added 30-second timeout configuration for HTTP requests
- Improved execution metadata with unique identifiers and proper pairing
- Enhanced error responses with timestamps and item indices for better debugging

## [0.2.1] - 2025-01-10

### Fixed

- Fixed issue where node was returning only the first result when processing multiple items simultaneously
- Improved item processing using proper `constructExecutionMetaData` following n8n best practices

### Changed

- Refactored code structure following Baserow node patterns
- Separated generic functions into dedicated `GenericFunctions.ts` file
- Added proper TypeScript types in `types.ts` file
- Improved error handling using `NodeApiError`
- Updated to use `NodeConnectionTypes` instead of string literals

### Added

- Unit tests for generic functions
- Better code organization and maintainability

## [0.2.0] - 2025-01-10

### Added

- CNPJ validation with check digit algorithm before API requests
- Support for multiple CNPJ formats (with or without punctuation)
- Simplified output option with most relevant company fields
- Enhanced error handling with specific messages for common issues
- Batch processing support for multiple CNPJs from previous nodes
- Clear error descriptions with guidance on how to fix issues

### Changed

- Improved error messages following n8n UX guidelines
- Better placeholder examples in CNPJ field
- Enhanced node description and documentation

### Fixed

- Fixed 400 "Requisição inválida" error by adding proper CNPJ validation
- Resolved issues with invalid CNPJ formats being sent to API
- Improved error handling for network and API errors

## [0.1.1] - Previous Version

### Added

- Initial OpenCNPJ node implementation
- Basic company data retrieval by CNPJ
- Integration with OpenCNPJ API (https://publica.cnpj.ws)
