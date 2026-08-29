Bro, seeing the **actual component** makes the problem much clearer.

Your current UI isn't bad. In fact, the **admin-side "Deal Studio" concept is good**. The problem is that we're mixing three different things into one form:

1. **Proposal content** the client sees
2. **Pricing/configuration logic** used by Alpha Cut
3. **Internal operations** that should never reach the client

I'd change the architecture rather than just adding more fields.

## My recommended model

Think of it as:

```text
                    PROPOSAL STUDIO
                          │
          ┌───────────────┴───────────────┐
          ↓                               ↓
   CLIENT-FACING DATA              INTERNAL DATA
          │                               │
   What client accepts              Agency operations
          │                               │
          ↓                               ↓
     Proposal                         Deal Record
```

### 1. Proposal Information

I'd add these at the top:

```text
Proposal Title
Prepared For
Proposal Type
Proposal Date
Valid Until
```

For example:

> **Short-Form Video Editing Package**
> Prepared for: Alex Creator
> One-Off Project
> August 29, 2026
> Valid until: September 5, 2026

**Proposal Title is important.** Right now, the client receives something that essentially starts with "Basic/Professional/Premium." That's your pricing structure, not the actual proposal identity.

---

# 2. Project Scope

This is where I'd make the **biggest change**.

Your current fields:

```text
Editing Style
Video Format
Tier
```

aren't enough to define what the client is actually purchasing.

Add:

### Deliverables

For example:

```text
Deliverable: Short-form video
Quantity: 10
Duration: Up to 60 sec
Format: 9:16
```

Then:

### Included Services

Rather than relying entirely on "Professional Tier":

```text
✓ Clean cuts
✓ Animated captions
✓ Sound effects
✓ Music synchronization
✓ Motion graphics
✓ Color correction
```

This is **much harder to misunderstand**.

---

# 3. Don't make the Tier the actual scope

This is an important architectural point.

Keep:

```text
Basic
Professional
Premium
```

because it's useful for Alpha Cut's pricing system.

But the proposal should store a **snapshot of what that tier includes at the time the proposal is created**.

Why?

Imagine six months from now you change Professional from:

> SFX + Motion Graphics

to:

> SFX + Motion Graphics + Advanced Captions.

An old accepted proposal shouldn't magically change.

So conceptually:

```text
Pricing Template
       ↓
Professional
       ↓
Proposal created
       ↓
Snapshot
       ↓
Client accepts
```

The accepted proposal becomes its own historical agreement.

🔥 That's much more professional.

---

# 4. Fix "Video Format"

Currently:

```tsx
contentLength: "short" | "long";
```

but you're actually using it to mean **format**.

That's confusing.

You have:

```text
short → 9:16
long → 16:9
```

But "short" and "long" can refer to **video duration**, not aspect ratio.

I'd separate them.

```text
Aspect Ratio
9:16
16:9
1:1
4:5
```

and:

```text
Content Type
Short-form
Long-form
```

Then optionally:

```text
Maximum Duration
60 seconds
10 minutes
30 minutes
...
```

That's a cleaner data model.

---

# 5. Add quantity

This is probably the biggest missing field in your current form.

For a one-off project:

```text
Number of Videos
[ 10 ]
```

Because:

> Professional editing · $50

doesn't tell the client whether that's:

- 1 video
- 5 videos
- 10 videos

That's dangerous.

For retainers, your frequency already implies quantity, but I'd still make the resulting commitment explicit:

> **8 videos / month**

instead of making the client interpret:

> 2 videos / week.

---

# 6. Revisions 🔥

Add this.

```text
Included Revisions
[ 2 rounds ]
```

And possibly:

```text
Additional Revision Rate
[ 150 ETB ]
```

But I wouldn't necessarily show the second number in every proposal.

At minimum:

> **2 revision rounds included**

This prevents future:

> "Bro can you change this one thing?"

× 17 😂

---

# 7. Timeline needs more structure

Your current:

```text
Target Project Deadline Date
```

is too simple.

I'd use:

### One-Off

```text
Project Start
Expected Delivery
```

And:

### Retainer

```text
Contract Start
Billing Cycle
Delivery Schedule
Contract Term
```

You might not need a "deadline" for a monthly retainer because it's an ongoing service.

---

# 8. Payment terms

This is another major missing piece.

You currently have:

```text
Currency
Agreed Project Rate
```

But not:

> **How does the client pay?**

I'd add:

```text
Payment Structure

○ 100% upfront
○ 50% upfront / 50% completion
○ Custom
```

For retainer:

```text
Billing
○ Monthly upfront
○ Monthly after delivery
```

And potentially:

```text
Payment Method
```

but I'd only add this if Alpha Cut has established payment methods.

---

# 9. Client responsibilities

I would add this to the proposal.

Maybe a simple textarea:

> **Client Responsibilities**

Default text could be generated automatically:

> Client is responsible for providing footage, assets, references, and feedback required to complete the project.

Then Alpha Cut can customize it.

This is particularly useful for deadlines.

---

# 10. Scope / revision boundary

I'd add:

### What's not included

This is surprisingly valuable.

