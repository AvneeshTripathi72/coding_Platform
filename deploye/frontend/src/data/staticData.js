export const STATIC_PROBLEMS = [
  {
    _id: "679801000000000000000001",
    title: "Two Sum",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.\n\nYou may assume that each input would have ***exactly* one solution**, and you may not use the *same* element twice.\n\nYou can return the answer in any order.`,
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
    acceptanceRate: 54.2,
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    visibleTestCases: [
      {
        input: "[2,7,11,15]\n9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "[3,2,4]\n6",
        output: "[1,2]",
        explanation: "nums[1] + nums[2] == 6, return [1, 2]."
      }
    ],
    hiddenTestCases: [
      { input: "[3,3]\n6", output: "[0,1]" },
      { input: "[1,5,3,7,9]\n12", output: "[1,3]" }
    ],
    starterCode: [
      {
        language: "javascript",
        initialCode: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // Write your code here\n}"
      },
      {
        language: "python",
        initialCode: "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Write your code here\n        pass"
      },
      {
        language: "cpp",
        initialCode: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n    }\n};"
      }
    ]
  },
  {
    _id: "679801000000000000000002",
    title: "Palindrome Number",
    description: `Given an integer \`x\`, return \`true\` *if* \`x\` *is a palindrome, and* \`false\` *otherwise*.\n\nAn integer is a **palindrome** when it reads the same backward as forward.`,
    difficulty: "Easy",
    tags: ["Math", "String"],
    acceptanceRate: 56.8,
    constraints: [
      "-2^31 <= x <= 2^31 - 1"
    ],
    visibleTestCases: [
      { input: "121", output: "true", explanation: "121 reads as 121 from left to right and from right to left." },
      { input: "-121", output: "false", explanation: "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome." }
    ],
    hiddenTestCases: [
      { input: "10", output: "false" },
      { input: "12321", output: "true" }
    ],
    starterCode: [
      {
        language: "javascript",
        initialCode: "function isPalindrome(x) {\n    // Write your code here\n}"
      },
      {
        language: "python",
        initialCode: "class Solution:\n    def isPalindrome(self, x: int) -> bool:\n        pass"
      }
    ]
  },
  {
    _id: "679801000000000000000003",
    title: "Valid Parentheses",
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.`,
    difficulty: "Easy",
    tags: ["Stack", "String"],
    acceptanceRate: 41.5,
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'."
    ],
    visibleTestCases: [
      { input: "\"()\"", output: "true" },
      { input: "\"()[]{}\"", output: "true" },
      { input: "\"(]\"", output: "false" }
    ],
    hiddenTestCases: [
      { input: "\"([{}])\"", output: "true" },
      { input: "\"[(])\"", output: "false" }
    ],
    starterCode: [
      {
        language: "javascript",
        initialCode: "function isValid(s) {\n    // Write your code here\n}"
      },
      {
        language: "python",
        initialCode: "class Solution:\n    def isValid(self, s: str) -> bool:\n        pass"
      }
    ]
  },
  {
    _id: "679801000000000000000004",
    title: "Longest Substring Without Repeating Characters",
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    difficulty: "Medium",
    tags: ["Hash Table", "String", "Sliding Window"],
    acceptanceRate: 34.8,
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces."
    ],
    visibleTestCases: [
      { input: "\"abcabcbb\"", output: "3", explanation: "The answer is \"abc\", with the length of 3." },
      { input: "\"bbbbb\"", output: "1", explanation: "The answer is \"b\", with the length of 1." }
    ],
    hiddenTestCases: [
      { input: "\"pwwkew\"", output: "3" }
    ],
    starterCode: [
      {
        language: "javascript",
        initialCode: "function lengthOfLongestSubstring(s) {\n    // Write your code here\n}"
      },
      {
        language: "python",
        initialCode: "class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        pass"
      }
    ]
  },
  {
    _id: "679801000000000000000005",
    title: "Binary Search",
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.\n\nYou must write an algorithm with \`O(log n)\` runtime complexity.`,
    difficulty: "Easy",
    tags: ["Array", "Binary Search"],
    acceptanceRate: 58.1,
    constraints: [
      "1 <= nums.length <= 10^4",
      "-10^4 < nums[i], target < 10^4",
      "All the integers in nums are unique.",
      "nums is sorted in ascending order."
    ],
    visibleTestCases: [
      { input: "[-1,0,3,5,9,12]\n9", output: "4", explanation: "9 exists in nums and its index is 4" },
      { input: "[-1,0,3,5,9,12]\n2", output: "-1", explanation: "2 does not exist in nums so return -1" }
    ],
    hiddenTestCases: [
      { input: "[5]\n5", output: "0" }
    ],
    starterCode: [
      {
        language: "javascript",
        initialCode: "function search(nums, target) {\n    // Write your code here\n}"
      },
      {
        language: "python",
        initialCode: "class Solution:\n    def search(self, nums: list[int], target: int) -> int:\n        pass"
      }
    ]
  },
  {
    _id: "679801000000000000000006",
    title: "Maximum Subarray (Kadane's Algorithm)",
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return *its sum*.`,
    difficulty: "Medium",
    tags: ["Array", "Divide and Conquer", "Dynamic Programming"],
    acceptanceRate: 50.7,
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4"
    ],
    visibleTestCases: [
      { input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum 6." },
      { input: "[1]", output: "1" },
      { input: "[5,4,-1,7,8]", output: "23" }
    ],
    hiddenTestCases: [
      { input: "[-1]", output: "-1" }
    ],
    starterCode: [
      {
        language: "javascript",
        initialCode: "function maxSubArray(nums) {\n    // Write your code here\n}"
      },
      {
        language: "python",
        initialCode: "class Solution:\n    def maxSubArray(self, nums: list[int]) -> int:\n        pass"
      }
    ]
  }
];

export const STATIC_CONTESTS = [
  {
    _id: "679802000000000000000001",
    title: "CodeVerse Weekly Contest #1",
    description: "Join weekly competitive programming contest to test your algorithmic problem solving skills with live rankings!",
    startTime: new Date(Date.now() - 3600000).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 7).toISOString(),
    status: "ongoing",
    duration: 90,
    problems: [
      STATIC_PROBLEMS[0],
      STATIC_PROBLEMS[1],
      STATIC_PROBLEMS[2],
      STATIC_PROBLEMS[3]
    ],
    participants: ["user_1", "user_2", "user_3"],
    isOfficial: true
  },
  {
    _id: "679802000000000000000002",
    title: "Biweekly Interview Algorithm Sprint",
    description: "Curated contest featuring standard technical interview questions from Google, Amazon, and Microsoft.",
    startTime: new Date(Date.now() + 86400000).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 3).toISOString(),
    status: "upcoming",
    duration: 120,
    problems: [
      STATIC_PROBLEMS[3],
      STATIC_PROBLEMS[4],
      STATIC_PROBLEMS[5]
    ],
    participants: ["user_4", "user_5"],
    isOfficial: true
  },
  {
    _id: "679802000000000000000003",
    title: "Beginner Data Structures Sprint",
    description: "A fast-paced contest tailored for beginners to practice Arrays, Strings, and Stacks.",
    startTime: new Date(Date.now() - 86400000 * 10).toISOString(),
    endTime: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: "ended",
    duration: 60,
    problems: [
      STATIC_PROBLEMS[0],
      STATIC_PROBLEMS[1]
    ],
    participants: ["user_1", "user_6", "user_7"],
    isOfficial: true
  }
];

export const STATIC_TOPICS = [
  { topic: "array", count: 8 },
  { topic: "string", count: 6 },
  { topic: "hash table", count: 5 },
  { topic: "dynamic programming", count: 4 },
  { topic: "binary search", count: 4 },
  { topic: "stack", count: 3 },
  { topic: "math", count: 3 },
  { topic: "tree", count: 3 },
  { topic: "graph", count: 2 },
  { topic: "sliding window", count: 2 }
];

export const STATIC_STATS = {
  totalProblems: 6,
  solvedCount: 2,
  acceptanceAvg: 49.35
};
