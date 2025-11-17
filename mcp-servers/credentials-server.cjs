#!/usr/bin/env node

/**
 * CTAS7 Centralized Credential Management Server
 * MCP-based API key and configuration management system
 * Prevents API key loss and provides centralized control
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// MCP Server Implementation
class CredentialManagementServer {
    constructor() {
        this.basePath = '/Users/cp5337/Developer/ctas7-command-center';
        this.envPath = path.join(this.basePath, '.env');
        this.credentialsDB = path.join(this.basePath, '.credentials.json');
        this.backupDir = path.join(this.basePath, '.credentials-backup');

        this.initializeCredentialsDB();
        this.createBackupSystem();
    }

    /**
     * Initialize credentials database with validation
     */
    initializeCredentialsDB() {
        if (!fs.existsSync(this.credentialsDB)) {
            const initialDB = {
                version: "2.0",
                created: new Date().toISOString(),
                last_validated: null,
                credentials: {},
                validation_rules: {
                    required_keys: [
                        "GOOGLE_AI_API_KEY",
                        "ELEVENLABS_API_KEY",
                        "VITE_SUPABASE_ANON_KEY",
                        "VITE_CESIUM_TOKEN"
                    ],
                    optional_keys: [
                        "LINEAR_API_KEY",
                        "VIRUSTOTAL_API_KEY",
                        "ALIENVAULT_OTX_API_KEY",
                        "MISP_API_KEY"
                    ]
                }
            };

            fs.writeFileSync(this.credentialsDB, JSON.stringify(initialDB, null, 2));
            console.log("✅ Created centralized credentials database");
        }
    }

    /**
     * Create backup system for credentials
     */
    createBackupSystem() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir);
        }

        // Create daily backup
        const timestamp = new Date().toISOString().split('T')[0];
        const backupFile = path.join(this.backupDir, `.env.backup.${timestamp}`);

        if (fs.existsSync(this.envPath) && !fs.existsSync(backupFile)) {
            fs.copyFileSync(this.envPath, backupFile);
            console.log(`✅ Created backup: ${backupFile}`);
        }
    }

    /**
     * Load and parse .env file
     */
    loadEnvFile() {
        if (!fs.existsSync(this.envPath)) {
            throw new Error('.env file not found');
        }

        const envContent = fs.readFileSync(this.envPath, 'utf8');
        const envVars = {};
        const duplicates = {};

        envContent.split('\n').forEach((line, index) => {
            line = line.trim();
            if (line && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                if (key && valueParts.length > 0) {
                    const value = valueParts.join('=');

                    // Check for duplicates
                    if (envVars[key]) {
                        duplicates[key] = duplicates[key] || [];
                        duplicates[key].push({
                            line: index + 1,
                            value: envVars[key]
                        });
                        duplicates[key].push({
                            line: index + 1,
                            value: value
                        });
                    }

                    envVars[key] = value;
                }
            }
        });

        return { envVars, duplicates };
    }

    /**
     * Validate all API keys
     */
    validateCredentials() {
        const { envVars, duplicates } = this.loadEnvFile();
        const db = JSON.parse(fs.readFileSync(this.credentialsDB, 'utf8'));

        const validation = {
            status: 'success',
            timestamp: new Date().toISOString(),
            issues: [],
            warnings: [],
            summary: {
                total_keys: Object.keys(envVars).length,
                valid_keys: 0,
                missing_required: 0,
                placeholders: 0,
                duplicates: Object.keys(duplicates).length
            }
        };

        // Check for duplicates
        Object.entries(duplicates).forEach(([key, instances]) => {
            validation.issues.push({
                type: 'DUPLICATE',
                key: key,
                description: `Duplicate entries for ${key}`,
                instances: instances
            });
        });

        // Check required keys
        db.validation_rules.required_keys.forEach(requiredKey => {
            if (!envVars[requiredKey]) {
                validation.issues.push({
                    type: 'MISSING_REQUIRED',
                    key: requiredKey,
                    description: `Required API key ${requiredKey} is missing`
                });
                validation.summary.missing_required++;
            } else if (this.isPlaceholder(envVars[requiredKey])) {
                validation.warnings.push({
                    type: 'PLACEHOLDER',
                    key: requiredKey,
                    description: `${requiredKey} contains placeholder value`
                });
                validation.summary.placeholders++;
            } else {
                validation.summary.valid_keys++;
            }
        });

        // Check optional keys
        db.validation_rules.optional_keys.forEach(optionalKey => {
            if (envVars[optionalKey] && !this.isPlaceholder(envVars[optionalKey])) {
                validation.summary.valid_keys++;
            }
        });

        // Update validation status
        if (validation.issues.length > 0) {
            validation.status = 'error';
        } else if (validation.warnings.length > 0) {
            validation.status = 'warning';
        }

        // Save validation results
        db.last_validation = validation;
        fs.writeFileSync(this.credentialsDB, JSON.stringify(db, null, 2));

        return validation;
    }

    /**
     * Check if value is a placeholder
     */
    isPlaceholder(value) {
        const placeholders = [
            'your_api_key_here',
            'your_token_here',
            'placeholder',
            'enter_key_here',
            'your_linear_api_key_here',
            'your_mapbox_token_here'
        ];

        return placeholders.some(placeholder =>
            value.toLowerCase().includes(placeholder.toLowerCase())
        );
    }

    /**
     * Fix common issues automatically
     */
    fixCredentialsFile() {
        const envContent = fs.readFileSync(this.envPath, 'utf8');
        let fixedContent = envContent;
        const fixes = [];

        // Remove duplicate GOOGLE_AI_API_KEY entries
        const lines = envContent.split('\n');
        const seenKeys = new Set();
        const deduplicatedLines = [];

        lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key] = trimmed.split('=');
                if (seenKeys.has(key)) {
                    fixes.push(`Removed duplicate ${key} at line ${index + 1}`);
                    return; // Skip this line
                }
                seenKeys.add(key);
            }
            deduplicatedLines.push(line);
        });

        // Add missing required keys section
        if (!envContent.includes('# CTAS7 Cybersecurity Intelligence')) {
            deduplicatedLines.push('');
            deduplicatedLines.push('# CTAS7 Cybersecurity Intelligence Platform API Keys');
            deduplicatedLines.push('# Managed by MCP Credential Server - DO NOT MODIFY MANUALLY');
            deduplicatedLines.push('');

            // Add placeholders for missing cybersecurity keys
            const cybersecKeys = [
                'VIRUSTOTAL_API_KEY=get_free_key_at_virustotal.com',
                'ALIENVAULT_OTX_API_KEY=get_free_key_at_otx.alienvault.com',
                'MISP_API_KEY=your_misp_instance_key_here',
                'GEMINI_API_KEY=${GOOGLE_AI_API_KEY}  # Use existing Google AI key'
            ];

            cybersecKeys.forEach(key => {
                if (!envContent.includes(key.split('=')[0])) {
                    deduplicatedLines.push(key);
                    fixes.push(`Added placeholder for ${key.split('=')[0]}`);
                }
            });
        }

        fixedContent = deduplicatedLines.join('\n');

        // Create backup before fixing
        const backupFile = `${this.envPath}.backup.${Date.now()}`;
        fs.copyFileSync(this.envPath, backupFile);

        // Write fixed content
        fs.writeFileSync(this.envPath, fixedContent);

        return {
            fixes_applied: fixes,
            backup_created: backupFile,
            status: 'success'
        };
    }

    /**
     * Get credential status summary
     */
    getStatus() {
        try {
            const validation = this.validateCredentials();
            const { envVars } = this.loadEnvFile();

            return {
                status: validation.status,
                total_keys: Object.keys(envVars).length,
                validation: validation,
                last_backup: this.getLatestBackup(),
                mcp_server: 'active',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'error',
                error: error.message,
                mcp_server: 'error'
            };
        }
    }

    /**
     * Get latest backup file
     */
    getLatestBackup() {
        try {
            const backups = fs.readdirSync(this.backupDir)
                .filter(file => file.startsWith('.env.backup'))
                .sort()
                .reverse();

            return backups[0] || 'none';
        } catch {
            return 'none';
        }
    }

    /**
     * MCP Server message handler
     */
    handleMessage(message) {
        const { method, params } = message;

        switch (method) {
            case 'tools/list':
                return {
                    tools: [
                        {
                            name: 'validate_credentials',
                            description: 'Validate all API keys and credentials'
                        },
                        {
                            name: 'fix_credentials',
                            description: 'Fix common credential issues automatically'
                        },
                        {
                            name: 'get_status',
                            description: 'Get credential management status'
                        }
                    ]
                };

            case 'tools/call':
                const toolName = params.name;

                switch (toolName) {
                    case 'validate_credentials':
                        return { content: [{ type: 'text', text: JSON.stringify(this.validateCredentials(), null, 2) }] };

                    case 'fix_credentials':
                        return { content: [{ type: 'text', text: JSON.stringify(this.fixCredentialsFile(), null, 2) }] };

                    case 'get_status':
                        return { content: [{ type: 'text', text: JSON.stringify(this.getStatus(), null, 2) }] };

                    default:
                        throw new Error(`Unknown tool: ${toolName}`);
                }

            default:
                throw new Error(`Unknown method: ${method}`);
        }
    }
}

// Initialize and start MCP server
const credentialServer = new CredentialManagementServer();

// CLI mode for direct execution
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
        case 'validate':
            console.log('🔍 Validating credentials...');
            const validation = credentialServer.validateCredentials();
            console.log(JSON.stringify(validation, null, 2));
            break;

        case 'fix':
            console.log('🛠️  Fixing credential issues...');
            const fixes = credentialServer.fixCredentialsFile();
            console.log(JSON.stringify(fixes, null, 2));
            break;

        case 'status':
            console.log('📊 Credential management status:');
            const status = credentialServer.getStatus();
            console.log(JSON.stringify(status, null, 2));
            break;

        default:
            console.log('🔑 CTAS7 Credential Management Server');
            console.log('Usage: node credentials-server.cjs [validate|fix|status]');
    }
}

// Export for MCP use
module.exports = CredentialManagementServer;