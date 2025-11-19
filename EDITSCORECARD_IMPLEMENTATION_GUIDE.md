# Edit Scorecard Page - Complete Implementation Guide

## Overview
This document explains the complete implementation of the **editable accordion-based scorecard page** that mirrors the view-only scorecard. The key differences:
- **View Page** (`viewscorecard`): Read-only accordion display
- **Edit Page** (`editscorecard`): Fully editable accordion with add/remove controls and update API call

---

## Architecture Overview

### Data Flow
```
1. Load API (GET /edit with scorecard ID)
   ↓
2. Convert API response to Reactive Form (FormGroup + FormArrays)
   ↓
3. Render editable accordion UI
   ↓
4. User edits fields (live totals computed automatically)
   ↓
5. User clicks Save
   ↓
6. Serialize FormGroup → API payload
   ↓
7. Call Update API (POST /update)
   ↓
8. Show success/error message
```

### Form Structure (Nested)
```
form (FormGroup)
├── _id (string)
├── title (string)
├── description (string)
├── criterias (FormArray)
│   ├── [0] (FormGroup)
│   │   ├── _id
│   │   ├── type
│   │   ├── title
│   │   ├── method
│   │   ├── option
│   │   ├── totalScore
│   │   ├── criteriaTotal (disabled read-only)
│   │   └── scoringSections (FormArray)
│   │       ├── [0] (FormGroup)
│   │       │   ├── _id
│   │       │   ├── title
│   │       │   ├── sectionTotal (disabled read-only)
│   │       │   └── details (FormArray)
│   │       │       ├── [0] (FormGroup)
│   │       │       │   ├── _id
│   │       │       │   ├── uniqueId
│   │       │       │   ├── prompt (textarea)
│   │       │       │   ├── description
│   │       │       │   ├── score (number)
│   │       │       │   ├── fieldType
│   │       │       │   ├── isAutoFail
│   │       │       │   ├── scoringPercentage
│   │       │       │   └── definition (nested group)
│   │       │       └── [1], [2], ...
│   │       └── [1], [2], ...
│   └── [1], [2], ...
└── metaData (FormArray)
    ├── [0] (FormGroup)
    │   ├── _id
    │   ├── fieldType
    │   ├── title
    │   ├── prompt
    │   ├── isRequired
    │   └── options
    └── [1], [2], ...
```

---

## Implementation Steps

### Step 1: Reactive Forms Setup (editscorecard.ts)

#### 1.1 Import Required Modules
```typescript
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CdkAccordionModule } from '@angular/cdk/accordion';
```

#### 1.2 Update Component Decorator
```typescript
@Component({
  selector: 'app-editscorecard',
  imports: [
    JsonPipe, 
    CommonModule, 
    ReactiveFormsModule,  // ← Added
    CdkAccordionModule    // ← Added
  ],
  templateUrl: './editscorecard.html',
  styleUrl: './editscorecard.css',
})
```

#### 1.3 Add Form Properties
```typescript
export class Editscorecard implements OnInit, OnDestroy {
  form!: FormGroup;                    // Main form
  saving = false;                      // Track save state
  saveMessage = '';                    // Success/error message
  apiResponse: any = null;             // Store full API response

  constructor(
    private editScoreCard: editscorecard, 
    private fb: FormBuilder             // ← Inject FormBuilder
  ) { }
```

---

### Step 2: Create FormGroup Builder Functions

These helper functions convert API objects into FormGroups. Call them when building the form from API data.

#### 2.1 Create Detail FormGroup
```typescript
createDetailFormGroup(detail: any = {}): FormGroup {
  return this.fb.group({
    _id: [detail._id || null],
    uniqueId: [detail.uniqueId || null],
    prompt: [detail.prompt || '', Validators.required],
    description: [detail.description || ''],
    score: [detail.score ?? 0, [Validators.required, Validators.min(0)]],
    fieldType: [detail.fieldType || ''],
    isAutoFail: [detail.isAutoFail || false],
    scoringPercentage: [detail.scoringPercentage || 0],
    definition: this.fb.group({
      title: [detail.definition?.title || ''],
      description: [detail.definition?.description || ''],
      descriptions: [detail.definition?.descriptions || []],
    }),
  });
}
```

