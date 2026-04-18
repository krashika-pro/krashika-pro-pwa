# UI Requirements — User Authentication & Registration (Phase 1)

> Derived from: _User Authentication & Registration Feature Document (Phase 1)_
> Platform: Android · Jetpack Compose + Material3

---

## 1. Screens

| #   | Screen Name               | Route                | Description                                              |
| --- | ------------------------- | -------------------- | -------------------------------------------------------- |
| 1   | `LoginScreen`             | `login`              | Entry point — user enters mobile number and requests OTP |
| 2   | `OtpVerificationScreen`   | `otp_verification`   | OTP input to verify the mobile number                    |
| 3   | `RegistrationScreen`      | `registration`       | Collects mandatory profile fields for new users          |
| 4   | `ProfileCompletionScreen` | `profile_completion` | Optional fields after successful registration            |

---

## 2. Screen-by-Screen UI Specification

---

### 2.1 LoginScreen

**Purpose:** Collect the user's mobile number and send an OTP for verification.

#### Layout

- App logo / branding at top
- Tagline / welcome text
- Mobile Number input field (`+91` prefix, numeric keyboard, 10-digit)
- **"Send OTP"** primary button (disabled until a valid 10-digit number is entered)
- Footer: terms & privacy policy links

#### States

| State   | UI Behaviour                                                    |
| ------- | --------------------------------------------------------------- |
| Idle    | Empty mobile field, Send OTP button disabled                    |
| Typing  | Send OTP button enabled once a valid 10-digit number is entered |
| Loading | Overlay progress indicator; field and button disabled           |
| Error   | Snackbar with error message                                     |

#### UiState

```kotlin
data class LoginUiState(
    val mobileNumber: String = "",
    val mobileNumberError: String? = null,
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)
```

#### UiEvent

```kotlin
sealed class LoginUiEvent {
    data class MobileNumberChanged(val value: String) : LoginUiEvent()
    object SendOtp : LoginUiEvent()
}
```

#### UiEffect

```kotlin
sealed class LoginUiEffect {
    data class NavigateToOtpVerification(val mobileNumber: String) : LoginUiEffect()
    data class ShowSnackbar(val message: String) : LoginUiEffect()
}
```

---

### 2.2 OtpVerificationScreen

**Purpose:** Verify the user's mobile number via OTP.

**Trigger:** User successfully submits a valid mobile number on `LoginScreen`.

#### Layout

- Back navigation icon
- Screen title: "Verify Mobile Number"
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
| Success         | Navigate to next screen                          |

#### UiState

```kotlin
data class OtpVerificationUiState(
    val otpValue: String = "",
    val isLoading: Boolean = false,
    val isResendEnabled: Boolean = false,
    val resendCountdownSeconds: Int = 30,
    val errorMessage: String? = null
)
```

#### UiEvent

```kotlin
sealed class OtpVerificationUiEvent {
    data class OtpChanged(val otp: String) : OtpVerificationUiEvent()
    object VerifyOtp : OtpVerificationUiEvent()
    object ResendOtp : OtpVerificationUiEvent()
}
```

#### UiEffect

```kotlin
sealed class OtpVerificationUiEffect {
    object NavigateToRegistration : OtpVerificationUiEffect()
    object NavigateToDashboard : OtpVerificationUiEffect()
    data class ShowSnackbar(val message: String) : OtpVerificationUiEffect()
}
```

---

### 2.3 RegistrationScreen

**Purpose:** Collect mandatory profile fields for a first-time user.

**Trigger:** New user detected after OTP verification (no existing user record).

#### Layout

- Back navigation icon
- Screen title: "Create Your Profile"
- Progress indicator (step X of Y — optional)
- Form fields (in order):
  1. **Full Name** — text field, name keyboard
  2. **Role** — dropdown / bottom-sheet selector with predefined options
  3. **Location** — text field with search/autocomplete OR district + state dropdowns
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

#### UiState

```kotlin
data class RegistrationUiState(
    val fullName: String = "",
    val role: String = "",
    val location: String = "",
    val fullNameError: String? = null,
    val roleError: String? = null,
    val locationError: String? = null,
    val isLoading: Boolean = false,
    val isFormValid: Boolean = false
)
```

#### UiEvent

```kotlin
sealed class RegistrationUiEvent {
    data class FullNameChanged(val value: String) : RegistrationUiEvent()
    data class RoleSelected(val role: String) : RegistrationUiEvent()
    data class LocationChanged(val value: String) : RegistrationUiEvent()
    object Submit : RegistrationUiEvent()
}
```

#### UiEffect

```kotlin
sealed class RegistrationUiEffect {
    object NavigateToDashboard : RegistrationUiEffect()
    object NavigateToProfileCompletion : RegistrationUiEffect()
    data class ShowSnackbar(val message: String) : RegistrationUiEffect()
}
```

