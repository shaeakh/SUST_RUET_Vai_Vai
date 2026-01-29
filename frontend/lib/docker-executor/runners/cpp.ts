/**
 * C++ runner template
 */

export function generateCppRunner(
  userCode: string,
  functionName: string,
): string {
  return `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <cstdlib>

// Simple JSON parsing helper (basic implementation)
// In production, use a proper JSON library

${userCode}

int main() {
    try {
        // Read input from stdin
        std::string input;
        std::string line;
        while (std::getline(std::cin, line)) {
            input += line;
        }
        
        // Parse JSON and extract arguments
        // This is simplified - actual implementation needs proper JSON parsing
        
        // For now, output placeholder
        std::cout << "{\\"output\\": \\"Not implemented\\"}" << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "{\\"error\\": \\"" << e.what() << "\\"}" << std::endl;
        return 1;
    }
    return 0;
}
`.trim()
}