**Key Points:**
- `Validators.required` makes prompt mandatory
- `Validators.min(0)` ensures score is non-negative
- Disabled fields (like totals) are marked with `{ disabled: true }`
- Default values prevent null/undefined errors

#### 2.2 Create Section FormGroup
```typescript
createSectionFormGroup(section: any = {}): FormGroup {
  return this.fb.group({
    _id: [section._id || null],
    title: [section.title || '', Validators.required],
    details: this.fb.array(
      (section.details || []).map((d: any) => this.createDetailFormGroup(d))
    ),
    sectionTotal: [
      { value: this.computeDetailsTotal(section.details || []), disabled: true }
    ],
  });
}
```

**Key Points:**
- `details` is a FormArray of FormGroups
- `sectionTotal` is disabled (read-only) and auto-computed
- Empty arrays are handled with `|| []`

#### 2.3 Create Criteria FormGroup
```typescript
createCriteriaFormGroup(criteria: any = {}): FormGroup {
  return this.fb.group({
    _id: [criteria._id || null],
    type: [criteria.type || ''],
    title: [criteria.title || '', Validators.required],
    method: [criteria.method || ''],
    option: [criteria.option || ''],
    totalScore: [criteria.totalScore || 0],
    scoringSections: this.fb.array(
      (criteria.scoringSections || []).map((s: any) => this.createSectionFormGroup(s))
    ),
    criteriaTotal: [
      { value: this.computeCriteriaTotal(criteria), disabled: true }
    ],
  });
}
```

#### 2.4 Create MetaData FormGroup
```typescript
createMetaDataFormGroup(meta: any = {}): FormGroup {
  return this.fb.group({
    _id: [meta._id || null],
    fieldType: [meta.fieldType || 'text'],
    title: [meta.title || '', Validators.required],
    prompt: [meta.prompt || ''],
    isRequired: [meta.isRequired || false],
    isSecondLevel: [meta.isSecondLevel || false],
    options: [meta.options || []],
  });
}
```

---

### Step 3: Compute Totals Helper Functions

#### 3.1 Compute Details Total
```typescript
computeDetailsTotal(details: any[] = []): number {
  return (details || []).reduce((sum, d) => sum + Number(d.score || 0), 0);
}
```
**Explanation:** Sum all `score` values in the details array. Handles empty and null arrays.

#### 3.2 Compute Criteria Total
```typescript
computeCriteriaTotal(criteria: any = { scoringSections: [] }): number {
  return (criteria.scoringSections || []).reduce(
    (sum: number, s: any) => sum + this.computeDetailsTotal(s.details || []),
    0
  );
}
```
**Explanation:** Sum of all section totals. Each section total = sum of its detail scores.

---

### Step 4: Template Helper Getters

These make template loops easier and avoid casting FormArray every time.

```typescript
get criteriaControls() {
  return (this.form?.get('criterias') as FormArray)?.controls || [];
}

sectionControls(criteriaIndex: number) {
  const criteria = (this.form?.get('criterias') as FormArray)?.at(criteriaIndex);
  return (criteria?.get('scoringSections') as FormArray)?.controls || [];
}

detailControls(criteriaIndex: number, sectionIndex: number) {
  const criteria = (this.form?.get('criterias') as FormArray)?.at(criteriaIndex);
  const section = (criteria?.get('scoringSections') as FormArray)?.at(sectionIndex);
  return (section?.get('details') as FormArray)?.controls || [];
}

get metaControls() {
  return (this.form?.get('metaData') as FormArray)?.controls || [];
}
```

**Usage in Template:**
```html
<div *ngFor="let criteria of criteriaControls; let ci = index" [formGroupName]="ci">
  <!-- criteria content -->
</div>
```

---

### Step 5: Load API Data and Build Form (ngOnInit)

```typescript
ngOnInit(): void {
  this.routeSubscription = this.route.queryParams.subscribe((params) => {
    this.detailId = params['id'];
  });

  const editPayLoad = { id: this.detailId };
  this.editScoreCard.EditScoreCard(editPayLoad, this.authkey).subscribe({
    next: (response: any): void => {
      this.apiResponse = response.data;
      
      // BUILD FORM FROM API DATA
      this.form = this.fb.group({
        _id: [response.data._id || null],
        title: [response.data.title || '', Validators.required],
        description: [response.data.description || ''],
        criterias: this.fb.array(
          (response.data.criterias || []).map((c: any) => this.createCriteriaFormGroup(c))
        ),
        metaData: this.fb.array(
          (response.data.metaData || []).map((m: any) => this.createMetaDataFormGroup(m))
        ),
      });
    },
    error: (error: any) => {
      console.error('Error loading scorecard:', error);
      this.saveMessage = 'Error loading scorecard';
    },
  });
}
```

