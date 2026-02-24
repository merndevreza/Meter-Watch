# Types - Centralized Type Definitions

This directory contains all TypeScript type definitions for the meter-watch application. All types have been centralized into a single source of truth to maintain consistency and reduce duplication across the codebase.

## Structure

### `index.ts` - Central Hub
The main export file containing all type definitions organized by category:

#### Domain Models
These are the core data structures used throughout the application:
- **`Customer`** - Customer/meter information
- **`RechargeHistory`** - Individual recharge transaction records
- **`MonthlyConsumption`** - Monthly consumption and charges data

#### Scraper Types
Raw data types as scraped from the NESCO portal:
- **`ScrapedData`** - Complete scraped data wrapper
- **`ScrapedCustomerData`** - Raw customer data
- **`ScrapedRechargeRecord`** - Raw recharge record
- **`ScrapedMonthlyConsumption`** - Raw monthly consumption data
- **`ArrearNotice`** - Arrear notice information
- **`SavedDataSummary`** - Result of saving to database

#### User Types
- **`User`** - User authentication information

#### Component Props Types
React component prop types:
- **`NescoMeterDataType`** - Meter card data for frontend display
- **`MeterCardButtonsProps`** - Meter card buttons component props 
- **`DeleteConfirmationModalProps`** - Delete confirmation modal props
- **`ThresholdUpdaterModalProps`** - Threshold updater modal props

### Other Type Files
- **`dictionary.ts`** - i18n dictionary types
- **`modal.ts`** - ⚠️ *Deprecated* - see `index.ts` instead
- **`meter-type.ts`** - ⚠️ *Deprecated* - see `index.ts` instead
- **`recharge-type.ts`** - ⚠️ *Deprecated* - see `index.ts` instead
- **`monthly-consumption-type.ts`** - ⚠️ *Deprecated* - see `index.ts` instead
- **`scrape-type.ts`** - ⚠️ *Deprecated* - see `index.ts` instead
- **`user.ts`** - ⚠️ *Deprecated* - see `index.ts` instead
- **`next-auth.d.ts`** - NextAuth type augmentations

## Usage

All types should be imported from `@/types`:

```typescript
// ✅ Correct
import { 
  Customer, 
  RechargeHistory, 
  NescoMeterDataType,
  ScrapedData 
} from '@/types';

// ❌ Avoid (deprecated)
import { NescoMeterDataType } from '@/types/meter-type';
import { ScrapedData } from '@/types/scrape-type';
```

## Database Models Integration

Database models in `/database/models/` extend the base types with Mongoose Document interfaces:

```typescript
// In customer-model.ts
export interface ICustomer extends Document, Customer {}

// Exports both the interface and Mongoose model
export const Customer: Model<ICustomer> = ...
```

This pattern allows:
- Type safety for TypeScript
- Mongoose document methods availability
- Single source of truth for properties

## Backward Compatibility

Legacy type imports are still available but should be migrated to the centralized `index.ts`:

- `@/types/meter-type` → `@/types`
- `@/types/recharge-type` → `@/types`
- `@/types/monthly-consumption-type` → `@/types`
- `@/types/scrape-type` → `@/types`
- `@/types/modal` → `@/types`
- `@/types/user` → `@/types`

## Type Aliases

For backward compatibility and clarity, the following aliases are provided:

- `RechargeHistoryType` → `RechargeHistory`
- `MonthlyConsumptionType` → `MonthlyConsumption`
- `CustomerData` → `ScrapedCustomerData`
- `RechargeRecord` → `ScrapedRechargeRecord`
- `MonthlyConsumptionRecord` → `ScrapedMonthlyConsumption`

## Adding New Types

When adding new types:

1. Add them to `types/index.ts` in the appropriate section
2. Update this documentation
3. Do not create new type files
4. Use meaningful names and add JSDoc comments

## Design Principles

✅ **Centralization** - All types in one place reduces duplication
✅ **Clear Separation** - Domain models, scraped data, and component props are clearly separated
✅ **Documentation** - JSDoc comments explain the purpose of each type
✅ **Naming** - Types use `Scraped*` prefix, `*Props` suffix for clarity
✅ **DRY** - Database models extend base types rather than duplicating definitions
