# Edit Scorecard - Quick Reference Guide

## 🎯 What It Does

Fully editable accordion-based scorecard with live totals, add/remove controls, and API persistence.

---

## 📂 Files Modified

| File                         | Purpose                                       |
| ---------------------------- | --------------------------------------------- |
| `editscorecard.ts`           | Logic: Form building, handlers, API calls     |
| `editscorecard.html`         | UI: 3-level accordion with form controls      |
| `editscorecard.css`          | Styling: Gradients, responsive, accessibility |
| `editscorecard.ts` (service) | `UpdateScoreCard()` method for API updates    |

---

## 🔄 Form Structure (Nested)

```
FormGroup (root)
├── criterias: FormArray
│   └── [0]: FormGroup (criteria)
│       ├── title (editable)
│       ├── type (editable)
│       ├── criteriaTotal (disabled read-only)
│       └── scoringSections: FormArray
│           └── [0]: FormGroup (section)
│               ├── title (editable)
│               ├── sectionTotal (disabled read-only)
│               └── details: FormArray
│                   └── [0]: FormGroup (detail)
│                       ├── prompt (textarea, editable)
│                       ├── score (number input, editable)
│                       └── ... other fields
└── metaData: FormArray
    └── [0]: FormGroup (meta)
        ├── title (editable)
        ├── fieldType (editable)
        └── prompt (textarea, editable)
```

---

## 🎨 UI Layout

```
┌─────────────────────────────────┐
│     Edit Scorecard Header       │
│  + Success/Error Message        │
├─────────────────────────────────┤
│                                 │
│  META DATA (collapsed by def)    │
│  ├─ Meta Item 1 [×]            │
│  └─ Meta Item 2 [×]            │
│  └─ + Add Meta Data             │
│                                 │
│  SCORING                        │
│  ├─ Criteria 1 [Total: 20] [×]  │
│  │  ├─ Section A [Total: 10] [×]│
│  │  │  ├─ Detail 1: [score] [×] │
│  │  │  └─ + Add Detail          │
│  │  └─ + Add Section            │
│  ├─ + Add Criteria              │
│                                 │
│  ┌─────────────────────────────┐│
│  │   [Save Changes]            ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

---

## 🔑 Key Functions

### Form Building

```typescript
createCriteriaFormGroup(criteria); // Build criteria FormGroup
createSectionFormGroup(section); // Build section FormGroup
createDetailFormGroup(detail); // Build detail FormGroup
createMetaDataFormGroup(meta); // Build meta FormGroup
```

### Totals

```typescript
computeDetailsTotal(details); // Sum of detail scores
computeCriteriaTotal(criteria); // Sum of section totals
```

### Add/Remove

```typescript
addCriteria(); // Add new criteria to array
addSection(criteriaIndex); // Add new section to criteria
addDetail(criteriaIndex, si); // Add new detail to section
addMeta(); // Add new meta item

removeCriteria(index); // Remove criteria by index
removeSection(ci, si); // Remove section by criteria & section index
removeDetail(ci, si, di); // Remove detail by all 3 indices
removeMeta(index); // Remove meta by index
```

### Special

```typescript
onScoreChange(ci, si); // Called when score input changes
// Recalcs section & criteria totals
// Instantly updates UI

serializeFormToPayload(); // Convert FormGroup to API shape
// Coerces numbers, includes _id

save(); // Validate → Serialize → API call
// Shows "Saving..." and success/error
```

### Template Getters

```typescript
get criteriaControls               // Array of criteria FormGroup controls
sectionControls(ci)                // Array of sections in criteria[ci]
detailControls(ci, si)             // Array of details in section[ci][si]
get metaControls                   // Array of meta FormGroup controls
```

---

## 🎬 Usage Examples

### Edit a Score and Save

```html
<!-- In template -->
<input type="number" formControlName="score" (input)="onScoreChange(ci, si)" />

<!-- Component (automatic) -->
onScoreChange() ├─ Get details array value ├─ computeDetailsTotal() → section total ├─
patchValue(sectionTotal) ├─ Get sections value ├─ computeCriteriaTotal() → criteria total └─
patchValue(criteriaTotal)
```

### Add a New Detail

```html
<button (click)="addDetail(ci, si)">+ Add Detail</button>
```

```typescript
addDetail(ci, si) {
  const details = section.get('details') as FormArray;
  details.push(this.createDetailFormGroup());
  // UI auto-updates with new empty form row
}
```

### Save Changes to Server

```html
<button (click)="save()" [disabled]="form.invalid || saving">
  {{ saving ? 'Saving...' : 'Save Changes' }}
