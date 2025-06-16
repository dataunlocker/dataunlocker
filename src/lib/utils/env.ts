export const getEnv = (name: string): string | undefined =>
  process.env[name] ||
  process.env[`npm_config_${name.toLowerCase()}`] ||
  process.env[`npm_package_config_${name.toLowerCase()}`];