For example:

```text
Not Included:
• Scriptwriting
• Voice-over
• Original filming
• Thumbnail design
```

Otherwise clients may assume:

> "Since you're editing the video, can you also make the thumbnail?"

😂

This can be optional.

---

# 11. Reference Brief

Your existing:

> Reference Brief & Project Notes

is good.

I'd rename it:

### Creative Brief

and separate it from references.

```text
Creative Brief
[Describe the desired result...]

Reference Links
[YouTube / Drive / TikTok / etc.]
```

That's cleaner.

---

# 12. Private Studio Notes

Keep it exactly as an **internal field**, but I'd visually separate it:

```text
🔒 INTERNAL ONLY

Private Studio Notes
```

And from a backend/security perspective, make sure your client API **doesn't return this field at all**.

Not:

```json
{
  "proposal": {
    "notes": "Client is annoying..."
  }
}
```

and then hide it with CSS. ❌

The server should omit it from client-facing responses entirely.

---

# 13. Proposal expiration

Definitely add:

```text
Proposal Valid Until
```

This is useful because pricing can change.

For example:

> This proposal is valid until September 5, 2026.

After that:

```text
EXPIRED
```

The client shouldn't necessarily be able to accept an old proposal.

---

# 14. Acceptance

This is **not part of your current creation form**, but the generated client page should have:

```text
────────────────────────

Ready to move forward?

By accepting this proposal, you confirm
that you have reviewed and agreed to the
scope, pricing, timeline and terms.

[ Request Changes ]    [ Accept Proposal ]
```

Then record:

```text
acceptedAt
acceptedBy
proposalVersion
```

That's where Proposal → Deal becomes real.

---

# What I'd actually make your Studio look like

Instead of your current 4 sections, I'd make the admin studio:

```text
PROPOSAL & DEAL STUDIO

[ One-Off Project ] [ Monthly Retainer ]


01 · PROPOSAL
────────────────────────

Client
Proposal Title
Proposal Valid Until


02 · PROJECT SCOPE
────────────────────────

Service
Package Tier

Deliverables
Quantity
Content Type
Aspect Ratio
Duration

Editing Style

Included Services
[✓] Captions
[✓] Sound Design
[✓] Motion Graphics
[ ] Color Grading
[ ] Thumbnail


03 · CREATIVE DIRECTION
────────────────────────

Creative Brief

Reference Links / Files

Editing Style


04 · TIMELINE
────────────────────────

Start Date
Delivery Date

OR

Contract Start
Delivery Frequency
Contract Duration


05 · INVESTMENT
────────────────────────

Currency

Project Fee
OR
Monthly Retainer

Payment Structure


06 · REVISIONS & SCOPE
────────────────────────

Included Revisions

Additional Scope / What's Not Included


07 · CLIENT RESPONSIBILITIES
────────────────────────

Required Assets
Feedback / Approval expectations


08 · TERMS
────────────────────────

[Use default Alpha Cut terms]
[Customize]


🔒 INTERNAL
────────────────────────

Private Studio Notes


        [ Preview Proposal ]

        [ Send Proposal ]
```

---

## And I'd change your right-side preview

Currently it says:

> **DEAL TICKET PREVIEW**

I'd change that.

You're creating a **proposal**, not a ticket.

Make it:

> **LIVE PROPOSAL PREVIEW**

And make the preview look almost exactly like what the client will receive.

```text
┌──────────────────────────────┐
│         ALPHA CUT            │
│                              │
│   VIDEO EDITING PROPOSAL     │
│                              │
│ Short-Form Content Package   │
│ Prepared for Alex Creator    │
│                              │
│ ──────────────────────────── │
│                              │
│ PROJECT SCOPE                │
│ 10 × Short-form videos       │
│ 9:16 · Up to 60 sec          │
│                              │
│ INCLUDED                     │
│ ✓ Professional editing       │
│ ✓ Animated captions          │
│ ✓ Sound design               │
│ ✓ Motion graphics            │
│                              │
│ TIMELINE                     │
│ Sept 1 → Sept 7              │
│                              │
│ INVESTMENT                   │
│                              │
│        8,000 ETB             │
│                              │
│ 2 revision rounds included   │
│                              │
│ ──────────────────────────── │
│                              │
│ [ Request Changes ]          │
│ [ Accept Proposal ]          │
└──────────────────────────────┘
```

That is something I'd actually feel comfortable sending to a client.

---

### One architectural decision I'd make now

Your current backend has separate:

```text
POST /api/admin/proposals
POST /api/admin/contracts
```

That's okay, but conceptually I'd make them both **commercial agreements** with different types:

```text
Proposal
├── type: project
└── type: retainer
```

Then when accepted:

```text
Proposal
      ↓
Accepted
      ↓
Deal
      ↓
Project / Contract
```

This gives Alpha Cut room to grow without having the proposal system become a mess later.

**So I wouldn't just add 10 more inputs to your existing component.** I'd restructure the data model first, then rebuild the form around the actual client decision: **scope → timeline → price → terms → acceptance.**

That's the version that will feel like a real agency system rather than an admin form with a fancy UI.
