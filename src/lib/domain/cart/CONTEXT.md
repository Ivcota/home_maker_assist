# Cart Context

An AI agent fulfills a household's shopping list by adding unchecked items to a Walmart cart and resolving a checkout link the user can click.

## Language

**CartSession**:
A single agent-driven attempt to fulfill a ShoppingList via a Walmart guest cart. Tracks status, holds the resolved cart URL, and records skipped items.
_Avoid_: Cart, Order, Trip

**CartStatus**:
The lifecycle state of a CartSession: `pending` (agent working) → `resolved` (URL ready) or `failed` (agent could not complete).
_Avoid_: State, Phase

**ResolvedCartUrl**:
The Walmart guest cart URL returned by the agent when a CartSession reaches `resolved` status.
_Avoid_: Link, Checkout URL

**SkippedItem**:
A shopping list item the agent could not find on Walmart. Recorded on the CartSession so the user knows what wasn't added.
_Avoid_: Missing item, unfulfilled item

## Relationships

- A **ShoppingList** can have many **CartSessions**
- A **CartSession** targets all unchecked items on its **ShoppingList** at the time it was created
- A **CartSession** belongs to exactly one **ShoppingList**
- The most recent `resolved` **CartSession** is the one surfaced to the user

## Example dialogue

> **Dev:** "What do we show the user while the agent is running?"
> **Domain expert:** "A loading state — the CartSession is `pending`. Once it's `resolved`, we show the ResolvedCartUrl as a button they can tap to open Walmart."

> **Dev:** "What if the user hits 'Shop for me' twice?"
> **Domain expert:** "A new CartSession is created. The previous one stays in history. We show the latest resolved one."

## Constraints

- Initiating a CartSession requires the `'cart'` feature gate to pass (`checkFeatureAccess('cart')`)
- CartSessions run as background jobs — browser automation is too slow for a synchronous API response
- Walmart guest cart only (no login required)

## Flagged ambiguities

- "Cart" alone is ambiguous with the in-store Walmart concept — we use **CartSession** to make clear it's a session/attempt in our system, not the Walmart cart itself.
