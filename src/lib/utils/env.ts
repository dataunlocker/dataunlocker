export const getEnv = (name: string) =>
  process.env[name] || process.env[`npm_config_${name.toLowerCase()}`] || '';
