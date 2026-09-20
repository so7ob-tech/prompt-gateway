import type { CurrentChat, Provider } from '../types';

export interface ComposerTarget { element: HTMLElement; kind: 'textarea' | 'input' | 'contenteditable'; }
export interface ProviderAdapter { provider: Provider; detect(url: string): boolean; getCurrentChat(): CurrentChat; findComposer(): ComposerTarget | null; insertText(text: string): boolean; sendMessage(): boolean; }

function target(): ComposerTarget | null {
  const selectors = ['textarea[placeholder*="Message"]', 'textarea[placeholder*="message"]', 'textarea', '[contenteditable="true"]'];
  for (const selector of selectors) { const element = document.querySelector<HTMLElement>(selector); if (element && isVisible(element)) return { element, kind: element.matches('textarea') ? 'textarea' : 'contenteditable' }; }
  return null;
}
function isVisible(el: HTMLElement) { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
function providerFor(url: string): Provider { if (/chatgpt|openai/.test(url)) return 'chatgpt'; if (/claude\.ai/.test(url)) return 'claude'; return 'generic'; }
function current(): CurrentChat { const url = location.href; const provider = providerFor(url); return { provider, url, title: document.title || 'Untitled chat', identityKey: `${provider}:${url.split('#')[0]}` }; }
function dispatch(el: HTMLElement) { for (const type of ['input', 'change']) el.dispatchEvent(new Event(type, { bubbles: true })); }
function insert(text: string): boolean { const t = target(); if (!t) return false; t.element.focus(); if (t.kind === 'contenteditable') { t.element.textContent = text; } else { const input = t.element as HTMLTextAreaElement | HTMLInputElement; const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value')?.set; setter?.call(input, text); if (!setter) input.value = text; } dispatch(t.element); return true; }
function send(): boolean { const t = target(); if (!t) return false; const button = [...document.querySelectorAll<HTMLButtonElement>('button')].find((b) => /send|submit|إرسال/i.test(`${b.getAttribute('aria-label')} ${b.textContent}`) && !b.disabled); if (button) { button.click(); return true; } t.element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true })); return true; }

export const adapters: ProviderAdapter[] = [
  { provider: 'chatgpt', detect: (url) => /chatgpt\.com|chat\.openai\.com/.test(url), getCurrentChat: current, findComposer: target, insertText: insert, sendMessage: send },
  { provider: 'claude', detect: (url) => /claude\.ai/.test(url), getCurrentChat: current, findComposer: target, insertText: insert, sendMessage: send },
  { provider: 'generic', detect: () => true, getCurrentChat: current, findComposer: target, insertText: insert, sendMessage: send }
];
export function getAdapter(url = location.href) { return adapters.find((a) => a.detect(url)) ?? adapters[adapters.length - 1]; }
