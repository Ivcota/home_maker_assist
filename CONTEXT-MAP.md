# Context Map

## Contexts

- [Household](./src/lib/domain/household/CONTEXT.md) — manages shared household membership, roles, and invite codes
- [Inventory](./src/lib/domain/inventory/CONTEXT.md) — tracks food items with expiration and restock logic
- [Recipe](./src/lib/domain/recipe/CONTEXT.md) — stores and matches recipes against inventory
- [Receipt](./src/lib/domain/receipt/CONTEXT.md) — AI-powered extraction of food items from receipt/food photos
- [Shopping List](./src/lib/domain/shopping-list/CONTEXT.md) — dynamically generates a shopping list from restock needs and pinned recipes
- [Cart](./src/lib/domain/cart/CONTEXT.md) — AI agent that fulfills a shopping list by adding items to a Walmart cart and returning a checkout link
- [Tasks](./src/lib/domain/tasks/CONTEXT.md) — simple to-do tracking scoped to a household
- [Subscription](./src/lib/domain/subscription/CONTEXT.md) — feature gating by subscription tier

## Relationships

- **Inventory → Shopping List**: expiring/low items become restock candidates on the shopping list
- **Recipe → Shopping List**: pinned recipe ingredients become shopping list items
- **Shopping List → Cart**: a CartSession is initiated against a ShoppingList's unchecked items
- **Subscription → Receipt, Cart**: scanning and "shop for me" are gated features
