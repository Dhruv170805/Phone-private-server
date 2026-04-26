const runAuditAgent = require('./auditor');
const runExecutorAgent = require('./executor');

async function runSupervisorAgent() {
  console.log('---------------------------------------------------------');
  console.log('🤖 SUPERVISOR AGENT: Initiating System Orchestration...');
  console.log('---------------------------------------------------------');

  const startTime = Date.now();
  const report = {
    audit: null,
    executor: null,
    decision: 'WAITING',
    metrics: {}
  };

  // 1. Run Auditor
  report.audit = await runAuditAgent();
  
  // 2. Run Executor (only if Auditor doesn't find critical blockers)
  if (report.audit.vulnerabilities > 10) {
     report.decision = 'REJECTED: Too many security vulnerabilities';
  } else {
     report.executor = await runExecutorAgent();
  }

  // Final Decision Logic
  if (report.executor && report.executor.status === 'PASS' && report.audit.status === 'PASS') {
    report.decision = 'APPROVED: System is Stable & Production Ready';
  } else {
    report.decision = 'REJECTED: Functional failures or code quality issues detected';
  }

  const endTime = Date.now();
  report.metrics.duration = `${(endTime - startTime) / 1000}s`;

  // Output Final Report
  console.log('\n---------------------------------------------------------');
  console.log('📊 FINAL TEST REPORT');
  console.log('---------------------------------------------------------');
  console.log(`Decision:   ${report.decision}`);
  console.log(`Duration:   ${report.metrics.duration}`);
  console.log(`Security:   ${report.audit.status} (${report.audit.vulnerabilities} vulnerabilities)`);
  if (report.executor) {
    console.log(`Functional: ${report.executor.status} (${report.executor.failures} failures)`);
    report.executor.logs.forEach(log => console.log(`   ${log}`));
  }
  console.log('---------------------------------------------------------');

  if (report.decision.startsWith('APPROVED')) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runSupervisorAgent();