---

### 2.4 ProfileCompletionScreen

**Purpose:** Optionally collect additional profile information post-registration.

**Trigger:** Prompted after account creation; can also be accessed from profile settings.

#### Layout

- Back / Skip navigation options (top bar)
- Screen title: "Complete Your Profile"
- Subtitle: "This helps us personalise your experience"
- Form fields:
  1. **Farm Size / Type** — radio group or dropdown (Small-scale, Mid-scale, Large-scale, Other)
  2. **Crops / Livestock** — multi-select chip group or bottom-sheet multi-select
  3. **Number of Workers** — numeric text field
  4. **Profile Photo** — circular avatar with "Upload Photo" tap area (camera / gallery chooser)
- **"Save"** primary CTA button
- **"Skip for now"** text button

#### States

| State   | UI Behaviour                                |
| ------- | ------------------------------------------- |
| Idle    | Empty / pre-filled fields                   |
| Loading | Progress indicator on Save; inputs disabled |
| Error   | Snackbar for upload or save errors          |
| Success | Navigate to Dashboard                       |

#### UiState

```kotlin
data class ProfileCompletionUiState(
    val farmSizeType: String = "",
    val crops: List<String> = emptyList(),
    val numberOfWorkers: String = "",
    val profilePhotoUri: String? = null,
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)
```

#### UiEvent

```kotlin
sealed class ProfileCompletionUiEvent {
    data class FarmSizeSelected(val value: String) : ProfileCompletionUiEvent()
    data class CropsSelected(val crops: List<String>) : ProfileCompletionUiEvent()
    data class WorkersChanged(val value: String) : ProfileCompletionUiEvent()
    data class PhotoSelected(val uri: String) : ProfileCompletionUiEvent()
    object Save : ProfileCompletionUiEvent()
    object Skip : ProfileCompletionUiEvent()
}
```

#### UiEffect

```kotlin
sealed class ProfileCompletionUiEffect {
    object NavigateToDashboard : ProfileCompletionUiEffect()
    object OpenImagePicker : ProfileCompletionUiEffect()
    data class ShowSnackbar(val message: String) : ProfileCompletionUiEffect()
}
```

---

## 3. Navigation Flow

```
App Launch
    │
    ▼
LoginScreen  (enter mobile number → Send OTP)
    │
    ▼
OtpVerificationScreen  (enter OTP → Verify)
    │
    ▼
[User exists?]
    ├── Yes ──► Dashboard
    └── No ───► RegistrationScreen
                        │
                [Account Created]
                        │
                        ▼
               ProfileCompletionScreen
                 ├── [Save / Skip]
                        │
                        ▼
                   Dashboard
```

### Navigation Routes (`Screen.kt`)

```kotlin
sealed class Screen(val route: String) {
    object Login : Screen("login")
    object OtpVerification : Screen("otp_verification/{mobileNumber}") {
        fun createRoute(mobileNumber: String) = "otp_verification/$mobileNumber"
    }
    object Registration : Screen("registration")
    object ProfileCompletion : Screen("profile_completion")
    object Dashboard : Screen("dashboard")
}
```

---

## 4. Shared / Reusable Components

| Component                 | Used In                 | Notes                               |
| ------------------------- | ----------------------- | ----------------------------------- |
| `PrimaryButton`           | All screens             | Full-width, disabled state support  |
| `SecondaryTextButton`     | OTP, Profile Completion | Less prominent action               |
| `KrishikaTextField`       | Login, Registration     | Outline style, inline error support |
| `MobileNumberField`       | LoginScreen             | Outline style with `+91` prefix     |
| `OtpInputField`           | OtpVerificationScreen   | 6-digit segmented input             |
| `RoleSelectorBottomSheet` | RegistrationScreen      | Bottom sheet with radio options     |
| `MultiSelectChipGroup`    | ProfileCompletionScreen | Crop / Livestock selection          |
| `ProfilePhotoUploader`    | ProfileCompletionScreen | Circular, tap-to-upload             |
| `LoadingOverlay`          | All screens             | Full-screen dimmed spinner          |

---

## 5. Error Handling Summary

| Error Scenario                | UI Response                                         |
| ----------------------------- | --------------------------------------------------- |
| Invalid OTP                   | Inline error under OTP field                        |
| Invalid / unregistered mobile | Snackbar on LoginScreen                             |
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
- Profile photo upload to backend storage (URI passed via UiEvent; upload handled in ViewModel/UseCase)
- All authentication tokens stored securely (DataStore / EncryptedSharedPreferences — no plain SharedPreferences)
- Mobile number is passed as a navigation argument from `LoginScreen` to `OtpVerificationScreen` so the instruction text can display the number
