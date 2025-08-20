function sum_to_n_a(n: number): number {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}
// O(n) Time Complexity
// O(1) Space Complexity

function sum_to_n_b(n: number): number {
  if (n <= 1) return n;
  return n + sum_to_n_b(n - 1);
}
// O(n): Time Complexity 
// O(n): Space Complexity

function sum_to_n_c(n: number): number {
  return (n * (n + 1)) / 2;
}
// O(1) time complexity.
// O(1) space complexity
