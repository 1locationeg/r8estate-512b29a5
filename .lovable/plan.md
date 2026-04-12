

## Plan: Move AudienceSegmentCards under "From doubt to confidence"

### Changes in `src/pages/Index.tsx`

1. **Remove** line 520: `<div className="w-full max-w-[1100px] py-8 md:py-12"><AudienceSegmentCards /></div>`

2. **Insert** after the HowWeWork block (after line 481), with a divider:
```
<div className="w-full max-w-[1100px] py-8 md:py-12"><AudienceSegmentCards /></div>
<div className="w-16 h-px bg-border mx-auto" />
```

### Resulting order
HowWeWork ("From doubt to confidence") → **AudienceSegmentCards** → Category Links → ...

