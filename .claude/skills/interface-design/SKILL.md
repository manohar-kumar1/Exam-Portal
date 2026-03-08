---
name: interface-design
description: Use this skill whenever the task is to design, redesign, refine, critique, or explain UI for interactive products. Invoke it aggressively for dashboards, admin panels, SaaS apps, internal tools, settings screens, form flows, data tables, component systems, charts, design-system work, responsive app layouts, or any interface a real user operates repeatedly. Also use it when the user says "make it look better", "add polish", "redesign this", "critique my UI", "improve hierarchy", "fix spacing", "choose typography", "audit this design", or wants help understanding why a UI feels generic. Use it for both greenfield builds and iterative improvements. Do not use it for marketing/landing pages or one-off promotional pages.
---

# Interface Design

Build interfaces with intent, psychology, and craft. Every decision is authored, never defaulted.

## When to Use

Dashboards, admin panels, SaaS apps, tools, settings pages, data interfaces, charts, form flows, data tables, component libraries for web apps.

## Operating Modes

- **Build / redesign** — Create or revise interface direction, then implement.
- **Critique / audit** — Diagnose what defaulted, what lacks hierarchy, what should change.
- **Teach / explain** — Explain why a choice works, what is generic, how to make decisions intentional.

---

## Core Philosophy: Kill the Default

The enemy is not ugly design. It is *default* design — the output you get when no human made a real choice. Default spacing, default card layouts, default sidebar widths, default color schemes. These produce interfaces that are technically correct but feel like they came off an assembly line.

Three rules govern everything in this skill:

**1. Never ship the first idea.** The first layout, color scheme, or component structure that comes to mind is almost always a pattern you've absorbed from seeing a thousand other interfaces. It works, but it's forgettable. Before committing to any direction, explore at least two alternative approaches. The goal is not to be different for its own sake — it is to find the approach that genuinely fits this specific product and its users.

**2. Every decision needs a "because."** Why this layout? Why this color temperature? Why this spacing density? If the answer is "it's standard" or "it looks clean" — you have not yet designed. You have assembled. The "because" should trace back to: who the user is, what they are trying to accomplish, how the interface should make them feel, or a specific design psychology principle.

**3. Design for the human, not the screen.** The person using this interface has a context — they are tired, or they are in a hurry, or they are anxious about making the right choice. The teacher grading exams at 7am is not the developer debugging at midnight. Their emotional state, cognitive load, and physical environment shape every design decision.

---

## The Design Flow

Every interface task follows this sequence. Steps can be brief for small changes, but the thinking should always happen.

```
Step 1: Understand    → Who, what, why, how it should feel
Step 2: Audit         → What exists, what defaulted, what works
Step 3: Diverge       → Explore 2-3 genuinely different approaches
Step 4: Converge      → Pick the right direction (with the user)
Step 5: Psychology     → Apply perception and decision laws to the structure
Step 6: Build         → Implement with craft, direction + code
Step 7: Evaluate      → Run quality checks before showing
```

---

# Step 1 — Understand: Ask Before You Design

Before touching any component, establish context. If the request already answers these, paraphrase and proceed. If not, ask — never guess.

**Who is this person?** Not "users." The actual human. Where are they when they open this? What is on their mind? A teacher reviewing submissions at 7am has different needs than a founder checking metrics between investor calls. Their world shapes density, tone, color temperature, and information priority.

**What must they accomplish?** Not "use the dashboard." The verb. Grade these submissions. Find the broken deployment. Approve the payment. The answer determines what leads, what follows, and what hides.

**How should this feel?** "Clean and modern" means nothing — every AI says that. Be specific: warm like a notebook? Cold like a terminal? Dense like a trading floor? Calm like a reading app? The feel constrains color, type, spacing, density — everything.

**What is the developer's context?** What tech stack, component library, design tokens already exist? What constraints are non-negotiable? Understanding developer needs prevents beautiful designs that are impossible to implement.

---

# Step 2 — Audit: Understand What Exists

## For Redesign or Improvement

Before changing anything, read the existing design:

- **What works?** Patterns users understand, structures they rely on, habits they have built. Preserve these — Jakob's Law means users carry cognitive models from the existing design.
- **What defaulted?** Typography that is just "the readable default." Navigation that is just "the standard sidebar." Name these specifically.
- **What is structurally broken?** Missing interaction states, inconsistent spacing, mixed depth strategies, harsh borders, flat text hierarchy.
- **What was never designed?** Gaps where no decision was made and something just appeared. These are the biggest opportunities.

State your audit findings before proposing changes.

## For Greenfield

Identify constraints: platform, real content shape (not lorem ipsum), adjacent interfaces, existing design tokens and component libraries.

---

# Step 3 — Diverge: Explore Before You Commit

This is where most AI-generated design fails. The model picks the most statistically likely layout and goes with it. The result: every dashboard looks the same, every form has the same structure, every login page has the same centered card.

