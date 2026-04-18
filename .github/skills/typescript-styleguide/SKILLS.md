---
name: typescript-styleguide
description: Google TypeScript Style Guide rules for code generation. Trigger when writing or reviewing TypeScript code for naming, types, classes, functions, imports/exports, control structures, comments, and general best practices.
metadata:
  source: https://google.github.io/styleguide/tsguide.html
  version: "1.0"
---

# Google TypeScript Style Guide

Reference: https://google.github.io/styleguide/tsguide.html

## Source File Structure

Files consist of the following, **in order**:

1. Copyright information, if present
2. `@fileoverview` JSDoc, if present
3. Imports, if present
4. The file's implementation

Exactly one blank line separates each section that is present. File encoding must be UTF-8.

## Imports

- Use relative imports (`./foo`) rather than absolute imports for files in the same project.
- Limit parent steps (`../../../`).
- Prefer **named imports** for frequently used symbols; use **namespace imports** for large APIs.
- Rename imports only to avoid collisions, for generated names, or for clarity.
- Use `import type {...}` when the imported symbol is used only as a type.

## Exports

- **Always use named exports.** Do not use default exports.
- Do not use `export let` (mutable exports). Use explicit getter functions if needed.
- Do not create container classes with static methods; export individual constants and functions instead.
- Minimize the exported API surface.
- Use `export type` when re-exporting a type.
- Use ES6 modules, not `namespace` or `require`.

## Local Variable Declarations

- Always use `const` or `let`. Never use `var`.
- Use `const` by default; `let` only when reassignment is needed.
- One variable per declaration.

## Array Literals

- Do not use the `Array()` constructor. Use bracket notation `[]` or `Array.from`.
- Do not define non-numeric properties on arrays.
- Only spread iterables when creating arrays; do not spread `null`/`undefined`/primitives.

## Object Literals

- Do not use the `Object` constructor. Use `{}`.
- Do not use unfiltered `for (... in ...)`. Use `Object.keys`, `Object.values`, or `Object.entries`.
- Only spread objects into objects; do not spread arrays or primitives.

## Classes

- Class declarations are not terminated with semicolons.
- Separate method declarations with a single blank line.
- Separate the constructor from surrounding code with a single blank line.
- Constructors must use parentheses even with no arguments: `new Foo()`.
- Use **parameter properties** instead of manual assignment.
- Initialize fields where declared.
- Do not use `#private` fields; use TypeScript's `private` keyword.
- Mark never-reassigned properties `readonly`.
- Properties used outside lexical scope (e.g., from Angular templates) must not be `private`; use `protected` or `public`.
- TypeScript symbols are public by default. Never use `public` modifier except for non-readonly public parameter properties.
- Getters must be pure functions; use named backing fields (e.g., `wrappedBar`).
- Do not manipulate prototypes directly.
- Avoid private static methods; prefer module-local functions.
- Do not use `this` in static methods.

## Functions

- Prefer **function declarations** for named functions over arrow functions or function expressions.
- Do not use function expressions (`function() {}`); use arrow functions instead.
- Use arrow functions for nested functions and callbacks.
- Use concise arrow bodies only when the return value is used; use block bodies otherwise.
- Do not rebind `this` with `function` declarations; use arrow functions.
- Prefer passing arrow functions as callbacks over named functions to avoid unintended argument forwarding.
- Prefer rest parameters over `arguments`.
- Arrow function properties on classes are generally discouraged; use arrow functions at call sites.
- Event handlers: arrow functions or arrow-function properties are fine; do not use `bind`.

## `this`

- Only use `this` in class constructors/methods, functions with explicit `this` type, or arrow functions in valid scope.
- Never use `this` for global object, `eval` context, or event targets.

## Primitive Literals

- **Strings**: Use single quotes `'`. Use template literals for complex concatenation.
- Do not use line continuations in strings.
- **Numbers**: Use `0x`, `0o`, `0b` prefixes (lowercase). No leading zeros otherwise.
- **Type coercion**: Use `String()`, `Boolean()`, `Number()`. Never use unary `+` to coerce strings. Do not use `parseInt`/`parseFloat` except for non-base-10.