**Key Points:**
- Load API data synchronously when component initializes
- Use the helper functions to convert array items into FormGroups
- Handle empty arrays with `||` operator
- Set `saveMessage` on error for UI feedback

---

### Step 6: Add/Remove Actions

#### 6.1 Add Criteria
```typescript
addCriteria(): void {
  const criterias = this.form.get('criterias') as FormArray;
  criterias.push(this.createCriteriaFormGroup());
}
```

#### 6.2 Remove Criteria
```typescript
removeCriteria(index: number): void {
  const criterias = this.form.get('criterias') as FormArray;
  criterias.removeAt(index);
}
```

#### 6.3 Add Section
```typescript
addSection(criteriaIndex: number): void {
  const criteria = (this.form.get('criterias') as FormArray).at(criteriaIndex);
  const sections = criteria?.get('scoringSections') as FormArray;
  sections.push(this.createSectionFormGroup());
}
```

#### 6.4 Remove Section
```typescript
removeSection(criteriaIndex: number, sectionIndex: number): void {
  const criteria = (this.form.get('criterias') as FormArray).at(criteriaIndex);
  const sections = criteria?.get('scoringSections') as FormArray;
  sections.removeAt(sectionIndex);
}
```

#### 6.5 Add Detail
```typescript
addDetail(criteriaIndex: number, sectionIndex: number): void {
  const criteria = (this.form.get('criterias') as FormArray).at(criteriaIndex);
  const section = (criteria?.get('scoringSections') as FormArray).at(sectionIndex);
  const details = section?.get('details') as FormArray;
  details.push(this.createDetailFormGroup());
}
```

#### 6.6 Remove Detail
```typescript
removeDetail(criteriaIndex: number, sectionIndex: number, detailIndex: number): void {
  const criteria = (this.form.get('criterias') as FormArray).at(criteriaIndex);
  const section = (criteria?.get('scoringSections') as FormArray).at(sectionIndex);
  const details = section?.get('details') as FormArray;
  details.removeAt(detailIndex);
}
```

#### 6.7 Add/Remove Meta
```typescript
addMeta(): void {
  const meta = this.form.get('metaData') as FormArray;
  meta.push(this.createMetaDataFormGroup());
}

removeMeta(index: number): void {
  const meta = this.form.get('metaData') as FormArray;
  meta.removeAt(index);
}
```

---

### Step 7: Live Totals Recalculation

#### 7.1 Score Change Handler
```typescript
onScoreChange(criteriaIndex: number, sectionIndex: number): void {
  const criteria = (this.form.get('criterias') as FormArray).at(criteriaIndex);
  const section = (criteria?.get('scoringSections') as FormArray).at(sectionIndex);
  const details = section?.get('details') as FormArray;

  // Recalculate section total
  const sectionTotal = this.computeDetailsTotal(details.value);
  section?.get('sectionTotal')?.patchValue(sectionTotal, { emitEvent: false });

  // Recalculate criteria total
  const sections = (criteria?.get('scoringSections') as FormArray).value;
  const criteriaTotal = this.computeCriteriaTotal({
    scoringSections: sections,
  });
  criteria?.get('criteriaTotal')?.patchValue(criteriaTotal, { emitEvent: false });
}
```

**Key Points:**
- Called via `(input)="onScoreChange(ci, si)"` on score input
- `emitEvent: false` prevents cascading value change events
- `patchValue` updates disabled controls without triggering validation
- Section total updates immediately when any detail score changes
- Criteria total updates after section total recalculates

---

### Step 8: Serialize Form to API Payload

