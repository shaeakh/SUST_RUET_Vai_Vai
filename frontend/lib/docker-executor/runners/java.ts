/**
 * Java runner template
 */

/**
 * Extract method bodies from user's Java code
 * Handles cases where user provides:
 * 1. Full class with imports
 * 2. Just the class without imports
 * 3. Just the method(s) without class wrapper
 */
function extractMethodBodies(userCode: string): string {
  let code = userCode.trim();

  // Remove import statements
  code = code.replace(/^\s*import\s+[\w.*]+;\s*$/gm, "").trim();

  // Remove package statements
  code = code.replace(/^\s*package\s+[\w.]+;\s*$/gm, "").trim();

  // Check if code contains a class definition
  const classMatch = code.match(
    /(?:public\s+)?class\s+\w+\s*\{([\s\S]*)\}\s*$/,
  );

  if (classMatch) {
    // Extract the content inside the class braces
    // We need to handle nested braces properly
    const classStartIndex = code.indexOf("{");
    if (classStartIndex !== -1) {
      let depth = 1;
      let endIndex = classStartIndex + 1;

      for (let i = classStartIndex + 1; i < code.length && depth > 0; i++) {
        if (code[i] === "{") depth++;
        else if (code[i] === "}") depth--;
        if (depth === 0) {
          endIndex = i;
          break;
        }
      }

      // Extract content between outermost braces
      code = code.substring(classStartIndex + 1, endIndex).trim();
    }
  }

  return code;
}

