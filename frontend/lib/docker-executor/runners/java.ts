/**
 * Java runner template
 */

export function generateJavaRunner(
  userCode: string,
  className: string = "Solution",
): string {
  return `
import java.util.*;
import java.io.*;

public class ${className} {
    public static void main(String[] args) {
        try {
            // Read input from stdin
            Scanner scanner = new Scanner(System.in);
            StringBuilder input = new StringBuilder();
            while (scanner.hasNextLine()) {
                input.append(scanner.nextLine());
            }
            
            // Parse JSON (simplified - in production use a JSON library)
            // For now, we'll use a simple approach
            String jsonInput = input.toString().trim();
            
            // User's code
            ${userCode}
            
            // Note: Java execution requires parsing JSON and calling the method
            // This is a simplified version - actual implementation would need
            // proper JSON parsing and method invocation
            
            System.out.println("{\\"output\\": \\"Not implemented\\"}");
        } catch (Exception e) {
            System.err.println("{\\"error\\": \\"" + e.getMessage() + "\\"}");
            System.exit(1);
        }
    }
}
`.trim()
}
