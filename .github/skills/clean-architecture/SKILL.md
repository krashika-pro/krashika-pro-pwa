---
name: clean-architecture
description: Enforces Clean Architecture layering for Angular applications. Trigger when creating features, services, models, facades, repositories, or when discussing architecture, folder structure, dependency rules, or layer boundaries.
metadata:
  version: "1.0"
---

# Clean Architecture Guidelines for Angular

This skill enforces a four-layer Clean Architecture for the Krishika Pro Angular application. Every feature must follow these layers and dependency rules.

## Layer Overview

```
UI (Components, Pages)
       ↓
Application (Facades / Use Cases)
       ↓
Domain (Models, Business Logic)
       ↓
Infrastructure (API, Storage, IndexedDB)
```

## Dependency Rule

Dependencies flow **inward only**. Outer layers depend on inner layers, never the reverse.

- **UI** → may import from **Application**, **Domain**
- **Application** → may import from **Domain** only
- **Domain** → imports from **nothing** (pure TypeScript, no Angular imports)
- **Infrastructure** → may import from **Domain** (implements domain interfaces)

**Infrastructure is injected into Application via Angular DI** — Application never imports Infrastructure directly.

## Folder Structure

Every feature follows this layout under `src/app/features/<feature-name>/`:

```
src/app/
├── features/
│   └── <feature-name>/
│       ├── ui/                          # UI Layer
│       │   ├── <component>.ts
│       │   ├── <component>.html
│       │   ├── <component>.scss
│       │   └── <component>.spec.ts
│       ├── application/                 # Application Layer
│       │   ├── <feature>.facade.ts
│       │   └── <feature>.facade.spec.ts
│       ├── domain/                      # Domain Layer
│       │   ├── models/
│       │   │   └── <entity>.model.ts
│       │   ├── ports/
│       │   │   └── <entity>.repository.ts   # Abstract interface
│       │   └── rules/
│       │       └── <business-rule>.ts        # Pure functions
│       └── infrastructure/              # Infrastructure Layer
│           ├── api/
│           │   └── <entity>-api.repository.ts
│           ├── storage/
│           │   └── <entity>-storage.repository.ts
│           └── mappers/
│               └── <entity>.mapper.ts
├── shared/
│   ├── domain/
│   │   └── models/                      # Cross-feature domain models
│   ├── infrastructure/
│   │   ├── http/                        # Base HTTP client wrapper
│   │   └── storage/                     # IndexedDB / localStorage helpers
│   └── ui/
│       └── components/                  # Shared UI components
└── core/
    ├── auth/                            # Authentication infrastructure
    └── config/                          # App-wide configuration
```

## Layer Rules & Conventions

### 1. Domain Layer

The domain layer is **pure TypeScript** — no Angular decorators, no `inject()`, no RxJS.

#### Models

Define domain entities and value objects as TypeScript interfaces or classes.

```typescript
// features/auth/domain/models/user.model.ts

export interface User {
  readonly id: string;
  readonly mobileNumber: string;
  readonly fullName: string;
  readonly role: UserRole;
}

export type UserRole = "farmer" | "dealer" | "admin";
```

#### Ports (Repository Interfaces)

Define abstract classes that serve as contracts for infrastructure implementations.

```typescript
// features/auth/domain/ports/auth.repository.ts

import type { User } from "../models/user.model";

export abstract class AuthRepository {
  abstract sendOtp(mobileNumber: string): Promise<void>;
  abstract verifyOtp(mobileNumber: string, otp: string): Promise<User>;
  abstract getStoredUser(): Promise<User | null>;
}
```

**Why abstract classes over interfaces?** Angular's DI uses class tokens — abstract classes work as both a type and an injection token without needing `InjectionToken`.

#### Business Rules

Pure functions with no side effects. Fully testable without Angular TestBed.

```typescript
// features/auth/domain/rules/validate-mobile.ts

export function isValidMobileNumber(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile);
}
```

### 2. Application Layer (Facades / Use Cases)

Facades are Angular `@Injectable` services that orchestrate domain logic and infrastructure calls. They expose **signals** for UI consumption.

```typescript
// features/auth/application/auth.facade.ts

import { inject, Injectable, signal, computed } from "@angular/core";
import { AuthRepository } from "../domain/ports/auth.repository";
import type { User } from "../domain/models/user.model";
import { isValidMobileNumber } from "../domain/rules/validate-mobile";

@Injectable({ providedIn: "root" })
export class AuthFacade {
  private readonly authRepo = inject(AuthRepository);

  readonly user = signal<User | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly isAuthenticated = computed(() => this.user() !== null);

  async sendOtp(mobileNumber: string): Promise<boolean> {
    if (!isValidMobileNumber(mobileNumber)) {
      this.error.set("Invalid mobile number");
      return false;
    }
    this.isLoading.set(true);
    this.error.set(null);
    try {
      await this.authRepo.sendOtp(mobileNumber);
      return true;
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : "Failed to send OTP");
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  async verifyOtp(mobileNumber: string, otp: string): Promise<boolean> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const user = await this.authRepo.verifyOtp(mobileNumber, otp);
      this.user.set(user);
      return true;
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : "Verification failed");
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }
}
```

**Rules for Facades:**