```typescript
serializeFormToPayload(): any {
  const formValue = this.form.value;

  return {
    _id: formValue._id,
    id: formValue._id,
    title: formValue.title,
    description: formValue.description,
    criterias: formValue.criterias.map((criteria: any) => ({
      _id: criteria._id,
      id: criteria._id,
      type: criteria.type,
      title: criteria.title,
      method: criteria.method,
      option: criteria.option,
      totalScore: criteria.totalScore,
      scoringSections: criteria.scoringSections.map((section: any) => ({
        _id: section._id,
        id: section._id,
        title: section.title,
        details: section.details.map((detail: any) => ({
          _id: detail._id,
          id: detail._id,
          uniqueId: detail.uniqueId,
          prompt: detail.prompt,
          description: detail.description,
          score: Number(detail.score),  // ← Coerce to number
          fieldType: detail.fieldType,
          isAutoFail: detail.isAutoFail,
          scoringPercentage: Number(detail.scoringPercentage),
          definition: detail.definition,
        })),
      })),
    })),
    metaData: formValue.metaData.map((meta: any) => ({
      _id: meta._id,
      id: meta._id,
      fieldType: meta.fieldType,
      title: meta.title,
      prompt: meta.prompt,
      isRequired: meta.isRequired,
      isSecondLevel: meta.isSecondLevel,
      options: meta.options,
    })),
  };
}
```

**Key Points:**
- Disabled fields (totals) are **not** in `form.value`, so we don't include them
- `score` and `scoringPercentage` are coerced to `Number()` (important!)
- Payload structure mirrors the API response format
- Both `_id` (MongoDB) and `id` (API) are included for compatibility

---

### Step 9: Save / Update Function

```typescript
save(): void {
  if (this.form.invalid) {
    this.saveMessage = 'Please fill all required fields';
    return;
  }

  this.saving = true;
  const payload = this.serializeFormToPayload();

  console.log('Sending update payload:', payload);

  this.editScoreCard.UpdateScoreCard(payload, this.authkey).subscribe({
    next: (response: any) => {
      this.saving = false;
      this.saveMessage = 'Scorecard updated successfully!';
      console.log('Update successful:', response);
      setTimeout(() => (this.saveMessage = ''), 3000);
    },
    error: (error: any) => {
      this.saving = false;
      this.saveMessage = 'Error updating scorecard: ' + (error.message || '');
      console.error('Update error:', error);
    },
  });
}
```

**Workflow:**
1. Check if form is valid (all required fields filled)
2. Show "Please fill required fields" if invalid
3. Set `saving = true` to disable button and show loading state
4. Serialize form to payload
5. Call `UpdateScoreCard()` from service
6. On success: show message, auto-dismiss after 3 seconds
7. On error: show error message

---

### Step 10: Add UpdateScoreCard Method to Service

In `src/services/editscorecard.ts`:

```typescript
UpdateScoreCard(payload: any, authToken: string): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${authToken}`,
  });
  return this.http.post(this.UPDATEAPIURL, payload, { headers });
}
```

**Key Points:**
- Uses POST to the `UPDATEAPIURL`
- Includes Authorization header with Bearer token
- Returns Observable for subscription in component

---

## Template Implementation (editscorecard.html)

### 11.1 Form Container
```html
<div class="edit-scorecard-container" *ngIf="form">
  <div class="header">
    <h1>Edit Scorecard</h1>
    <p *ngIf="saveMessage" [ngClass]="{
      'success': saveMessage.includes('successfully'),
      'error': saveMessage.includes('Error')
    }">
      {{ saveMessage }}
    </p>
  </div>

  <form [formGroup]="form">
    <!-- Content goes here -->
  </form>
</div>
```

### 11.2 MetaData Accordion Section
```html
<div class="meta-section" *ngIf="metaControls.length > 0">
  <h3>Meta Data</h3>
  <cdk-accordion class="meta-accordion">
    <cdk-accordion-item 
      *ngFor="let m of metaControls; let mi = index" 
      [formGroupName]="mi" 
      [expanded]="false">
      
      <cdk-accordion-item-header class="meta-header">
        <span class="meta-title">{{ m.get('title')?.value || 'Untitled Meta' }}</span>
        <button type="button" class="btn-icon" (click)="removeMeta(mi); $event.stopPropagation()">
          ×
        </button>
      </cdk-accordion-item-header>

      <div class="meta-body">
        <div class="form-group">
          <label>Title:</label>
          <input type="text" formControlName="title" />
        </div>
        <!-- Other fields -->
      </div>
    </cdk-accordion-item>
  </cdk-accordion>
  <button type="button" class="btn-add" (click)="addMeta()">
    + Add Meta Data
  </button>