</button>
```

```typescript
save() {
  if (form.invalid) show error;

  payload = serializeFormToPayload() {
    // Convert FormGroup.value to API shape
    // Coerce scores to numbers
    // Include _id fields
    // Omit disabled controls
  };

  this.editScoreCard.UpdateScoreCard(payload).subscribe(
    success => show "Updated!"
    error => show "Error: ..."
  );
}
```

---

## ✅ Validation

### What's Required?

- `title` (criteria & section) - `Validators.required`
- `prompt` (detail) - `Validators.required`
- `score` (detail) - `Validators.required, Validators.min(0)`

### Form Invalid When?

- Any required field is empty
- Any score is negative

### UI Feedback?

- Save button **disabled** if form invalid
- Error message shows if user tries to save with invalid form

---

## 🌐 API Integration

### Load Data (On Init)

```
POST /api/auth/scorecards/edit
Body: { id: scorecardId }
Headers: Authorization: Bearer token
Response: { data: { _id, title, criterias[], metaData[], ... } }
```

### Save Changes

```
POST /api/auth/scorecards/update
Body: {
  _id, title, description,
  criterias: [{
    _id, type, title, method, option, totalScore,
    scoringSections: [{
      _id, title,
      details: [{
        _id, uniqueId, prompt, description,
        score, fieldType, isAutoFail, scoringPercentage,
        definition: { title, description, descriptions }
      }]
    }]
  }],
  metaData: [{
    _id, fieldType, title, prompt, isRequired, isSecondLevel, options
  }]
}
Headers: Authorization: Bearer token
Response: { success, message, data }
```

---

## 🎨 CSS Classes

### Container & Layout

- `.edit-scorecard-container` - Main wrapper
- `.header` - Title & message area
- `.meta-section` - Meta data block
- `.scoring-section` - All criteria

### Accordions

- `.meta-accordion` - Meta items
- `.meta-header` - Meta button header
- `.meta-body` - Meta content
- `.criteria-header` - Criteria button (gradient)
- `.criteria-body` - Criteria content
- `.section-header` - Section button (gradient)
- `.section-body` - Section content
- `.details-container` - Details list
- `.detail-item` - Single detail card
- `.detail-header` - Detail inputs row
- `.detail-body` - Additional fields

### Forms

- `.form-group` - Input label + control
- `.form-input` - Text input styling
- `.form-textarea` - Textarea styling
- `.score-input` - Score number input
- `.scoring-percentage` - Percentage badge

### Buttons

- `.btn-save` - Primary save button (gradient)
- `.btn-add-criteria` - Add criteria (darker)
- `.btn-add-section` - Add section
- `.btn-add-detail` - Add detail
- `.btn-add` - Add meta
- `.btn-icon` - Delete × button
- `.btn-icon:hover` - Hover state

### Messages

- `.success` - Green background, success text
- `.error` - Red background, error text

---

## 🚀 Performance

| Operation    | Complexity | Notes                                           |
| ------------ | ---------- | ----------------------------------------------- |
| Load form    | O(n)       | n = total items (criteria + sections + details) |
| Score change | O(m)       | m = details in section (for one section)        |
| Add item     | O(1)       | Just push to FormArray                          |
| Delete item  | O(1)       | Just removeAt from FormArray                    |
| Save         | O(n)       | Serialize n items to payload                    |

---

## 🐛 Common Issues & Fixes

| Issue                   | Cause                      | Solution                                                                 |
| ----------------------- | -------------------------- | ------------------------------------------------------------------------ |
| Form won't load         | API error                  | Check console, verify scorecard ID in URL                                |
| Totals not updating     | `onScoreChange` not called | Verify `(input)="onScoreChange(ci, si)"` on score input                  |
| Save disabled           | Form validation error      | Fill all required fields (title, prompt, score)                          |
| Scores saved as strings | Forgot Number() coercion   | Check `serializeFormToPayload()` has Number(detail.score)                |
| Accordion won't open    | Wrong template syntax      | Use `#sectionItem="cdkAccordionItem"` + `(click)="sectionItem.toggle()"` |

---

## 📖 Documentation

**Full Guide**: `EDITSCORECARD_IMPLEMENTATION_GUIDE.md`

Contains:

- Complete architecture explanation
- All code snippets with comments
- Template markup reference
- CSS breakdown
- Testing procedures
- Troubleshooting guide

---

## 🎓 Learning Points

1. **Reactive Forms** with FormBuilder, FormGroup, FormArray
2. **Nested Form Arrays** for complex hierarchies
3. **Form Validation** with Validators
4. **Disabled Controls** for read-only computed values
5. **Event Handling** with FormArray push/removeAt
6. **Live Updates** with patchValue and emitEvent:false
7. **API Integration** with Observable subscription
8. **Angular Accordion** (CDK) with template reference variables
9. **Template Forms** binding to FormControl/FormGroup
10. **Serialization** converting form data to API payload

---

## ✨ Best Practices Applied

✅ Type-safe TypeScript with proper typing
✅ Reactive approach with Signals and FormBuilders
✅ Proper error handling and user feedback
✅ Disabled save button when form invalid
✅ Loading states during API calls
✅ Comments and documentation
✅ Responsive mobile-friendly design
✅ Accessible form controls with labels
✅ No data loss on navigation
✅ Proper cleanup (unsubscribe in ngOnDestroy)

---

## 🔗 Related Pages

- **View Scorecard** (`viewscorecard`): Read-only accordion display
- **Add Scorecard** (`addscorecard`): Create new scorecard
- **Dashboard**: List all scorecards with links to view/edit

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Inspect network tab for API failures
3. Verify form structure matches API response
4. Check URL has scorecard ID (query param)
5. Refer to `EDITSCORECARD_IMPLEMENTATION_GUIDE.md` for detailed help
