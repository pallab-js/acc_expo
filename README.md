# Ledger

A local-first personal finance app built with Expo, React Native, and TypeScript. Track transactions, budgets, and recurring rules — all data stays on your device.

## Features

- **Transactions** — Add income/expense entries with categories, notes, and dates
- **Budgets** — Set monthly limits per category with visual progress tracking
- **Recurring Rules** — Weekly/monthly/yearly auto-generated entries (rent, salary, subscriptions)
- **Dashboard** — Monthly overview with spending breakdown, budget health, and trends
- **Export** — CSV export for external analysis
- **Local-first** — No account required, data stored via AsyncStorage

## Tech Stack

- **Framework**: Expo 57 / React Native 0.86
- **Routing**: Expo Router (file-based)
- **State**: Zustand
- **Storage**: @react-native-async-storage/async-storage
- **Language**: TypeScript (strict)
- **Testing**: Jest + jest-expo

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS/Android/Web
npm run ios
npm run android
npm run web

# Lint & typecheck
npm run lint
npx tsc --noEmit

# Run tests
npm test
```

## Project Structure

```
src/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   ├── transaction/[id]/  # Transaction form (new/edit)
│   ├── budget/[id]/       # Budget form (new/edit)
│   ├── recurring/[id]/    # Recurring rule form (new/edit)
│   └── settings.tsx       # Settings & data management
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks (useForm, useConfirmDelete)
├── lib/                   # Pure logic (dates, money, recurring, selectors, csv)
├── store/                 # Zustand store with AsyncStorage persistence
├── storage/               # Repository layer & seed data
├── theme.ts               # Design tokens (colors, spacing, typography)
└── types.ts               # TypeScript interfaces
```

## Data Model

- **Transaction** — id, type (income/expense), amount (minor units), categoryId, date (ISO), note, recurringId, timestamps
- **Budget** — id, categoryId, amount (minor units), month (yyyy-MM)
- **RecurringRule** — id, type, amount, categoryId, frequency, startDate, note, active, lastGenerated, createdAt
- **Settings** — currency, seeded

## License

MIT