</div>
```

### 11.3 Criteria Accordion (Level 1)
```html
<div class="scoring-section">
  <h3>Scoring</h3>
  <cdk-accordion class="example-accordion" formArrayName="criterias">
    <cdk-accordion-item 
      *ngFor="let criteria of criteriaControls; let ci = index"
      [formGroupName]="ci"
      [expanded]="true">
      
      <cdk-accordion-item-header class="criteria-header">
        <div class="header-content">
          <input 
            type="text" 
            formControlName="title" 
            placeholder="Criteria Title" 
            (click)="$event.stopPropagation()"
          />
          <span class="criteria-total">Total: {{ criteria.get('criteriaTotal')?.value }}</span>
        </div>
        <button type="button" class="btn-icon" (click)="removeCriteria(ci); $event.stopPropagation()">
          ×
        </button>
      </cdk-accordion-item-header>

      <div class="criteria-body">
        <!-- Nested sections go here -->
      </div>
    </cdk-accordion-item>
  </cdk-accordion>
  <button type="button" class="btn-add-criteria" (click)="addCriteria()">
    + Add Criteria
  </button>
</div>
```

### 11.4 Section Accordion (Level 2 - Nested)
```html
<div class="nested-accordion-container" formArrayName="scoringSections">
  <h4>Scoring Sections</h4>
  <cdk-accordion class="nested-accordion">
    <cdk-accordion-item 
      *ngFor="let section of sectionControls(ci); let si = index"
      [formGroupName]="si"
      [expanded]="true">
      
      <cdk-accordion-item-header class="section-header">
        <div class="header-content">
          <input 
            type="text" 
            formControlName="title" 
            placeholder="Section Title" 
            (click)="$event.stopPropagation()"
          />
          <span class="section-total">Section Total: {{ section.get('sectionTotal')?.value }}</span>
        </div>
        <button type="button" class="btn-icon" (click)="removeSection(ci, si); $event.stopPropagation()">
          ×
        </button>
      </cdk-accordion-item-header>

      <div class="section-body">
        <!-- Details go here -->
      </div>
    </cdk-accordion-item>
  </cdk-accordion>
  <button type="button" class="btn-add-section" (click)="addSection(ci)">
    + Add Section
  </button>
</div>
```

### 11.5 Details (Level 3 - Simple List)
```html
<div class="details-container" formArrayName="details">
  <h5>Details</h5>
  <div 
    *ngFor="let detail of detailControls(ci, si); let di = index"
    [formGroupName]="di"
    class="detail-item">
    
    <div class="detail-header">
      <textarea 
        formControlName="prompt" 
        placeholder="Detail Prompt"
      ></textarea>
      <input 
        type="number" 
        formControlName="score" 
        placeholder="Score"
        (input)="onScoreChange(ci, si)"
      />
      <span class="scoring-percentage">{{ detail.get('scoringPercentage')?.value }}%</span>
      <button type="button" class="btn-icon" (click)="removeDetail(ci, si, di)">
        ×
      </button>
    </div>
  </div>

  <button type="button" class="btn-add-detail" (click)="addDetail(ci, si)">
    + Add Detail
  </button>
</div>
```

### 11.6 Save Button
```html
<div class="action-buttons">
  <button 
    type="button" 
    class="btn-save" 
    (click)="save()"
    [disabled]="form.invalid || saving">
    {{ saving ? 'Saving...' : 'Save Changes' }}
  </button>