export function generateJavaRunner(
  userCode: string,
  functionName: string = "solution",
): string {
  const methodBodies = extractMethodBodies(userCode);

  return `
import java.util.*;
import java.io.*;

public class Solution {
    // User's methods
    ${methodBodies}

    public static void main(String[] args) {
        try {
            // Read input from stdin
            BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
            StringBuilder input = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                input.append(line);
            }

            // Parse JSON input
            String jsonInput = input.toString().trim();

            // Create instance to call non-static methods
            Solution solution = new Solution();

            // Extract args array from JSON: {"args": [...]}
            int argsStart = jsonInput.indexOf("[");
            int argsEnd = jsonInput.lastIndexOf("]");
            String argsStr = jsonInput.substring(argsStart, argsEnd + 1);

            // Parse arguments and call the function
            Object result = invokeMethod(solution, "${functionName}", argsStr);

            // Output result as JSON
            System.out.println("{\\"output\\": " + toJson(result) + "}");
        } catch (Exception e) {
            e.printStackTrace(System.err);
            System.err.println("{\\"error\\": \\"" + escapeJson(e.getMessage()) + "\\"}");
            System.exit(1);
        }
    }

    private static Object invokeMethod(Solution solution, String methodName, String argsJson) throws Exception {
        List<Object> args = parseJsonArray(argsJson);

        for (java.lang.reflect.Method method : Solution.class.getDeclaredMethods()) {
            if (method.getName().equals(methodName)) {
                int modifiers = method.getModifiers();
                if (java.lang.reflect.Modifier.isStatic(modifiers) &&
                    (method.getName().equals("main") ||
                     method.getName().equals("invokeMethod") ||
                     method.getName().equals("parseJsonArray") ||
                     method.getName().equals("parseJsonValue") ||
                     method.getName().equals("convertArg") ||
                     method.getName().equals("toJson") ||
                     method.getName().equals("escapeJson"))) {
                    continue;
                }

                Class<?>[] paramTypes = method.getParameterTypes();
                if (paramTypes.length == args.size()) {
                    Object[] convertedArgs = new Object[args.size()];
                    boolean canConvert = true;
                    for (int i = 0; i < args.size(); i++) {
                        try {
                            convertedArgs[i] = convertArg(args.get(i), paramTypes[i]);
                        } catch (Exception e) {
                            canConvert = false;
                            break;
                        }
                    }
                    if (canConvert) {
                        method.setAccessible(true);
                        return method.invoke(java.lang.reflect.Modifier.isStatic(modifiers) ? null : solution, convertedArgs);
                    }
                }
            }
        }
        throw new Exception("Method not found: " + methodName + " with " + args.size() + " arguments");
    }

    @SuppressWarnings("unchecked")
    private static Object convertArg(Object arg, Class<?> targetType) {
        if (arg == null) return null;

        // Handle int[]
        if (targetType == int[].class && arg instanceof List) {
            List<?> list = (List<?>) arg;
            int[] arr = new int[list.size()];
            for (int i = 0; i < list.size(); i++) {
                arr[i] = ((Number) list.get(i)).intValue();
            }
            return arr;
        }

        // Handle int[][]
        if (targetType == int[][].class && arg instanceof List) {
            List<?> list = (List<?>) arg;
            int[][] arr = new int[list.size()][];
            for (int i = 0; i < list.size(); i++) {
                List<?> inner = (List<?>) list.get(i);
                arr[i] = new int[inner.size()];
                for (int j = 0; j < inner.size(); j++) {
                    arr[i][j] = ((Number) inner.get(j)).intValue();
                }
            }
            return arr;
        }

        // Handle long[]
        if (targetType == long[].class && arg instanceof List) {
            List<?> list = (List<?>) arg;
            long[] arr = new long[list.size()];
            for (int i = 0; i < list.size(); i++) {
                arr[i] = ((Number) list.get(i)).longValue();
            }
            return arr;
        }

        // Handle double[]
        if (targetType == double[].class && arg instanceof List) {
            List<?> list = (List<?>) arg;
            double[] arr = new double[list.size()];
            for (int i = 0; i < list.size(); i++) {
                arr[i] = ((Number) list.get(i)).doubleValue();
            }
            return arr;
        }

        // Handle String[]
        if (targetType == String[].class && arg instanceof List) {
            List<?> list = (List<?>) arg;
            String[] arr = new String[list.size()];
            for (int i = 0; i < list.size(); i++) {
                arr[i] = list.get(i) == null ? null : list.get(i).toString();
            }
            return arr;
        }

        // Handle char[]
        if (targetType == char[].class && arg instanceof List) {
            List<?> list = (List<?>) arg;
            char[] arr = new char[list.size()];
            for (int i = 0; i < list.size(); i++) {
                String s = list.get(i).toString();
                arr[i] = s.isEmpty() ? '\\0' : s.charAt(0);
            }
            return arr;
        }

        // Handle char
        if ((targetType == char.class || targetType == Character.class) && arg instanceof String) {
            String s = (String) arg;
            return s.isEmpty() ? '\\0' : s.charAt(0);
        }

        // Handle List<Integer>
        if (targetType == List.class && arg instanceof List) {
            List<?> list = (List<?>) arg;
            List<Object> result = new ArrayList<>();
            for (Object item : list) {
                if (item instanceof Number) {
                    result.add(((Number) item).intValue());
                } else {
                    result.add(item);
                }
            }
            return result;
        }

        // Handle primitives
        if (targetType == int.class || targetType == Integer.class) {
            return ((Number) arg).intValue();
        }
        if (targetType == long.class || targetType == Long.class) {
            return ((Number) arg).longValue();
        }
        if (targetType == double.class || targetType == Double.class) {
            return ((Number) arg).doubleValue();
        }
        if (targetType == float.class || targetType == Float.class) {
            return ((Number) arg).floatValue();
        }
        if (targetType == boolean.class || targetType == Boolean.class) {
            return arg;
        }
        if (targetType == String.class) {
            return arg.toString();
        }

        return arg;
    }

    private static List<Object> parseJsonArray(String json) {
        List<Object> result = new ArrayList<>();
        json = json.trim();
        if (!json.startsWith("[") || !json.endsWith("]")) {
            return result;
        }
        json = json.substring(1, json.length() - 1).trim();
        if (json.isEmpty()) return result;

        int depth = 0;
        StringBuilder current = new StringBuilder();
        boolean inString = false;
        boolean escaped = false;

        for (int i = 0; i < json.length(); i++) {
            char c = json.charAt(i);

            if (escaped) {
                current.append(c);
                escaped = false;
                continue;
            }

            if (c == '\\\\') {
                current.append(c);
                escaped = true;
                continue;
            }

            if (c == '"') {
                inString = !inString;
                current.append(c);
                continue;
            }

            if (inString) {
                current.append(c);
                continue;
            }

            if (c == '[' || c == '{') {
                depth++;
                current.append(c);
            } else if (c == ']' || c == '}') {
                depth--;
                current.append(c);
            } else if (c == ',' && depth == 0) {
                result.add(parseJsonValue(current.toString().trim()));
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }

        if (current.length() > 0) {
            result.add(parseJsonValue(current.toString().trim()));
        }

        return result;
    }

    private static Object parseJsonValue(String value) {
        value = value.trim();
        if (value.equals("null")) return null;
        if (value.equals("true")) return true;
        if (value.equals("false")) return false;
        if (value.startsWith("\\"") && value.endsWith("\\"")) {
            // Handle escaped characters in string
            String inner = value.substring(1, value.length() - 1);
            inner = inner.replace("\\\\n", "\\n").replace("\\\\t", "\\t").replace("\\\\r", "\\r").replace("\\\\\\"", "\\"").replace("\\\\\\\\", "\\\\");
            return inner;
        }
        if (value.startsWith("[")) {
            return parseJsonArray(value);
        }
        try {
            if (value.contains(".")) {
                return Double.parseDouble(value);
            }
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            return value;
        }
    }

    private static String toJson(Object obj) {
        if (obj == null) return "null";
        if (obj instanceof Boolean) return obj.toString();
        if (obj instanceof Number) return obj.toString();
        if (obj instanceof Character) return "\\"" + escapeJson(obj.toString()) + "\\"";
        if (obj instanceof String) return "\\"" + escapeJson((String) obj) + "\\"";
        if (obj instanceof int[]) {
            int[] arr = (int[]) obj;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < arr.length; i++) {
                if (i > 0) sb.append(",");
                sb.append(arr[i]);
            }
            sb.append("]");
            return sb.toString();
        }
        if (obj instanceof long[]) {
            long[] arr = (long[]) obj;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < arr.length; i++) {
                if (i > 0) sb.append(",");
                sb.append(arr[i]);
            }
            sb.append("]");
            return sb.toString();
        }
        if (obj instanceof double[]) {
            double[] arr = (double[]) obj;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < arr.length; i++) {
                if (i > 0) sb.append(",");
                sb.append(arr[i]);
            }
            sb.append("]");
            return sb.toString();
        }
        if (obj instanceof boolean[]) {
            boolean[] arr = (boolean[]) obj;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < arr.length; i++) {
                if (i > 0) sb.append(",");
                sb.append(arr[i]);
            }
            sb.append("]");
            return sb.toString();
        }
        if (obj instanceof char[]) {
            char[] arr = (char[]) obj;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < arr.length; i++) {
                if (i > 0) sb.append(",");
                sb.append("\\"").append(escapeJson(String.valueOf(arr[i]))).append("\\"");
            }
            sb.append("]");
            return sb.toString();
        }
        if (obj instanceof int[][]) {
            int[][] arr = (int[][]) obj;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < arr.length; i++) {
                if (i > 0) sb.append(",");
                sb.append(toJson(arr[i]));
            }
            sb.append("]");
            return sb.toString();
        }
        if (obj instanceof String[]) {
            String[] arr = (String[]) obj;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < arr.length; i++) {
                if (i > 0) sb.append(",");
                sb.append(toJson(arr[i]));
            }
            sb.append("]");
            return sb.toString();
        }
        if (obj instanceof List) {
            List<?> list = (List<?>) obj;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < list.size(); i++) {
                if (i > 0) sb.append(",");
                sb.append(toJson(list.get(i)));
            }
            sb.append("]");
            return sb.toString();
        }
        return "\\"" + escapeJson(obj.toString()) + "\\"";
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\\\", "\\\\\\\\").replace("\\"", "\\\\\\"").replace("\\n", "\\\\n").replace("\\r", "\\\\r").replace("\\t", "\\\\t");
    }
}
`.trim();
}
