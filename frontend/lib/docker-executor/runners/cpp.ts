/**
 * C++ runner template
 */

/**
 * Extract includes and using statements from user code
 */
function extractPreprocessorAndUsing(code: string): {
  includes: string[];
  usings: string[];
  remainingCode: string;
} {
  const includes: string[] = [];
  const usings: string[] = [];
  const lines = code.split("\n");
  const remainingLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#include")) {
      includes.push(trimmed);
    } else if (trimmed.startsWith("using ")) {
      usings.push(trimmed);
    } else {
      remainingLines.push(line);
    }
  }

  return {
    includes,
    usings,
    remainingCode: remainingLines.join("\n").trim(),
  };
}

/**
 * Check if user has bits/stdc++.h include
 */
function hasStdcPlusPlusInclude(includes: string[]): boolean {
  return includes.some((inc) => inc.includes("bits/stdc++.h"));
}

/**
 * Extract argument types from function signature
 */
function extractArgumentTypes(code: string, functionName: string): string[] {
  // Match function signature: returnType functionName(type1 arg1, type2 arg2, ...)
  const regex = new RegExp(
    `[\\w<>\\[\\]*&:\\s]+\\s+${functionName}\\s*\\(([^)]*)\\)`,
    "s",
  );
  const match = code.match(regex);

  if (!match || !match[1]) return [];

  const paramsStr = match[1].trim();
  if (!paramsStr) return [];

  // Split by comma, but respect angle brackets for templates
  const params: string[] = [];
  let depth = 0;
  let current = "";

  for (const char of paramsStr) {
    if (char === "<") depth++;
    else if (char === ">") depth--;
    else if (char === "," && depth === 0) {
      params.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  if (current.trim()) params.push(current.trim());

  // Extract just the type from each parameter (remove variable name)
  return params.map((param) => {
    const cleaned = param.trim();
    // Match type (including templates, const, &, *) followed by variable name
    const typeMatch = cleaned.match(
      /^((?:const\s+)?[\w:]+(?:<[^>]+>)?(?:\s*[\*&])*)\s+\w+$/,
    );
    if (typeMatch) {
      return typeMatch[1].trim();
    }
    // Try without variable name (maybe it's just a type)
    return cleaned;
  });
}

/**
 * Get the base type for conversion (strips const and &)
 */
function getBaseType(type: string): string {
  return type
    .replace(/const\s+/g, "")
    .replace(/&/g, "")
    .replace(/\s+/g, "")
    .trim();
}

/**
 * Generate conversion code for a given C++ type
 */
function getConversionFunction(type: string, argIndex: number): string {
  const baseType = getBaseType(type);

  if (baseType === "int") return `toInt(args[${argIndex}])`;
  if (baseType === "long" || baseType === "longlong")
    return `toLong(args[${argIndex}])`;
  if (baseType === "double" || baseType === "float")
    return `toDouble(args[${argIndex}])`;
  if (baseType === "bool") return `toBool(args[${argIndex}])`;
  if (baseType === "string" || baseType === "std::string")
    return `toStr(args[${argIndex}])`;
  if (baseType === "char") return `toChar(args[${argIndex}])`;

  if (baseType === "vector<int>" || baseType === "std::vector<int>")
    return `toVectorInt(args[${argIndex}])`;
  if (baseType === "vector<longlong>" || baseType === "std::vector<longlong>")
    return `toVectorLong(args[${argIndex}])`;
  if (baseType === "vector<double>" || baseType === "std::vector<double>")
    return `toVectorDouble(args[${argIndex}])`;
  if (
    baseType === "vector<string>" ||
    baseType === "std::vector<string>" ||
    baseType === "vector<std::string>"
  )
    return `toVectorString(args[${argIndex}])`;
  if (baseType === "vector<char>" || baseType === "std::vector<char>")
    return `toVectorChar(args[${argIndex}])`;
  if (baseType === "vector<bool>" || baseType === "std::vector<bool>")
    return `toVectorBool(args[${argIndex}])`;

  if (
    baseType === "vector<vector<int>>" ||
    baseType === "std::vector<std::vector<int>>"
  )
    return `toVector2DInt(args[${argIndex}])`;
  if (
    baseType === "vector<vector<string>>" ||
    baseType === "std::vector<std::vector<string>>"
  )
    return `toVector2DString(args[${argIndex}])`;
  if (
    baseType === "vector<vector<char>>" ||
    baseType === "std::vector<std::vector<char>>"
  )
    return `toVector2DChar(args[${argIndex}])`;

  // Default: try to parse as int
  return `toInt(args[${argIndex}])`;
}

/**
 * Get the C++ type declaration for storing the argument
 */
function getCppTypeDeclaration(type: string): string {
  const baseType = getBaseType(type);

  if (baseType === "int") return "int";
  if (baseType === "long" || baseType === "longlong") return "long long";
  if (baseType === "double") return "double";
  if (baseType === "float") return "float";
  if (baseType === "bool") return "bool";
  if (baseType === "string" || baseType === "std::string") return "string";
  if (baseType === "char") return "char";

  if (baseType === "vector<int>" || baseType === "std::vector<int>")
    return "vector<int>";
  if (baseType === "vector<longlong>" || baseType === "std::vector<longlong>")
    return "vector<long long>";
  if (baseType === "vector<double>" || baseType === "std::vector<double>")
    return "vector<double>";
  if (
    baseType === "vector<string>" ||
    baseType === "std::vector<string>" ||
    baseType === "vector<std::string>"
  )
    return "vector<string>";
  if (baseType === "vector<char>" || baseType === "std::vector<char>")
    return "vector<char>";
  if (baseType === "vector<bool>" || baseType === "std::vector<bool>")
    return "vector<bool>";

  if (
    baseType === "vector<vector<int>>" ||
    baseType === "std::vector<std::vector<int>>"
  )
    return "vector<vector<int>>";
  if (
    baseType === "vector<vector<string>>" ||
    baseType === "std::vector<std::vector<string>>"
  )
    return "vector<vector<string>>";
  if (
    baseType === "vector<vector<char>>" ||
    baseType === "std::vector<std::vector<char>>"
  )
    return "vector<vector<char>>";

  return "int";
}

/**
 * Check if user code contains a class definition
 */
function hasClassDefinition(code: string): boolean {
  return /\bclass\s+\w+\s*\{/.test(code);
}

/**
 * Wrap user code in Solution class if not already wrapped
 */
function wrapInSolutionClass(code: string): string {
  if (hasClassDefinition(code)) {
    return code;
  }

  return `class Solution {
public:
    ${code}
};`;
}

export function generateCppRunner(
  userCode: string,
  functionName: string,
): string {
  // Extract includes and using statements from user code
  const { includes, usings, remainingCode } =
    extractPreprocessorAndUsing(userCode);

  // Wrap remaining code in Solution class if needed
  const wrappedCode = wrapInSolutionClass(remainingCode);

  // Check if user has bits/stdc++.h
  const hasStdcpp = hasStdcPlusPlusInclude(includes);

  // Extract argument types from user's code
  const argTypes = extractArgumentTypes(wrappedCode, functionName);

  // Generate argument declarations and conversions
  // Store in variables first to handle non-const references
  const argDeclarations = argTypes
    .map((type, i) => {
      const cppType = getCppTypeDeclaration(type);
      const conversion = getConversionFunction(type, i);
      return `        ${cppType} arg${i} = ${conversion};`;
    })
    .join("\n");

  const argsList = argTypes.map((_, i) => `arg${i}`).join(", ");

  // Build includes - use user's if they have bits/stdc++.h, otherwise use ours
  const includesSection = hasStdcpp
    ? includes.join("\n")
    : `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <cstdlib>
#include <map>
#include <unordered_map>
#include <set>
#include <unordered_set>
#include <queue>
#include <stack>
#include <algorithm>
#include <climits>
#include <cmath>
#include <numeric>
#include <deque>
#include <list>
${includes.filter((inc) => !inc.includes("bits/stdc++.h")).join("\n")}`;

  // Build using statements
  const usingSection =
    usings.length > 0 ? usings.join("\n") : "using namespace std;";

  return `${includesSection}

${usingSection}

// ============== JSON Parsing ==============

string __trim(const string& s) {
    size_t start = s.find_first_not_of(" \\t\\n\\r");
    if (start == string::npos) return "";
    size_t end = s.find_last_not_of(" \\t\\n\\r");
    return s.substr(start, end - start + 1);
}

void __skipWhitespace(const string& json, size_t& pos) {
    while (pos < json.size() && isspace(json[pos])) pos++;
}

string __parseJsonString(const string& json, size_t& pos) {
    __skipWhitespace(json, pos);
    if (pos >= json.size() || json[pos] != '"') return "";
    pos++;
    string result;
    while (pos < json.size() && json[pos] != '"') {
        if (json[pos] == '\\\\' && pos + 1 < json.size()) {
            pos++;
            switch (json[pos]) {
                case 'n': result += '\\n'; break;
                case 't': result += '\\t'; break;
                case 'r': result += '\\r'; break;
                case '"': result += '"'; break;
                case '\\\\': result += '\\\\'; break;
                default: result += json[pos]; break;
            }
        } else {
            result += json[pos];
        }
        pos++;
    }
    if (pos < json.size()) pos++;
    return result;
}

string __parseJsonValue(const string& json, size_t& pos);

vector<string> __parseJsonArrayRaw(const string& json, size_t& pos) {
    vector<string> result;
    __skipWhitespace(json, pos);
    if (pos >= json.size() || json[pos] != '[') return result;
    pos++;
    __skipWhitespace(json, pos);

    while (pos < json.size() && json[pos] != ']') {
        string value = __parseJsonValue(json, pos);
        result.push_back(value);
        __skipWhitespace(json, pos);
        if (pos < json.size() && json[pos] == ',') pos++;
        __skipWhitespace(json, pos);
    }
    if (pos < json.size()) pos++;
    return result;
}

string __parseJsonValue(const string& json, size_t& pos) {
    __skipWhitespace(json, pos);
    if (pos >= json.size()) return "";

    if (json[pos] == '"') {
        size_t start = pos;
        __parseJsonString(json, pos);
        return json.substr(start, pos - start);
    }

    if (json[pos] == '[') {
        size_t start = pos;
        int depth = 0;
        bool inStr = false;
        do {
            if (!inStr && json[pos] == '[') depth++;
            else if (!inStr && json[pos] == ']') depth--;
            else if (json[pos] == '"' && (pos == 0 || json[pos-1] != '\\\\')) inStr = !inStr;
            pos++;
        } while (pos < json.size() && depth > 0);
        return json.substr(start, pos - start);
    }

    if (json[pos] == '{') {
        size_t start = pos;
        int depth = 0;
        bool inStr = false;
        do {
            if (!inStr && json[pos] == '{') depth++;
            else if (!inStr && json[pos] == '}') depth--;
            else if (json[pos] == '"' && (pos == 0 || json[pos-1] != '\\\\')) inStr = !inStr;
            pos++;
        } while (pos < json.size() && depth > 0);
        return json.substr(start, pos - start);
    }

    size_t start = pos;
    while (pos < json.size() && json[pos] != ',' && json[pos] != ']' && json[pos] != '}' && !isspace(json[pos])) {
        pos++;
    }
    return __trim(json.substr(start, pos - start));
}

vector<string> extractArgs(const string& json) {
    size_t argsPos = json.find("\\"args\\"");
    if (argsPos == string::npos) return {};
    size_t colonPos = json.find(':', argsPos);
    if (colonPos == string::npos) return {};
    size_t pos = colonPos + 1;
    return __parseJsonArrayRaw(json, pos);
}

// ============== Type Conversions ==============

int toInt(const string& s) { return stoi(__trim(s)); }
long long toLong(const string& s) { return stoll(__trim(s)); }
double toDouble(const string& s) { return stod(__trim(s)); }
bool toBool(const string& s) { return __trim(s) == "true"; }

string toStr(const string& s) {
    string t = __trim(s);
    if (t.size() >= 2 && t[0] == '"' && t.back() == '"') {
        size_t pos = 0;
        return __parseJsonString(t, pos);
    }
    return t;
}

char toChar(const string& s) {
    string str = toStr(s);
    return str.empty() ? '\\0' : str[0];
}

vector<int> toVectorInt(const string& s) {
    vector<int> result;
    size_t pos = 0;
    for (const auto& item : __parseJsonArrayRaw(__trim(s), pos)) {
        result.push_back(toInt(item));
    }
    return result;
}

vector<long long> toVectorLong(const string& s) {
    vector<long long> result;
    size_t pos = 0;
    for (const auto& item : __parseJsonArrayRaw(__trim(s), pos)) {
        result.push_back(toLong(item));
    }
    return result;
}

vector<double> toVectorDouble(const string& s) {
    vector<double> result;
    size_t pos = 0;
    for (const auto& item : __parseJsonArrayRaw(__trim(s), pos)) {
        result.push_back(toDouble(item));
    }
    return result;
}

vector<string> toVectorString(const string& s) {
    vector<string> result;
    size_t pos = 0;
    for (const auto& item : __parseJsonArrayRaw(__trim(s), pos)) {
        result.push_back(toStr(item));
    }
    return result;
}

vector<char> toVectorChar(const string& s) {
    vector<char> result;
    size_t pos = 0;
    for (const auto& item : __parseJsonArrayRaw(__trim(s), pos)) {
        result.push_back(toChar(item));
    }
    return result;
}

vector<bool> toVectorBool(const string& s) {
    vector<bool> result;
    size_t pos = 0;
    for (const auto& item : __parseJsonArrayRaw(__trim(s), pos)) {
        result.push_back(toBool(item));
    }
    return result;
}

vector<vector<int>> toVector2DInt(const string& s) {
    vector<vector<int>> result;
    size_t pos = 0;
    for (const auto& item : __parseJsonArrayRaw(__trim(s), pos)) {
        result.push_back(toVectorInt(item));
    }
    return result;
}

vector<vector<string>> toVector2DString(const string& s) {
    vector<vector<string>> result;
    size_t pos = 0;
    for (const auto& item : __parseJsonArrayRaw(__trim(s), pos)) {
        result.push_back(toVectorString(item));
    }
    return result;
}

vector<vector<char>> toVector2DChar(const string& s) {
    vector<vector<char>> result;
    size_t pos = 0;
    for (const auto& item : __parseJsonArrayRaw(__trim(s), pos)) {
        result.push_back(toVectorChar(item));
    }
    return result;
}

// ============== JSON Output ==============

string __escapeJson(const string& s) {
    string result;
    for (char c : s) {
        switch (c) {
            case '"': result += "\\\\\\""; break;
            case '\\\\': result += "\\\\\\\\"; break;
            case '\\n': result += "\\\\n"; break;
            case '\\r': result += "\\\\r"; break;
            case '\\t': result += "\\\\t"; break;
            default: result += c; break;
        }
    }
    return result;
}

string toJson(int v) { return to_string(v); }
string toJson(long long v) { return to_string(v); }
string toJson(size_t v) { return to_string(v); }
string toJson(double v) { ostringstream o; o << v; return o.str(); }
string toJson(bool v) { return v ? "true" : "false"; }
string toJson(const string& v) { return "\\"" + __escapeJson(v) + "\\""; }
string toJson(char v) { return "\\"" + __escapeJson(string(1, v)) + "\\""; }

string toJson(const vector<int>& a) {
    string r = "[";
    for (size_t i = 0; i < a.size(); i++) { if (i) r += ","; r += toJson(a[i]); }
    return r + "]";
}

string toJson(const vector<long long>& a) {
    string r = "[";
    for (size_t i = 0; i < a.size(); i++) { if (i) r += ","; r += toJson(a[i]); }
    return r + "]";
}

string toJson(const vector<double>& a) {
    string r = "[";
    for (size_t i = 0; i < a.size(); i++) { if (i) r += ","; r += toJson(a[i]); }
    return r + "]";
}

string toJson(const vector<bool>& a) {
    string r = "[";
    for (size_t i = 0; i < a.size(); i++) { if (i) r += ","; r += toJson((bool)a[i]); }
    return r + "]";
}

string toJson(const vector<string>& a) {
    string r = "[";
    for (size_t i = 0; i < a.size(); i++) { if (i) r += ","; r += toJson(a[i]); }
    return r + "]";
}

string toJson(const vector<char>& a) {
    string r = "[";
    for (size_t i = 0; i < a.size(); i++) { if (i) r += ","; r += toJson(a[i]); }
    return r + "]";
}

string toJson(const vector<vector<int>>& a) {
    string r = "[";
    for (size_t i = 0; i < a.size(); i++) { if (i) r += ","; r += toJson(a[i]); }
    return r + "]";
}

string toJson(const vector<vector<string>>& a) {
    string r = "[";
    for (size_t i = 0; i < a.size(); i++) { if (i) r += ","; r += toJson(a[i]); }
    return r + "]";
}

string toJson(const vector<vector<char>>& a) {
    string r = "[";
    for (size_t i = 0; i < a.size(); i++) { if (i) r += ","; r += toJson(a[i]); }
    return r + "]";
}

// ============== User Code ==============

${wrappedCode}

// ============== Main ==============

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    try {
        string input, line;
        while (getline(cin, line)) input += line;

        vector<string> args = extractArgs(input);
        Solution sol;

        // Convert arguments (stored in variables to support non-const references)
${argDeclarations}

        auto result = sol.${functionName}(${argsList});

        cout << "{\\"output\\": " << toJson(result) << "}" << endl;
    } catch (const exception& e) {
        cerr << "{\\"error\\": \\"" << __escapeJson(e.what()) << "\\"}" << endl;
        return 1;
    }

    return 0;
}
`.trim();
}
