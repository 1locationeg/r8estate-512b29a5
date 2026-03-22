

# Integrate Platform Disclaimer (Arabic + English)

## Overview
Create a reusable `DisclaimerModal` component with the full R8 platform disclaimer text in both Arabic and English. Add a mandatory "I agree" checkbox at key user action points: registration, review submission, deal submission, deal rating, and business claim.

## Disclaimer Content

Based on the uploaded document, this is a 7-section legal disclaimer covering:
1. Platform nature (information only, not real estate broker)
2. Content accuracy (user-generated, not guaranteed)
3. User responsibility (due diligence before decisions)
4. Third-party links (no liability)
5. Modifications (platform can update terms)
6. Intellectual property (content ownership)
7. Governing law (jurisdiction)

## Changes

### 1. Add Disclaimer Text to i18n Files
**`src/i18n/locales/ar.json`** and **`src/i18n/locales/en.json`**

Add a `disclaimer` section with `title`, `lastUpdated`, `intro`, and `sections` array (7 items with `heading` + `content`), plus `agreeCheckbox` and `readMore` labels.

The Arabic text will be transcribed from the uploaded document. The English version will be the equivalent translation.

### 2. Create `DisclaimerModal` Component
**`src/components/DisclaimerModal.tsx`** (new file)

- A dialog that displays the full disclaimer text (scrollable)
- Uses `useTranslation()` to show Arabic or English based on current language
- Has a "Close" button
- Reusable — can be triggered from any page

### 3. Create `DisclaimerCheckbox` Component
**`src/components/DisclaimerCheckbox.tsx`** (new file)

- A compact checkbox + label: "I have read and agree to the [Platform Disclaimer]"
- Clicking "Platform Disclaimer" opens the `DisclaimerModal`
- Exposes `checked` and `onCheckedChange` props
- Used inline in forms

### 4. Integrate into Auth Page (Registration)
**`src/pages/Auth.tsx`**

- Add `<DisclaimerCheckbox>` above the submit button in the password step (step 2), only when `isCreateAccount` is true
- Disable the "Create Account" button until disclaimer is agreed
- Replace the existing passive terms text with the active checkbox

### 5. Integrate into WriteReviewModal
**`src/components/WriteReviewModal.tsx`**

- Add `<DisclaimerCheckbox>` above the submit button
- Disable submit until agreed

### 6. Integrate into DealSubmitForm
**`src/components/DealSubmitForm.tsx`**

- Replace the existing basic terms checkbox with `<DisclaimerCheckbox>`
- Keep the existing `agreed` state wired to it

### 7. Integrate into DealRatingModal
**`src/components/DealRatingModal.tsx`**

- Add `<DisclaimerCheckbox>` above submit button
- Disable submit until agreed

### 8. Integrate into ClaimBusinessModal
**`src/components/ClaimBusinessModal.tsx`**

- Add `<DisclaimerCheckbox>` above submit button
- Disable submit until agreed

## Technical Notes
- The disclaimer checkbox state resets when the modal/form closes
- The full disclaimer is viewable via a link in the checkbox label — opens a scrollable modal
- RTL layout handled automatically by the existing i18n direction system
- No database changes needed — agreement is implied by form submission

