# Ubiquitous Language

## Inventory

| Term                 | Definition                                                                                            | Aliases to avoid            |
| -------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------- |
| **Food Item**        | A product stored in a household location with expiration and quantity tracking                        | Item, grocery, product      |
| **Storage Location** | The physical place a Food Item is kept: `pantry`, `fridge`, or `freezer`                              | Location, shelf, area       |
| **Tracking Type**    | How a Food Item is measured: `amount` (percentage 0–100) or `count` (whole units ≥ 1)                 | Measurement type, unit type |
| **Amount**           | A percentage (0–100) representing how much of a bulk/unpackaged Food Item remains                     | Level, fill, percentage     |
| **Quantity**         | The number of discrete units of a packaged Food Item                                                  | Count, number, units        |
| **Canonical Name**   | A normalized, lowercase version of a Food Item or Ingredient name used for matching and deduplication | Normalized name, key, slug  |

## Expiration & Restock

| Term                  | Definition                                                                              | Aliases to avoid                |
| --------------------- | --------------------------------------------------------------------------------------- | ------------------------------- |
| **Expiration Status** | A Food Item's freshness state: `fresh`, `expiring-soon`, or `expired`                   | Freshness, health, state        |
| **Expiring Soon**     | A Food Item whose expiration date is within the configurable threshold (default 3 days) | About to expire, almost expired |
| **Restock Item**      | A Food Item that is `expired` or `expiring-soon` and needs replenishment                | Low stock, alert item           |

## Recipes

| Term                 | Definition                                                                                                                        | Aliases to avoid          |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| **Recipe**           | A named cooking formula composed of one or more Ingredients                                                                       | Meal, dish                |
| **Ingredient**       | A named component of a Recipe with an optional quantity and unit                                                                  | Recipe item, component    |
| **Recipe Readiness** | Whether a Recipe can be cooked given current inventory: `ready` (100% matched), `almost-ready` (≥ 50%), or `need-to-shop` (< 50%) | Availability, cookability |
| **Ingredient Match** | The result of comparing an Ingredient's Canonical Name against inventory Food Items                                               | Lookup, link              |

## Scanning

| Term                    | Definition                                                                          | Aliases to avoid              |
| ----------------------- | ----------------------------------------------------------------------------------- | ----------------------------- |
| **Receipt Scanning**    | AI-powered extraction of Food Items from a grocery receipt photo                    | OCR, parsing                  |
| **Recipe Scanning**     | AI-powered extraction of Recipes and Ingredients from a cookbook or meal plan photo | Recipe OCR, recipe import     |
| **Extracted Food Item** | A Food Item parsed from a receipt image, not yet persisted to inventory             | Scanned item, parsed item     |
| **Extracted Recipe**    | A Recipe parsed from an image, not yet persisted                                    | Scanned recipe, parsed recipe |

## Lifecycle operations

| Term               | Definition                                                              | Aliases to avoid          |
| ------------------ | ----------------------------------------------------------------------- | ------------------------- |
| **Trash**          | Soft-delete a Food Item or Recipe by setting a `trashedAt` timestamp    | Delete, remove, archive   |
| **Restore**        | Recover a trashed Food Item or Recipe within the 24-hour restore window | Undelete, recover, undo   |
| **Restore Window** | The 24-hour period after trashing during which an item can be restored  | Grace period, undo window |

## Tasks

| Term                | Definition                                                                           | Aliases to avoid            |
| ------------------- | ------------------------------------------------------------------------------------ | --------------------------- |
| **Task**            | A prioritized to-do item with a title and optional completion timestamp              | Todo, reminder, chore       |
| **Task Completion** | Toggling a Task's `completedAt` between null (incomplete) and a timestamp (complete) | Done, finished, checked off |

## Relationships

- A **Food Item** has exactly one **Storage Location** and one **Tracking Type**
- A **Food Item** has one **Expiration Status** derived from its expiration date
- A **Restock Item** wraps a **Food Item** that is `expired` or `expiring-soon`
- A **Recipe** contains one or more **Ingredients**
- An **Ingredient** may match zero or one **Food Items** via **Canonical Name**
- **Recipe Readiness** is computed from the ratio of matched **Ingredients** to total **Ingredients**
- **Receipt Scanning** produces **Extracted Food Items** that become **Food Items** when saved
- **Recipe Scanning** produces **Extracted Recipes** that become **Recipes** when saved

## Example dialogue

> **Dev:** "When a user scans a receipt, do the **Extracted Food Items** go straight into inventory?"
> **Domain expert:** "No — the user reviews the **Extracted Food Items** first and can edit names, **Storage Locations**, and **Tracking Types** before saving. Only then do they become **Food Items**."
> **Dev:** "And the **Restock** tab — does it include items with no expiration date?"
> **Domain expert:** "No. A **Restock Item** must have an **Expiration Status** of `expired` or `expiring-soon`. Items without an expiration date are always `fresh` and never appear in Restock."
> **Dev:** "For **Recipe Readiness**, if I have milk in the fridge and a recipe calls for milk, how does matching work?"
> **Domain expert:** "We compare **Canonical Names**. If the **Ingredient** and **Food Item** share the same **Canonical Name** (case-insensitive, trimmed), it counts as an **Ingredient Match**. We don't check quantity — just presence."

## Flagged ambiguities

- **"Item"** is used loosely throughout the codebase to mean **Food Item**, **Restock Item**, **Extracted Food Item**, or even a generic list entry. Always qualify: a _Food Item_ is in inventory, a _Restock Item_ is on the restock list, an _Extracted Food Item_ is fresh from scanning.
- **"Amount" vs "Quantity"** — these are _not_ interchangeable. **Amount** is a percentage (0–100) for bulk items tracked by `amount` type. **Quantity** is a whole-number count for discrete items tracked by `count` type. A Food Item has one or the other, never both.
- **"Trash" vs "Delete"** — **Trash** is a soft delete with a 24-hour **Restore Window**. There is no hard delete exposed to users. Code should use "trash" (not "delete") to avoid implying permanence.
- **"Ingredient" vs "Food Item"** — An **Ingredient** exists only within a **Recipe**. A **Food Item** exists in inventory. They are linked by **Canonical Name** matching, but are distinct domain concepts with different schemas.
