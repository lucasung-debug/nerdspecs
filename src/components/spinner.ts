import ora from 'ora';

type Step = { label: string; action: () => Promise<void> };

export async function progressSteps(steps: Step[]): Promise<void> {
  for (const step of steps) {
    const spinner = ora(step.label).start();
    try {
      await step.action();
      spinner.succeed(step.label);
    } catch (err) {
      spinner.fail(step.label);
      throw err;
    }
  }
}
