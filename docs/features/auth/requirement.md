# UI Requirements — User Authentication & Registration (Phase 1)

> Derived from: _User Authentication & Registration Feature Document (Phase 1)_
> Platform: Web (PWA) · Angular + Angular Material

---

## 1. Pages (Components)

| #   | Component Name               | Route                       | Description                                              |
| --- | ---------------------------- | --------------------------- | -------------------------------------------------------- |
| 1   | `LoginComponent`             | `/login`                    | Entry point — user enters mobile number and requests OTP |
| 2   | `OtpVerificationComponent`   | `/otp-verification/:mobile` | OTP input to verify the mobile number                    |
| 3   | `RegistrationComponent`      | `/registration`             | Collects mandatory profile fields for new users          |
| 4   | `ProfileCompletionComponent` | `/profile-completion`       | Optional fields after successful registration            |

---

## 2. Component-by-Component UI Specification

---

### 2.1 LoginComponent

**Purpose:** Collect the user's mobile number and send an OTP for verification.

#### Layout

- App logo / branding at top
- Tagline / welcome text
- Mobile Number input field (`+91` prefix, `inputmode="numeric"`, 10-digit)
- **"Send OTP"** primary button (disabled until a valid 10-digit number is entered)
- Footer: terms & privacy policy links

#### States

| State   | UI Behaviour                                                    |
| ------- | --------------------------------------------------------------- |
| Idle    | Empty mobile field, Send OTP button disabled                    |
| Typing  | Send OTP button enabled once a valid 10-digit number is entered |
| Loading | Overlay progress indicator; field and button disabled           |
| Error   | Snackbar with error message                                     |

#### Component State (Signals)

```typescript
interface LoginState {
  mobileNumber: string;
  mobileNumberError: string | null;
  isLoading: boolean;
  errorMessage: string | null;
}
```

#### Actions

```typescript
type LoginAction = { type: "MOBILE_NUMBER_CHANGED"; value: string } | { type: "SEND_OTP" };
```

#### Effects

```typescript
type LoginEffect = { type: "NAVIGATE_TO_OTP_VERIFICATION"; mobileNumber: string } | { type: "SHOW_SNACKBAR"; message: string };
```

---

### 2.2 OtpVerificationComponent

**Purpose:** Verify the user's mobile number via OTP.

**Trigger:** User successfully submits a valid mobile number on `LoginComponent`.

#### Layout

- Back navigation icon (or browser back)
- Page title: "Verify Mobile Number"
- Instruction text: "Enter the OTP sent to +91 XXXXXXXXXX"
- OTP input field (6-digit, segmented or single field)
- **"Verify"** primary button
- **"Resend OTP"** text button (disabled until countdown expires)
- Countdown timer (e.g. "Resend in 30s")

#### States

| State           | UI Behaviour                                     |
| --------------- | ------------------------------------------------ |
| Idle            | Empty OTP field, Verify button disabled          |
| Typing          | Verify button enabled once all digits entered    |
| Loading         | Progress indicator; inputs and buttons disabled  |
| ResendAvailable | "Resend OTP" becomes enabled after timer expires |
| Error           | Inline error under OTP field ("Invalid OTP")     |
| Success         | Navigate to next page                            |

#### Component State (Signals)

```typescript
interface OtpVerificationState {
  otpValue: string;
  isLoading: boolean;
  isResendEnabled: boolean;
  resendCountdownSeconds: number;
  errorMessage: string | null;
}
```

#### Actions

```typescript
type OtpVerificationAction = { type: "OTP_CHANGED"; otp: string } | { type: "VERIFY_OTP" } | { type: "RESEND_OTP" };
```

#### Effects

```typescript
type OtpVerificationEffect = { type: "NAVIGATE_TO_REGISTRATION" } | { type: "NAVIGATE_TO_DASHBOARD" } | { type: "SHOW_SNACKBAR"; message: string };
```

---

### 2.3 RegistrationComponent

