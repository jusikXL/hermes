import "dotenv/config";

export default function getFromEnvironment(variableName: string) {
  const variable = process.env[variableName];

  if (!variable) {
    throw new Error(`Please set '${variableName}' in environment.`);
  }

  return variable;
}
