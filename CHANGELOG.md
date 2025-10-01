# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