**Generate at least 2-3 genuinely different approaches** before settling. These are not cosmetic variations (same layout, different colors). They are structurally different ideas:

- Different information architecture (what leads, what follows)
- Different spatial strategies (dense vs. spacious, sidebar vs. top-nav, single-column vs. multi-panel)
- Different emotional tones (serious vs. approachable, data-forward vs. narrative)
- Different interaction models (everything visible vs. progressive disclosure)

For each approach, briefly articulate:
- What this approach prioritizes
- What it sacrifices
- Which psychology principles it leans on
- Why it might be the right fit

Present these to the user as genuine options, not one real choice and two strawmen.

---

# Step 4 — Converge: Choose With the User

Once a direction is chosen, ground it in the product's domain before building.

**Domain exploration** — Find concepts, metaphors, and vocabulary from this product's world. Not features — territory. If this product were a physical space, what would you see? What colors, materials, lighting exist in that world?

**Color world** — What colors belong naturally in this domain? A medical app lives in a different color world than a music production tool. List 5+ colors that exist in this product's physical domain.

**Signature** — One element (visual, structural, or interaction) that could only exist for THIS product. If you can picture it in any generic dashboard, it is not a signature.

**Defaults to reject** — Name 3 obvious "standard" choices for this interface type and decide what replaces each one.

**The test:** Read your direction. Remove the product name. Could someone identify what this is for? If not, explore deeper.

---

# Step 5 — Psychology: Design for How Humans Actually Think

These principles are not theory — they are the mechanics of human perception and decision-making. Apply the relevant ones during layout, hierarchy, and interaction decisions. Read `references/psychology.md` for the full reference with detailed examples.

## Guiding Attention

**Visual Hierarchy** — Size, contrast, position, and white space direct attention before the user reads a word. The primary action or key metric should visually dominate. When everything competes equally, nothing wins.

**Von Restorff Effect** — The thing that differs from its surroundings gets remembered. This is why CTAs use contrasting colors — they break the pattern deliberately. Use isolation to make the most important action unmissable.

**Figure/Ground** — The brain separates foreground objects from background. Use this actively: elevated cards on muted backgrounds, highlighted rows in tables, selected states that lift elements forward.

**Serial Position Effect** — People remember the first and last items in a sequence best. Place the most critical actions or information at the beginning and end of navigation, lists, and flows.

## Managing Decisions

**Hick's Law** — More choices = slower decisions. Use progressive disclosure, smart defaults, and grouped options (5-7 per group) to prevent choice paralysis. A settings page with 30 ungrouped toggles overwhelms; the same settings in 5 categories feels manageable.

**Miller's Law** — Humans hold ~7 items in working memory. Chunk navigation, form fields, and data into perceivable groups of 5-7. Use spacing and headers to make clusters obvious.

**Fitts's Law** — Larger, closer targets are faster to hit. Primary actions should be prominent and reachable. Destructive actions should be smaller and separated from primary ones.

## Familiarity and Perception

**Jakob's Law** — Users expect your interface to work like others they use daily. Respect conventions (logo top-left = home, gear = settings, X = close) unless your alternative is unambiguously superior.

**Gestalt Principles** — The brain groups elements automatically:
- *Proximity* — Close elements are perceived as a group. Spacing within groups < spacing between groups.
- *Similarity* — Same visual treatment = same function. All clickable elements share traits.
- *Closure* — The brain completes incomplete shapes. Use for icons, carousels, visual hints.
- *Continuity* — Elements along a line or curve feel related. Use for progress flows and data trends.

## Cognitive Load

**Progressive Disclosure** — Show what is needed now; reveal complexity on demand. New users see simplicity; power users find depth behind one click.

**Recognition over Recall** — Show options, do not require users to remember them. Dropdowns beat text inputs for known option sets. Recent items and favorites reduce navigation overhead.

**Aesthetic-Usability Effect** — Users perceive polished interfaces as more usable and forgive functional flaws more readily. Visual craft is not decoration — it earns the user's trust and patience.

## Memory and Emotional Retention

**Peak-End Rule** — Users judge an experience by its most intense moment and how it ends. Celebrate completed tasks with success states, confirmation messages, or subtle delight animations. Make endings feel good.

**Zeigarnik Effect** — People remember incomplete tasks more than completed ones. Use progress indicators, step counters, and completion percentages to motivate users through multi-step flows like onboarding, profile setup, or form wizards.

**Color Psychology** — Colors evoke specific feelings. Blue conveys trust (banking, enterprise). Red signals urgency or danger (errors, destructive actions). Green signals success. Orange/yellow signals caution. Use color to reinforce meaning, never for decoration alone. Always provide redundant cues for colorblind users (icons, text, patterns alongside color).

---

# Step 6 — Build: Direction First, Then Code

## The 8-Point Grid

