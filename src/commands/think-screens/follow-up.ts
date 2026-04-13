import { freeTextInput } from '../../components/index.js';

export async function runFollowUp(_reasoning: string): Promise<string> {
  console.log('That still sounds broad.');
  return freeTextInput("Can you give me a specific example of when you'd use this?");
}
