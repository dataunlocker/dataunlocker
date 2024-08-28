export function parseArgs(argv: string[]) {
  const result: Record<string, true | string> = {};
  let currentKey: null | string = null;

  argv.forEach((arg, index) => {
    if (arg.startsWith('--')) {
      currentKey = arg.slice(2);
      result[currentKey] = true; // Default to true for flags
    } else if (arg.startsWith('-')) {
      currentKey = arg.slice(1);
      result[currentKey] = true; // Default to true for flags
    } else if (currentKey) {
      result[currentKey] = arg;
      currentKey = null;
    } else {
      result[index] = arg;
    }
  });

  return result;
}
