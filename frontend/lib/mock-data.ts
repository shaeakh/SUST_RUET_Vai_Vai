import type { LanguageOption, Problem } from "@/types/code"

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    id: "javascript",
    label: "JavaScript",
    monacoLanguage: "javascript",
    fileExtension: "js",
  },
  {
    id: "python",
    label: "Python",
    monacoLanguage: "python",
    fileExtension: "py",
  },
  {
    id: "java",
    label: "Java",
    monacoLanguage: "java",
    fileExtension: "java",
  },
  {
    id: "cpp",
    label: "C/C++",
    monacoLanguage: "cpp",
    fileExtension: "cpp",
  },
]

export const MOCK_PROBLEMS: Problem[] = [
  {
    id: "two-sum",
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    constraints: [
      "2 ≤ nums.length ≤ 10⁴",
      "-10⁹ ≤ nums[i] ≤ 10⁹",
      "-10⁹ ≤ target ≤ 10⁹",
      "Only one valid answer exists.",
    ],
    examples: [
      {
        id: "ex-1",
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0,1].",
      },
      {
        id: "ex-2",
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
      },
    ],
    starterCode: {
      javascript:
        "function twoSum(nums, target) {\n  // Write your code here\n}\n\nmodule.exports = twoSum;",
      python:
        "from typing import List\n\n\ndef twoSum(nums: List[int], target: int) -> List[int]:\n    # Write your code here\n    ...",
      java:
        "import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[0];\n    }\n}\n",
      cpp:
        "#include <bits/stdc++.h>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your code here\n    return {};\n}\n",
    },
    solutions: {
      javascript:
        "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}\n\nmodule.exports = twoSum;",
      python:
        "from typing import List\n\n\ndef twoSum(nums: List[int], target: int) -> List[int]:\n    hashmap = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in hashmap:\n            return [hashmap[complement], i]\n        hashmap[num] = i\n    return []",
      java:
        "import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[]{map.get(complement), i};\n            }\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}",
      cpp:
        "#include <bits/stdc++.h>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> map;\n    for (int i = 0; i < nums.size(); i++) {\n        int complement = target - nums[i];\n        if (map.find(complement) != map.end()) {\n            return {map[complement], i};\n        }\n        map[nums[i]] = i;\n    }\n    return {};\n}",
    },
    testCases: [
      {
        id: "tc-1",
        input: "nums = [2,7,11,15], target = 9",
        inputJson: { args: [[2, 7, 11, 15], 9] },
        expectedOutput: "[0,1]",
      },
      {
        id: "tc-2",
        input: "nums = [3,2,4], target = 6",
        inputJson: { args: [[3, 2, 4], 6] },
        expectedOutput: "[1,2]",
      },
      {
        id: "tc-3",
        input: "nums = [3,3], target = 6",
        inputJson: { args: [[3, 3], 6] },
        expectedOutput: "[0,1]",
        isHidden: true,
      },
    ],
  },
  {
    id: "reverse-string",
    slug: "reverse-string",
    title: "Reverse String",
    difficulty: "Easy",
    description:
      "Write a function that reverses a string. The input string is given as an array of characters s.",
    constraints: [
      "1 ≤ s.length ≤ 10⁵",
      "s[i] is a printable ascii character.",
      "You must do this by modifying the input array in-place with O(1) extra memory.",
    ],
    examples: [
      {
        id: "ex-1",
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
      },
    ],
    starterCode: {
      javascript:
        "function reverseString(s) {\n  // s is an array of characters\n  // Modify s in-place\n}\n\nmodule.exports = reverseString;",
      python:
        "from typing import List\n\n\ndef reverseString(s: List[str]) -> None:\n    # Modify s in-place\n    ...",
      java:
        "class Solution {\n    public void reverseString(char[] s) {\n        // Modify s in-place\n    }\n}\n",
      cpp:
        "#include <bits/stdc++.h>\nusing namespace std;\n\nvoid reverseString(vector<char>& s) {\n    // Modify s in-place\n}\n",
    },
    solutions: {
      javascript:
        "function reverseString(s) {\n  let left = 0;\n  let right = s.length - 1;\n  while (left < right) {\n    [s[left], s[right]] = [s[right], s[left]];\n    left++;\n    right--;\n  }\n}\n\nmodule.exports = reverseString;",
      python:
        "from typing import List\n\n\ndef reverseString(s: List[str]) -> None:\n    left, right = 0, len(s) - 1\n    while left < right:\n        s[left], s[right] = s[right], s[left]\n        left += 1\n        right -= 1",
      java:
        "class Solution {\n    public void reverseString(char[] s) {\n        int left = 0;\n        int right = s.length - 1;\n        while (left < right) {\n            char temp = s[left];\n            s[left] = s[right];\n            s[right] = temp;\n            left++;\n            right--;\n        }\n    }\n}",
      cpp:
        "#include <bits/stdc++.h>\nusing namespace std;\n\nvoid reverseString(vector<char>& s) {\n    int left = 0;\n    int right = s.size() - 1;\n    while (left < right) {\n        swap(s[left], s[right]);\n        left++;\n        right--;\n    }\n}",
    },
    testCases: [
      {
        id: "tc-1",
        input: 's = ["h","e","l","l","o"]',
        inputJson: { args: [["h", "e", "l", "l", "o"]] },
        expectedOutput: '["o","l","l","e","h"]',
      },
      {
        id: "tc-2",
        input: 's = ["H","a","n","n","a","h"]',
        inputJson: { args: [["H", "a", "n", "n", "a", "h"]] },
        expectedOutput: '["h","a","n","n","a","H"]',
        isHidden: true,
      },
    ],
  },
  {
    id: "valid-parentheses",
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Medium",
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.",
    constraints: [
      "1 ≤ s.length ≤ 10⁴",
      "s consists of parentheses only '()[]{}'.",
    ],
    examples: [
      {
        id: "ex-1",
        input: 's = "()"',
        output: "true",
      },
      {
        id: "ex-2",
        input: 's = "()[]{}"',
        output: "true",
      },
      {
        id: "ex-3",
        input: 's = "(]"',
        output: "false",
      },
    ],
    starterCode: {
      javascript:
        "function isValid(s) {\n  // Write your code here\n}\n\nmodule.exports = isValid;",
      python:
        "def isValid(s: str) -> bool:\n    # Write your code here\n    ...",
      java:
        "import java.util.*;\n\nclass Solution {\n    public boolean isValid(String s) {\n        // Write your code here\n        return false;\n    }\n}\n",
      cpp:
        "#include <bits/stdc++.h>\nusing namespace std;\n\nbool isValid(string s) {\n    // Write your code here\n    return false;\n}\n",
    },
    solutions: {
      javascript:
        "function isValid(s) {\n  const stack = [];\n  const pairs = {\n    '(': ')',\n    '{': '}',\n    '[': ']'\n  };\n  \n  for (let char of s) {\n    if (pairs[char]) {\n      stack.push(char);\n    } else {\n      if (stack.length === 0 || pairs[stack.pop()] !== char) {\n        return false;\n      }\n    }\n  }\n  \n  return stack.length === 0;\n}\n\nmodule.exports = isValid;",
      python:
        "def isValid(s: str) -> bool:\n    stack = []\n    pairs = {'(': ')', '{': '}', '[': ']'}\n    \n    for char in s:\n        if char in pairs:\n            stack.append(char)\n        else:\n            if not stack or pairs[stack.pop()] != char:\n                return False\n    \n    return len(stack) == 0",
      java:
        "import java.util.*;\n\nclass Solution {\n    public boolean isValid(String s) {\n        Stack<Character> stack = new Stack<>();\n        Map<Character, Character> pairs = new HashMap<>();\n        pairs.put('(', ')');\n        pairs.put('{', '}');\n        pairs.put('[', ']');\n        \n        for (char c : s.toCharArray()) {\n            if (pairs.containsKey(c)) {\n                stack.push(c);\n            } else {\n                if (stack.isEmpty() || pairs.get(stack.pop()) != c) {\n                    return false;\n                }\n            }\n        }\n        \n        return stack.isEmpty();\n    }\n}",
      cpp:
        "#include <bits/stdc++.h>\nusing namespace std;\n\nbool isValid(string s) {\n    stack<char> st;\n    unordered_map<char, char> pairs = {\n        {'(', ')'},\n        {'{', '}'},\n        {'[', ']'}\n    };\n    \n    for (char c : s) {\n        if (pairs.find(c) != pairs.end()) {\n            st.push(c);\n        } else {\n            if (st.empty() || pairs[st.top()] != c) {\n                return false;\n            }\n            st.pop();\n        }\n    }\n    \n    return st.empty();\n}",
    },
    testCases: [
      {
        id: "tc-1",
        input: 's = "()"',
        inputJson: { args: ["()"] },
        expectedOutput: "true",
      },
      {
        id: "tc-2",
        input: 's = "()[]{}"',
        inputJson: { args: ["()[]{}"] },
        expectedOutput: "true",
      },
      {
        id: "tc-3",
        input: 's = "(]"',
        inputJson: { args: ["(]"] },
        expectedOutput: "false",
      },
      {
        id: "tc-4",
        input: 's = "([)]"',
        inputJson: { args: ["([)]"] },
        expectedOutput: "false",
        isHidden: true,
      },
    ],
  },
]

export function getProblemBySlug(slug: string) {
  return MOCK_PROBLEMS.find((p) => p.slug === slug) ?? null
}

