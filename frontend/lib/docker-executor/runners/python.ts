/**
 * Python runner template
 */

export function generatePythonRunner(
  userCode: string,
  functionName: string,
): string {
  return `
import json
import sys

try:
    # Read input from stdin
    input_data = json.load(sys.stdin)
    
    # User's code
    ${userCode}
    
    # Execute the function
    result = ${functionName}(*input_data['args'])
    
    # Output result as JSON
    print(json.dumps({'output': result}))
except Exception as e:
    # Output error as JSON
    print(json.dumps({
        'error': str(e),
        'type': type(e).__name__
    }), file=sys.stderr)
    sys.exit(1)
`.trim()
}
