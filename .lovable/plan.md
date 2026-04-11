

## Plan: Transform Agent Teaser into Interactive Task-Processing Experience

### What changes

Replace the current static agent teaser (lines 489-514 in `HeroTrustShowcase.tsx`) with a multi-phase "agent working" simulation that makes users feel like the agent is actively doing work for them — task submission, processing steps with a progress bar, and a result reveal.

### New Agent Teaser Flow (5 phases, ~8s total per question)

```text
Phase 1 (1.5s): Question types in with cursor
Phase 2 (0.3s): "Processing your request..." label appears
Phase 3 (3s):   4 tool steps animate sequentially with progress bar filling
                 → "Scanning 1,247 reviews..." 
                 → "Cross-checking developer records..."
                 → "Analyzing delivery timelines..."
                 → "Computing trust score..."
Phase 4 (0.5s): Result fades in (the existing answer text)
Phase 5 (2s):   Hold result, then advance to next question or return to reviews
```

### Visual Details

- **Progress bar**: Thin bar at the bottom of the card using `journey-research` navy color, animating from 0% to 100% across the 4 steps
- **Tool steps**: Each step shows a small check icon when complete, a spinning loader when active, and is dimmed when pending — reuses the `ToolExecutionSteps` pattern from the copilot dashboard
- **Result reveal**: Answer slides up with a subtle scale-in, prefixed with a green checkmark
- **CTA**: "Try R8 Agent →" button pulses gently after result appears

### File Changes

**`src/components/HeroTrustShowcase.tsx`**
- Add new state: `teaserPhase` (`typing` | `processing` | `result`), `teaserStep` (0-3), `teaserProgress` (0-100)
- Replace the agent teaser block (lines 489-514) with the new multi-phase UI:
  - Phase "typing": existing typewriter effect (keep as-is)
  - Phase "processing": when typing finishes, transition to processing instead of showing answer directly
  - 4 processing steps with labels, each taking ~750ms, progress bar advancing 25% per step
  - Phase "result": answer text with checkmark, CTA button with gentle pulse
- Update the typing effect `useEffect` (lines 244-260) to set `teaserPhase = "processing"` instead of `setTeaserShowAnswer(true)`
- Add a new `useEffect` for the processing steps that advances `teaserStep` every 750ms and sets `teaserPhase = "result"` when done
- Update the cycle effect (lines 262-277) to trigger on `teaserPhase === "result"` instead of `teaserShowAnswer`

- Add processing step labels array:
  ```
  ["Scanning 1,247 reviews...", "Cross-checking developer records...", "Analyzing delivery timelines...", "Computing trust score..."]
  ```

- Import `Loader2, CheckCircle2` from lucide-react, `Progress` from ui/progress

**No i18n changes needed** — the processing step labels are short technical-feeling strings that work in both languages contextually (they appear briefly during animation).

### Result

The agent teaser transforms from a simple Q&A into a mini "agent at work" demo — users see it scanning, analyzing, and computing before delivering a result. This creates the feeling of a powerful tool doing real work, motivating clicks to "Try R8 Agent".