**Purpose:** Collect mandatory profile fields for a first-time user.

**Trigger:** New user detected after OTP verification (no existing user record).

#### Layout

- Back navigation icon (or browser back)
- Page title: "Create Your Profile"
- Progress indicator (step X of Y — optional)
- Form fields (in order):
  1. **Full Name** — text input
  2. **Role** — dropdown (`<select>`) or dialog selector with predefined options
  3. **Location** — text input with autocomplete OR district + state dropdowns
- **"Create Account"** primary CTA button (disabled until all fields valid)

#### Role Options (predefined)

- Farmer
- Agronomist / Advisor
- Input Dealer
- Other

#### Validation (inline, shown on field blur)

| Field     | Rule                                        |
| --------- | ------------------------------------------- |
| Full Name | Required · non-empty                        |
| Role      | Required · must be one of predefined values |
| Location  | Required · non-empty                        |

#### States

| State      | UI Behaviour                                             |
| ---------- | -------------------------------------------------------- |
| Idle       | Empty form                                               |
| Typing     | Real-time field validation, CTA disabled until all valid |
| Loading    | Progress indicator; form and CTA disabled                |
| FieldError | Inline error text beneath the invalid field              |
| Error      | Snackbar for server-side errors                          |
| Success    | Navigate to Dashboard                                    |

#### Component State (Signals)

```typescript
interface RegistrationState {
  fullName: string;
  role: string;
  location: string;
  fullNameError: string | null;
  roleError: string | null;
  locationError: string | null;
  isLoading: boolean;
  isFormValid: boolean;
}
```

#### Actions

```typescript
type RegistrationAction = { type: "FULL_NAME_CHANGED"; value: string } | { type: "ROLE_SELECTED"; role: string } | { type: "LOCATION_CHANGED"; value: string } | { type: "SUBMIT" };
```

#### Effects

```typescript
type RegistrationEffect = { type: "NAVIGATE_TO_DASHBOARD" } | { type: "NAVIGATE_TO_PROFILE_COMPLETION" } | { type: "SHOW_SNACKBAR"; message: string };
```

---

### 2.4 ProfileCompletionComponent

**Purpose:** Optionally collect additional profile information post-registration.

**Trigger:** Prompted after account creation; can also be accessed from profile settings.

#### Layout

- Back / Skip navigation options (top bar)
- Page title: "Complete Your Profile"
- Subtitle: "This helps us personalise your experience"
- Form fields:
  1. **Farm Size / Type** — radio group or dropdown (Small-scale, Mid-scale, Large-scale, Other)
  2. **Crops / Livestock** — multi-select chip group or dialog multi-select
  3. **Number of Workers** — numeric text input (`inputmode="numeric"`)
  4. **Profile Photo** — circular avatar with "Upload Photo" click area (file input)
- **"Save"** primary CTA button
- **"Skip for now"** text button

#### States

| State   | UI Behaviour                                |
| ------- | ------------------------------------------- |
| Idle    | Empty / pre-filled fields                   |
| Loading | Progress indicator on Save; inputs disabled |
| Error   | Snackbar for upload or save errors          |
| Success | Navigate to Dashboard                       |

#### Component State (Signals)

```typescript
interface ProfileCompletionState {
  farmSizeType: string;
  crops: string[];
  numberOfWorkers: string;
  profilePhotoUrl: string | null;
  isLoading: boolean;
  errorMessage: string | null;
}
```

#### Actions

```typescript
type ProfileCompletionAction = { type: "FARM_SIZE_SELECTED"; value: string } | { type: "CROPS_SELECTED"; crops: string[] } | { type: "WORKERS_CHANGED"; value: string } | { type: "PHOTO_SELECTED"; file: File } | { type: "SAVE" } | { type: "SKIP" };
```

#### Effects

```typescript
type ProfileCompletionEffect = { type: "NAVIGATE_TO_DASHBOARD" } | { type: "OPEN_FILE_PICKER" } | { type: "SHOW_SNACKBAR"; message: string };
```