All spacing, sizing, and layout decisions align to an 8px base grid. This creates consistent visual rhythm across every component:

- **4px** — micro spacing (icon gaps, tight label pairs, inline element margins)
- **8px** — minimum component spacing (padding within dense controls)
- **16px** — standard component padding (cards, inputs, buttons)
- **24px** — comfortable section spacing (between form groups, card clusters)
- **32px** — major section separation
- **48px / 64px** — page-level breathing room

Every value should be a multiple of 4, with 8 as the primary unit. Random pixel values are the clearest sign that no design system exists.

## Per-Component Design Checklist

Before writing UI code, be able to answer:

```
Intent:   Who is this human, what must they do, how should it feel?
Palette:  Colors from domain exploration — and WHY they fit.
Depth:    Borders / shadows / layered — and WHY this fits the intent.
Surfaces: Elevation scale — and WHY this color temperature.
Type:     Typeface and hierarchy — and WHY it fits the intent.
Grid:     8-point spacing with density that matches the task.
```

Use as an internal checklist. Surface reasoning only when the user needs rationale or tradeoffs are non-obvious.

## Craft Foundations

Read `references/principles.md` for full implementation details. Key craft principles:

**Subtle layering** — The backbone of professional interfaces. Surface elevation shifts should be barely visible in isolation but create clear hierarchy when stacked. Study Vercel, Linear, Supabase — their craft is invisible, which is how you know it is working.

**Border progression** — Borders are not binary. Scale intensity to match boundary importance: subtle for sections, standard for cards, strong for focus rings. Use low-opacity rgba so borders define edges without demanding attention.

**Surface elevation** — Surfaces stack. Build a numbered system (base → card → dropdown → overlay). In dark mode, higher = slightly lighter. In light mode, higher = shadow or lighter. Each jump: barely visible, felt rather than seen.

**Infinite expression** — No two interfaces should look the same. Same concepts, infinite variations. A metric display could be a hero number, sparkline, gauge, progress bar, trend badge, or something entirely new. The architecture emerges from the task and data.

## Implementation Pattern

When building, follow this output structure:

1. **State the direction** — Brief explanation of the design rationale: what principles are driving the choices, what the interface should feel like, why this approach over alternatives.
2. **Write the code** — React/TypeScript with Tailwind, using existing component libraries (shadcn/ui, Radix) where appropriate. Every major styling choice should trace back to the stated direction.
3. **Call out key decisions** — After the code, note 3-5 specific decisions that matter most: spacing, color, hierarchy, interaction choices. Explain why each one serves this specific product.

---

# Step 7 — Evaluate: Check Before Showing

**Before showing the user, look at what you made.**

Ask: "If they said this lacks craft, what would they mean?" That thing you just thought of — fix it first.

## Quality Checks

- **The swap test:** If you swapped the typeface, layout, or color scheme for the most common alternative and nobody noticed — you defaulted. Go back to Step 3.
- **The squint test:** Blur your eyes. Hierarchy should still be perceivable. Nothing should jump out harshly. Craft whispers.
- **The signature test:** Can you point to specific elements where your design signature appears? Not "the overall feel" — actual components.
- **The psychology test:** Can you name which laws and principles are actively shaping the layout? If none, you designed by instinct, not intent.

## Anti-Patterns to Reject

- Harsh borders that steal attention from content
- Dramatic surface jumps that look like separate apps glued together
- Inconsistent spacing that signals no design system
- Mixed depth strategies (borders + shadows randomly)
- Missing interaction states (hover, focus, disabled, loading, empty, error)
- Pure white cards on colored backgrounds — tint to match page temperature
- Gradients and color for decoration — every color application should communicate
- Multiple competing accent colors — one accent, used with intention

Read `references/critique.md` for the full post-build review protocol.

---

# Workflow

## Communication Style

Be invisible. Do not announce modes, narrate process, or describe what you are doing before you do it. Jump into work. State results, not process. Surface reasoning only when it helps the user decide.

---

# Reference Files — Load On Demand

| Reference | Load when | What it gives you |
| --- | --- | --- |
| `references/psychology.md` | Making hierarchy, layout, or interaction decisions | All design psychology laws with detailed examples and applications |
| `references/principles.md` | Need token-level CSS patterns, spacing systems, dark mode, elevation details | Full system-building reference: primitives, surfaces, borders, typography, depth |
| `references/critique.md` | Post-build quality review or running `/interface-design:critique` | Review protocol: composition, craft, content, structure layers |
| `references/example.md` | Unsure how subtle layering translates to actual decisions | Concrete sidebar, surface, border, dropdown choices with reasoning |

# Commands

- `/interface-design:status` — Current direction and design constraints
- `/interface-design:audit` — Check code against intended direction. Read `references/principles.md` for standards.
- `/interface-design:extract` — Extract reusable patterns from existing code
- `/interface-design:critique` — Read `references/critique.md`, then critique your build and rebuild what defaulted
