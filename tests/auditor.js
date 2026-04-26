const { execSync } = require('child_process');
const fs = require('fs');

async function runAuditAgent() {
  console.log('🕵️ Auditor Agent: Starting Security & Quality Scan...');
  const results = {
    vulnerabilities: 0,
    qualityIssues: 0,
    status: 'PASS'
  };

  try {
    // 1. Security Scan via npm audit
    console.log('  - Scanning for package vulnerabilities...');
    const auditOutput = execSync('npm audit --json', { encoding: 'utf8' });
    const auditData = JSON.parse(auditOutput);
    results.vulnerabilities = auditData.metadata.vulnerabilities.total;

    // 2. Code Quality Check (Custom Regex check for SQL Injection)
    console.log('  - Scanning source code for SQL injection risks...');
    const files = ['src/db/dao.js', 'src/db/schema.js'];
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('${')) { // Warning for string interpolation in queries
        console.warn(`    ⚠️ Potential SQL Injection risk in ${file}`);
        results.qualityIssues++;
      }
    });

    if (results.vulnerabilities > 0 || results.qualityIssues > 0) {
      results.status = 'FAIL';
    }

    return results;
  } catch (err) {
    // npm audit returns non-zero if vulnerabilities found
    results.status = 'FAIL';
    return results;
  }
}

module.exports = runAuditAgent;
