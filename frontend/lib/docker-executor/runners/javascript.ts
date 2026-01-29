/**
 * JavaScript runner template
 * This template is used to generate the actual runner script
 * that executes user code in a Docker container
 */

export function generateJavaScriptRunner(
  userCode: string,
  functionName: string,
): string {
  return `
const fs = require('fs');

// User's code (at module level)
${userCode}

// Execute and handle errors
try {
  // Read input from stdin
  const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));

  // Execute the function
  const result = ${functionName}(...input.args);

  // Output result as JSON
  console.log(JSON.stringify({ output: result }));
} catch (error) {
  // Output error as JSON
  console.error(JSON.stringify({
    error: error.message,
    stack: error.stack
  }));
  process.exit(1);
}
`.trim();
}