---

## 3. Navigation Flow

```
App Launch
    │
    ▼
LoginComponent  (enter mobile number → Send OTP)
    │
    ▼
OtpVerificationComponent  (enter OTP → Verify)
    │
    ▼
[User exists?]
    ├── Yes ──► Dashboard
    └── No ───► RegistrationComponent
                        │
                [Account Created]
                        │
                        ▼
               ProfileCompletionComponent
                 ├── [Save / Skip]
                        │
                        ▼
                   Dashboard
```

### Route Configuration (`app.routes.ts`)

```typescript
import { Routes } from "@angular/router";

export const routes: Routes = [
  { path: "", redirectTo: "login", pathMatch: "full" },
  {
    path: "login",
    loadComponent: () => import("./auth/login/login.component").then((m) => m.LoginComponent),
  },
  {
    path: "otp-verification/:mobile",
    loadComponent: () => import("./auth/otp-verification/otp-verification.component").then((m) => m.OtpVerificationComponent),
  },
  {
    path: "registration",
    loadComponent: () => import("./auth/registration/registration.component").then((m) => m.RegistrationComponent),
  },
  {
    path: "profile-completion",
    loadComponent: () => import("./auth/profile-completion/profile-completion.component").then((m) => m.ProfileCompletionComponent),
  },
  {
    path: "dashboard",
    loadComponent: () => import("./dashboard/dashboard.component").then((m) => m.DashboardComponent),
  },
];
```

---

## 4. Shared / Reusable Components

| Component                    | Used In                    | Notes                                |
| ---------------------------- | -------------------------- | ------------------------------------ |
| `PrimaryButtonComponent`     | All pages                  | Full-width, disabled state support   |
| `SecondaryButtonComponent`   | OTP, Profile Completion    | Less prominent action                |
| `KrishikaInputComponent`     | Login, Registration        | Outline style, inline error support  |
| `MobileNumberInputComponent` | LoginComponent             | Outline style with `+91` prefix      |
| `OtpInputComponent`          | OtpVerificationComponent   | 6-digit segmented input              |
| `RoleSelectorComponent`      | RegistrationComponent      | Dialog / dropdown with radio options |
| `MultiSelectChipComponent`   | ProfileCompletionComponent | Crop / Livestock selection           |
| `PhotoUploaderComponent`     | ProfileCompletionComponent | Circular, click-to-upload            |
| `LoadingOverlayComponent`    | All pages                  | Full-screen dimmed spinner           |

---

## 5. Error Handling Summary

| Error Scenario                | UI Response                                         |
| ----------------------------- | --------------------------------------------------- |
| Invalid OTP                   | Inline error under OTP field                        |
| Invalid / unregistered mobile | Snackbar on LoginComponent                          |
| Mobile already registered     | Navigate to OTP verification (existing user flow)   |
| Network failure               | Snackbar: "No internet connection. Please retry."   |
| Server error (5xx)            | Snackbar: "Something went wrong. Please try again." |
| Empty required field          | Inline validation error on field blur               |
| Invalid image format/size     | Snackbar: "Please upload a JPG or PNG under 5 MB."  |

---

## 6. Non-UI Technical Notes (for reference)

- OTP login uses **mobile number + OTP** — no Google / social sign-in
- OTP delivery depends on **OTP service provider** integration
- After OTP verification the backend responds with whether the user is new (→ Registration) or existing (→ Dashboard)
- Profile photo upload to backend storage (File passed via action; upload handled in the service layer)
- All authentication tokens stored securely (HttpOnly cookies or encrypted storage — no plain `localStorage` for tokens)
- Mobile number is passed as a route parameter from `LoginComponent` to `OtpVerificationComponent` so the instruction text can display the number
- Auth guards protect dashboard and profile-completion routes from unauthenticated access
- Lazy-loaded standalone components for each route to optimise bundle size