## Control Structures

- Always use braces for `if`, `for`, `while`, `do` blocks (exception: one-line `if`).
- Prefer `for (... of ...)` to iterate arrays.
- Use `===` and `!==`. Exception: `== null` to check both `null` and `undefined`.
- All `switch` statements must have a `default` case (last). No fall-through in non-empty cases.
- Keep try blocks focused. Prefer `new Error()` over `Error()`. Only throw `Error` subclasses.
- Catch blocks should assume errors are `Error` instances. Empty catch blocks must have explanatory comments.
- Avoid assignment in control statement conditions.

## Type Assertions

- Use `as` syntax, not angle-bracket syntax.
- Prefer runtime checks over type assertions; document assertions with comments.
- Use type annotations (`: Foo`) on object literals, not assertions (`as Foo`).
- Double assertions go through `unknown`, not `any`.

## Decorators

- Do not define new decorators; use only framework-provided ones (Angular, Polymer).
- Decorator immediately precedes the decorated symbol with no empty lines.

## Disallowed Features

- No wrapper object constructors (`new String`, `new Boolean`, `new Number`).
- Do not rely on Automatic Semicolon Insertion; always use explicit semicolons.
- No `const enum`; use plain `enum`.
- No `debugger` statements in production.
- No `with`.
- No `eval` or `Function(...string)`.
- No non-standard ECMAScript features.
- Do not modify builtin prototypes.

## Naming

| Style            | Usage                                                             |
| ---------------- | ----------------------------------------------------------------- |
| `UpperCamelCase` | class, interface, type, enum, decorator, type parameters          |
| `lowerCamelCase` | variable, parameter, function, method, property, module alias     |
| `CONSTANT_CASE`  | global constant values, enum values, `static readonly` properties |

- Names must be descriptive. No ambiguous abbreviations.
- Treat acronyms as whole words: `loadHttpUrl`, not `loadHTTPURL`.
- No trailing/leading underscores. No `I` prefix on interfaces. No `opt_` prefix.
- Do not use `_` as an identifier; use destructuring commas to skip elements.
- `$` suffix for Observables is acceptable per team convention.

## Type System

- Rely on type inference for trivially inferred types; annotate complex expressions.
- Return type annotations are optional but may be requested for clarity.
- Do not include `|null` or `|undefined` in type aliases; add at usage site.
- Prefer optional (`?`) over `|undefined` for parameters and fields.
- Use structural types; use interfaces to define them, not classes.
- Prefer **interfaces** over type literal aliases for objects.
- Use `T[]` for simple array types; `Array<T>` for complex ones.
- Prefer `Map`/`Set` over index signatures.
- Prefer `unknown` over `any`. Document `any` usage with lint suppression comments.
- Do not use `{}` type; prefer `unknown`, `Record<string, T>`, or `object`.
- Use tuple types for pair-like returns; prefer named properties when clearer.
- Never use wrapper types (`String`, `Boolean`, `Number`, `Object`).
- Avoid return-type-only generics.
- Mapped and conditional types: use sparingly; prefer simpler constructs.

## Toolchain

- All files must pass type checking.
- Do not use `@ts-ignore`, `@ts-expect-error` (except in unit tests), or `@ts-nocheck`.

## Comments and Documentation

- Use `/** JSDoc */` for user-facing documentation; `//` for implementation comments.
- Multi-line comments use multiple `//` lines, not `/* */` blocks.
- Document all top-level exports. Class JSDoc should explain how/when to use it.
- Method descriptions begin with a third-person verb phrase.
- `@param` and `@return` only when they add information beyond the name/type.
- Do not include types in JSDoc (`@param`, `@return`, `@implements`, etc.) — TypeScript types suffice.
- Place JSDoc **before** decorators, not between decorator and declaration.
- Use "parameter name" comments at call sites when meaning isn't obvious: `/* shouldRender= */ true`.

## Policies

- Be consistent with existing code in the same file.
- Mark deprecated APIs with `@deprecated` JSDoc and clear migration instructions.
- Brand new files must follow this guide; existing files may be reformatted incrementally.
