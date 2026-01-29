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
from typing import List, Optional, Dict, Set, Tuple

# User's code (at module level)
${userCode}

# Execute and handle errors
try:
    # Read input from stdin
    input_data = json.load(sys.stdin)

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
`.trim();
}
