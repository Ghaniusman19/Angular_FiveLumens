# Quick Reference Guide - Nested Accordion Fix

## 🎯 What Was The Problem?

You were trying to display a **3-level nested API response** with only a **single-level accordion**, treating complex objects as simple strings.

```javascript
// ❌ Your API response structure (3 levels)
criterias: [
  {
    title: "Customer Experience",
    scoringSections: [
      {
        title: "Nature of Call",
        details: [
          { description: "Was this a true cancellation call?", prompt: "...", score: 1 },
          // more details...
        ]
      }
    ]
  }
]

// ❌ But your template was doing:
@for (item of viewSCData()) {
  {{ item }}  // Shows: [object Object]
}
```

---

## ✅ The Solution

### 1. **Store Full Response**

```typescript
this.apiResponse.set(response.data); // Store everything
this.viewSCData.set(response.data.criterias); // Store criterias array
```

### 2. **Create Nested Accordions**

```html
<!-- Level 1: Criterias -->
@for (criteria of viewSCData(); track criteria._id) {
<button>{{ criteria.title }}</button>
@if(expanded) {
<!-- Level 2: Scoring Sections -->
@for (section of criteria.scoringSections; track section._id) {
<button>{{ section.title }}</button>
@if(expanded) {
<!-- Level 3: Details -->
@for (detail of section.details; track detail._id) {
<button>{{ detail.description }}</button>
@if(expanded) {
<div>{{ detail.prompt }}</div>
} } } } } }
```

---

## 📁 Files Modified

| File                   | What Changed                                                     |
| ---------------------- | ---------------------------------------------------------------- |
| **viewscorecard.ts**   | Added `apiResponse` signal, fixed data assignment, added imports |
| **viewscorecard.html** | Complete rewrite with 3-level nested accordions                  |
| **viewscorecard.css**  | Added comprehensive styling for nested levels                    |

---

## 🚀 How to Test

1. **Run your app**: `npm start`
2. **Navigate** to the viewscorecard page with a valid ID
3. **Check console**: See the full API response
4. **Verify accordion**:
   - ✅ Main criterion titles expand/collapse
   - ✅ Scoring sections are nested and expand/collapse
   - ✅ Details show within scoring sections
   - ✅ All text content displays correctly

---

## 🎨 Styling Breakdown

- **Level 1 (Criterias)**: Blue titles, light gray background
- **Level 2 (Sections)**: Nested with left border, lighter background
- **Level 3 (Details)**: Most indented, white background with full content

---

## 📊 Data Display

When expanded, each detail shows:

- **Prompt**: The evaluation criteria instruction
- **Score**: Numeric score value
- **Scoring Percentage**: Percentage contribution (9.1% in your case)
- **Auto Fail**: Whether this is an auto-fail item

---

## 🔍 Key Points to Remember

1. **Always use unique identifiers** for `track` expressions (use `_id` field)
2. **Nest accordions properly** - each level gets its own `@if(expanded)` check
3. **Style each level** - Visual hierarchy helps users understand depth
4. **Accessibility** - Keep `aria-` attributes for screen readers
5. **Performance** - Use `track` for proper change detection

---

## 🐛 Common Issues & Fixes

| Issue                                 | Fix                                            |
| ------------------------------------- | ---------------------------------------------- |
| "No pipe found with name 'uppercase'" | Import `UpperCasePipe` from `@angular/common`  |
| Only showing first level              | Add `@for` loops for each level                |
| Accordions not expanding              | Check `track` expressions use unique IDs       |
| Styling looks flat                    | Apply different background colors per level    |
| Memory leaks                          | Unsubscribe in `ngOnDestroy()` ✅ Already done |

---

## 📝 Example Output Structure

```
Run Evaluations in Batches and note respond time
Run Evaluations in Batches and note respond time.

▶ CUSTOMEREXPERIENCE - Customer Experience
  ▶ Nature of Call
    ▶ Was this a true cancellation call?
      Prompt: When analyzing the call transcript...
      Score: 1
      Scoring Percentage: 9.1%
      Is Auto Fail: No
    ▶ Was the cancellation due to dissatisfaction...
      [Details shown when expanded]
  ▶ Reasons for Cancellation
    ▶ Was the cancellation due to dissatisfaction with the service?
    ▶ Was the cancellation due to denial of reimbursement?
    [etc...]
```

---

## ✨ Next Steps

1. Run `npm start` to see the changes
2. Test the accordion functionality
3. Verify all data displays correctly
4. Customize styling if needed
5. Check console for any warnings/errors

You're all set! Your accordion now properly displays the entire nested API response! 🎉
