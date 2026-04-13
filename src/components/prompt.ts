import inquirer from 'inquirer';

export async function selectionPrompt(message: string, choices: string[]): Promise<string> {
  const { selected } = await inquirer.prompt([
    { type: 'list', name: 'selected', message, choices },
  ]);
  return selected as string;
}

export async function freeTextInput(message: string): Promise<string> {
  let value = '';
  while (!value.trim()) {
    const { input } = await inquirer.prompt([
      { type: 'input', name: 'input', message, prefix: '>' },
    ]);
    value = input as string;
  }
  return value.trim();
}