- One facade per feature (or per bounded context if the feature is large)
- Inject domain ports (abstract classes), never infrastructure implementations
- Expose state as **signals** (not BehaviorSubjects)
- Handle errors and set loading state
- No template logic — facades don't know about the UI

### 3. Infrastructure Layer

Implements domain ports (repository interfaces). This is the only layer that knows about HTTP, IndexedDB, localStorage, or any external system.

```typescript
// features/auth/infrastructure/api/auth-api.repository.ts

import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { AuthRepository } from "../../domain/ports/auth.repository";
import type { User } from "../../domain/models/user.model";
import { mapApiUserToUser } from "../mappers/user.mapper";

@Injectable()
export class AuthApiRepository extends AuthRepository {
  private readonly http = inject(HttpClient);

  async sendOtp(mobileNumber: string): Promise<void> {
    await firstValueFrom(this.http.post("/api/auth/send-otp", { mobileNumber }));
  }

  async verifyOtp(mobileNumber: string, otp: string): Promise<User> {
    const response = await firstValueFrom(this.http.post<ApiUserResponse>("/api/auth/verify-otp", { mobileNumber, otp }));
    return mapApiUserToUser(response);
  }

  async getStoredUser(): Promise<User | null> {
    return null; // Delegated to storage repository
  }
}
```

#### Mappers

Transform API/storage DTOs to domain models. Keep in the infrastructure layer.

```typescript
// features/auth/infrastructure/mappers/user.mapper.ts

import type { User } from "../../domain/models/user.model";

export interface ApiUserResponse {
  user_id: string;
  mobile: string;
  name: string;
  role: string;
}

export function mapApiUserToUser(response: ApiUserResponse): User {
  return {
    id: response.user_id,
    mobileNumber: response.mobile,
    fullName: response.name,
    role: response.role as User["role"],
  };
}
```

#### Registering Infrastructure via DI

Bind abstract ports to concrete implementations in the feature's route or module providers.

```typescript
// features/auth/auth.routes.ts

import { Routes } from "@angular/router";
import { AuthRepository } from "./domain/ports/auth.repository";
import { AuthApiRepository } from "./infrastructure/api/auth-api.repository";

export const AUTH_ROUTES: Routes = [
  {
    path: "",
    providers: [{ provide: AuthRepository, useClass: AuthApiRepository }],
    children: [
      {
        path: "login",
        loadComponent: () => import("./ui/login.component").then((m) => m.LoginComponent),
      },
    ],
  },
];
```

### 4. UI Layer (Components)

Components consume facades. They do **not** inject repositories or call HTTP directly.

```typescript
// features/auth/ui/login.component.ts

import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthFacade } from "../application/auth.facade";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent {
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);

  readonly isLoading = this.authFacade.isLoading;
  readonly error = this.authFacade.error;

  mobileNumber = "";

  async onSendOtp(): Promise<void> {
    const success = await this.authFacade.sendOtp(this.mobileNumber);
    if (success) {
      this.router.navigate(["/otp-verification", this.mobileNumber]);
    }
  }
}
```

**Rules for UI Components:**

- Inject **facades**, never repositories or infrastructure services
- Keep templates thin — delegate logic to the facade
- Use signals from the facade directly in templates with signal reads `()`

## Naming Conventions

| Artifact               | Pattern                          | Example                      |
| ---------------------- | -------------------------------- | ---------------------------- |
| Domain model           | `<entity>.model.ts`              | `user.model.ts`              |
| Domain port            | `<entity>.repository.ts`         | `auth.repository.ts`         |
| Business rule          | `<rule-name>.ts`                 | `validate-mobile.ts`         |
| Facade                 | `<feature>.facade.ts`            | `auth.facade.ts`             |
| API implementation     | `<entity>-api.repository.ts`     | `auth-api.repository.ts`     |
| Storage implementation | `<entity>-storage.repository.ts` | `auth-storage.repository.ts` |
| Mapper                 | `<entity>.mapper.ts`             | `user.mapper.ts`             |
| Feature routes         | `<feature>.routes.ts`            | `auth.routes.ts`             |

## Testing Strategy per Layer

| Layer                         | Test Type                    | TestBed Required?                 |
| ----------------------------- | ---------------------------- | --------------------------------- |
| Domain (models, rules)        | Unit tests                   | No — pure functions               |
| Application (facades)         | Unit tests with mocked ports | Yes — minimal, mock repositories  |
| Infrastructure (repositories) | Integration tests            | Yes — use `HttpTestingController` |
| UI (components)               | Component tests              | Yes — mock facades                |

## Checklist for New Features

1. **Domain first**: Define models, ports (abstract repository), and business rules
2. **Application second**: Create the facade that uses ports and domain rules
3. **Infrastructure third**: Implement the port with API/storage adapters and mappers
4. **UI last**: Build components that inject the facade
5. **Wire DI**: Register `{ provide: Port, useClass: Implementation }` in feature routes
6. **Test each layer** in isolation

## Anti-Patterns to Avoid

- **Component calling `HttpClient` directly** — always go through Facade → Port → Infrastructure
- **Facade importing infrastructure classes** — inject the abstract port instead
- **Domain model with Angular decorators** — domain must be pure TypeScript
- **Business logic in components** — move to domain rules or facade methods
- **Skipping mappers** — API responses should never leak into domain models as-is
- **God facade** — split into multiple facades if a feature grows beyond ~10 public methods
