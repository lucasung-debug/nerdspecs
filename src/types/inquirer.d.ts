declare module 'inquirer' {
  interface PromptOptions {
    type: string;
    name: string;
    message: string;
    choices?: string[];
    prefix?: string;
  }

  interface Inquirer {
    prompt(questions: PromptOptions[]): Promise<Record<string, unknown>>;
  }

  const inquirer: Inquirer;
  export default inquirer;
}
