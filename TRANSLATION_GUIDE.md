# React i18next Translation Implementation Guide

## Overview

Translation system has been successfully set up using **react-i18next** with support for:

- **English (en)**
- **Albanian (sq - Shqip)**

## ✅ What's Been Set Up

### 1. **Core Configuration**

- **Location**: `src/i18n/i18n.ts`
- Initializes i18next with two language resources
- Stores user language preference in localStorage
- Supports language detection and persistence

### 2. **Translation Files**

- **English**: `src/i18n/locales/en.json`
- **Albanian**: `src/i18n/locales/sq.json`

Current translations include:

- Home page trust indicators (properties, guests, rating, security)
- Accommodation section headings and descriptions
- Common UI elements

### 3. **Language Switcher Component**

- **Location**: `src/components/LanguageSwitcher.tsx`
- Dropdown menu to switch between languages
- Shows current language selection
- Persists user preference

### 4. **Integration Points**

✅ `src/main.tsx` - i18n initialized on app startup
✅ `src/App.tsx` - Wrapped with I18nextProvider
✅ `src/pages/home/Index.tsx` - Using translations with `useTranslation()` hook

## 🚀 How to Use Translations

### Step 1: Add Translation Keys to JSON Files

**English (src/i18n/locales/en.json)**:

```json
{
  "pages": {
    "hotel": {
      "title": "Find Hotels",
      "description": "Discover luxury hotels..."
    }
  }
}
```

**Albanian (src/i18n/locales/sq.json)**:

```json
{
  "pages": {
    "hotel": {
      "title": "Gjeni Hotele",
      "description": "Zbuloni hotele luksoze..."
    }
  }
}
```

### Step 2: Use Translations in Components

```tsx
import { useTranslation } from "react-i18next";

function HotelPage() {
  const { t } = useTranslation(); // Get translation function

  return (
    <div>
      <h1>{t("pages.hotel.title")}</h1>
      <p>{t("pages.hotel.description")}</p>
    </div>
  );
}
```

### Step 3: Add Language Switcher to Header/Navigation

```tsx
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function PrimarySearchAppBar() {
  return (
    <header>
      {/* Your navigation items */}
      <LanguageSwitcher />
    </header>
  );
}
```

## 📋 Examples

### Simple Text Translation

```tsx
const { t } = useTranslation();
<h1>{t("home.accommodations.title")}</h1>;
```

### With Interpolation (Variables)

```json
{
  "greeting": "Welcome, {{name}}!"
}
```

```tsx
const { t } = useTranslation();
<p>{t("greeting", { name: "John" })}</p>;
```

### With Pluralization

```json
{
  "items_one": "{{count}} item",
  "items_other": "{{count}} items"
}
```

```tsx
<p>{t("items", { count: 5 })}</p>
```

## 📝 Next Steps

### Recommended: Extend Translations

1. **Home Components**

   - `src/components/home/Hero.tsx`
   - `src/components/home/Destinations.tsx`
   - `src/components/home/Culture.tsx`
   - `src/components/home/HotelsPreview.tsx`
   - `src/components/home/ApartmentsPreview.tsx`
   - `src/components/home/CarsPreview.tsx`

2. **Dashboard Pages**

   - User management
   - Hotel/Apartment listings
   - Booking management

3. **Forms & Validation**
   - Form labels
   - Error messages
   - Placeholder text

### Structure for Better Organization

Group translations by feature:

```
src/i18n/locales/
├── en.json
  ├── home
  ├── dashboard
  ├── auth
  ├── common
  └── errors
└── sq.json
  ├── (same structure)
```

Or use namespaces for large applications:

```
src/i18n/locales/
├── en/
│   ├── common.json
│   ├── home.json
│   └── dashboard.json
└── sq/
    ├── common.json
    ├── home.json
    └── dashboard.json
```

## 🔧 Configuration

### Change Default Language

Edit `src/i18n/i18n.ts`:

```tsx
lng: localStorage.getItem('language') || 'sq', // Set 'sq' as default
```

### Add More Languages

1. Create translation file: `src/i18n/locales/de.json`
2. Add to resources in `src/i18n/i18n.ts`:

```tsx
const resources = {
  en: { translation: enTranslation },
  sq: { translation: sqTranslation },
  de: { translation: deTranslation }, // Add this
};
```

3. Update language switcher in `LanguageSwitcher.tsx`

## ✨ Features Enabled

- ✅ Language persistence (localStorage)
- ✅ Language detection from browser settings
- ✅ React Hooks support with `useTranslation()`
- ✅ Hot reload support
- ✅ Namespace support for large translations
- ✅ Interpolation support for dynamic values
- ✅ Pluralization support

## 📚 Resources

- [react-i18next Docs](https://www.i18next.com/)
- [i18next Full Documentation](https://www.i18next.com/)
- [Common i18next Patterns](https://www.i18next.com/translation-function)

---

**Start translating your components today!** 🎉
