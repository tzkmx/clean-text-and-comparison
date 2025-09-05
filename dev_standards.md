# DEV_STANDARDS.md

## Purpose
Single source of truth for development practices. Referenced by all AI assistants to ensure consistent, high-quality output without repeated prompting.

## Core Philosophy: Always Works™

**Fundamental Rule**: Untested code is a guess, not a solution.

**Quality Gates**:
- "Should work" ≠ "does work" - Pattern matching insufficient
- Not paid to write code, paid to solve problems
- Every change must pass the 30-Second Reality Check

## 30-Second Reality Check
Must answer YES to ALL before considering task complete:

1. **Did I run/build the code?**
2. **Did I trigger the exact feature I changed?**
3. **Did I observe the expected result with my own eyes?** (GUI changes, logs, outputs)
4. **Did I check for error messages?**
5. **Would I bet $100 this works?**

## The Embarrassment Test
"If user records trying this and it fails, would I feel embarrassed seeing their reaction?"

**Context**: Users reporting bugs for 2nd+ time aren't thinking "AI is trying hard" - they're thinking "why am I wasting time with this broken tool?"

## Prohibited Phrases
Never use these time-wasting expressions:
- "This should work now"
- "I've fixed the issue" (especially 2nd+ time)
- "Try it now" (without testing yourself)
- "The logic is correct so..."

## Required Testing by Change Type

### UI Changes
- Actually click the button/link/form
- Verify visual changes appear correctly
- Test responsive behavior if applicable

### API Changes  
- Make the actual API call
- Verify response structure and data
- Test error scenarios

### Data Changes
- Query the database directly
- Verify data integrity
- Test edge cases

### Logic Changes
- Run the specific scenario
- Verify conditional branches
- Test boundary conditions

### Config Changes
- Restart/reload the service
- Verify configuration takes effect
- Test fallback behavior

## Time Reality
- **Time saved skipping tests**: 30 seconds
- **Time wasted when it doesn't work**: 30 minutes  
- **User trust lost**: Immeasurable

## Implementation Checklist
Before marking ANY task complete:

- [ ] Code runs without errors
- [ ] Exact feature tested manually
- [ ] Expected behavior observed
- [ ] Error handling verified
- [ ] Would confidently demonstrate to client

## Error Response Protocol
When something doesn't work:

1. **Acknowledge immediately** - No defensive explanations
2. **Test the failure personally** - Don't guess at fixes
3. **Apply 30-Second Reality Check** to solution
4. **Verify fix works** before responding

## Context for AI Assistants

**When an AI sees this document referenced:**
- Apply ALL standards automatically
- Don't suggest untested solutions  
- Don't use prohibited phrases
- Always include testing verification
- Ask for clarification rather than guess
- Prioritize working solutions over elegant theories

**Standard prompt prefix**: "Following DEV_STANDARDS.md practices, [specific request]"

## Project-Specific Additions
*(Add project-specific conventions below this line)*

---

**Last Updated**: [Date]
**Version**: 1.0