</div>
```

---

## Styling (editscorecard.css)

The CSS file is comprehensive and includes:
- **Header**: Title and message display
- **Meta Section**: Collapsed by default, editable fields
- **Scoring Section**: Criteria with gradient background
- **Nested Accordions**: Visual hierarchy with indentation
- **Details Container**: Clean list of editable items
- **Form Controls**: Consistent styling across inputs, textareas
- **Buttons**: Add/remove with hover effects, save button with loading state
- **Responsive**: Mobile-friendly layouts

Key classes:
- `.edit-scorecard-container`: Main wrapper
- `.criteria-header`: Gradient purple background
- `.section-header`: Slightly lighter purple
- `.detail-item`: White card with border
- `.btn-save`: Prominent save button
- `.success` / `.error`: Message styling

---

## Testing Checklist

### Manual Testing (in Browser)
- [ ] Navigate to edit page with scorecard ID
- [ ] Page loads and form populates with API data
- [ ] Edit a criteria title → form recognizes change
- [ ] Edit a detail score → section total updates automatically
- [ ] Add a new detail → form array updates in UI
- [ ] Remove a detail → form array updates, totals recalculate
- [ ] Edit meta data → form reflects changes
- [ ] Click Save → network tab shows POST to update endpoint
- [ ] Verify payload structure matches API contract
- [ ] Success message displays for 3 seconds
- [ ] Try saving with empty required field → error message shows
- [ ] Save button disabled while saving

### Network Inspection (DevTools)
1. Open Network tab
2. Click Save
3. Inspect POST request to `/api/auth/scorecards/update`
4. Verify:
   - Headers include Authorization bearer token
   - Payload has correct nested structure
   - All score values are numbers (not strings)
   - No undefined fields
   - MetaData array is present

### Console Checks
- No TypeScript errors
- `console.log('Sending update payload:', payload)` shows correct structure
- `console.log('Update successful:', response)` shows server response

---

## Common Issues & Solutions

### Issue 1: Form not loading
**Cause:** API call fails or FormBuilder not injected
**Solution:** Check console for API errors, verify FormBuilder is in constructor

### Issue 2: Totals not updating
**Cause:** `onScoreChange` not called or details not bound
**Solution:** Ensure `(input)="onScoreChange(ci, si)"` is on score input

### Issue 3: Save button always disabled
**Cause:** Form validation errors (required fields empty)
**Solution:** Make sure all fields with `Validators.required` are filled

### Issue 4: Deleted items still appear after save
**Cause:** `removeAt()` only removes from form, server still has old data
**Solution:** Ensure server update API replaces entire arrays (or sends delete markers)

### Issue 5: Scores saved as strings instead of numbers
**Cause:** Forgot `Number()` coercion in serializer
**Solution:** Always wrap scores: `score: Number(detail.score)`

---

## Summary of Changes

### Files Modified
1. **editscorecard.ts**
   - Added Reactive Forms imports
   - Injected FormBuilder
   - Created form builder functions (6 functions)
   - Created total computation helpers (2 functions)
   - Created template getters (4 getters)
   - Implemented ngOnInit to build form from API
   - Implemented add/remove methods (7 methods)
   - Implemented live totals (`onScoreChange`)
   - Implemented serializer (`serializeFormToPayload`)
   - Implemented save (`save()`)

2. **editscorecard.html**
   - Completely rewritten with accordion structure
   - Meta data section with collapse
   - 3-level nested accordions (criteria → sections → details)
   - Form controls for all editable fields
   - Add/remove buttons at each level
   - Save button with loading state
   - Success/error message display

3. **editscorecard.css**
   - Comprehensive styling (350+ lines)
   - Accordion styling with gradients
   - Form control styling
   - Button styling with hover effects
   - Responsive design

4. **editscorecard.ts** (Service)
   - Added `UpdateScoreCard` method

---

## Next Steps

After implementation:
1. Test in browser with actual scorecard ID
2. Verify network requests match API contract
3. Optionally add confirmation dialog before delete
4. Optionally add keyboard shortcuts (Ctrl+S to save)
5. Optionally implement auto-save feature
6. Add unit tests for serializer and total computation

---

## File Locations

- Component: `src/app/pages/editscorecard/editscorecard.ts`
- Template: `src/app/pages/editscorecard/editscorecard.html`
- Styles: `src/app/pages/editscorecard/editscorecard.css`
- Service: `src/services/editscorecard.ts`

---

## Key Takeaways

✅ **Reactive Forms** provide automatic two-way binding with the form model
✅ **FormArrays** enable dynamic list management (add/remove items)
✅ **Disabled controls** prevent user editing while still allowing value display
✅ **Live computation** (valueChanges) creates responsive UX
✅ **Serialization** transforms form structure back to API shape
✅ **Nested accordions** provide visual hierarchy and organization
✅ **Template helpers** reduce boilerplate and improve readability

