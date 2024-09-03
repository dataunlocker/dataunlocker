export const getEnv = (name: string): string | undefined =>
  process.env[name] || process.env[`npm_config_${name.toLowerCase()}`];
