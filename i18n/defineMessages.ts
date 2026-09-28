export type Messages = { [key: string]: string | Messages }

export interface LocaleModule {
  en: Messages
  mr: Messages
}

// Same keys as T, every leaf widened to string — so `mr` must mirror `en` exactly.
type Shape<T> = { [K in keyof T]: T[K] extends string ? string : Shape<T[K]> }

/**
 * Declares one namespace's strings in both languages. A key missing from (or
 * extra in) `mr` compared to `en` is a type error.
 *
 *   export default defineMessages({
 *     en: { title: 'My Jobs', greeting: 'Hello, {{name}}' },
 *     mr: { title: 'माझ्या नोकऱ्या', greeting: 'नमस्कार, {{name}}' },
 *   })
 */
export const defineMessages = <T extends Messages>(messages: { en: T; mr: Shape<NoInfer<T>> }) =>
  messages as LocaleModule
