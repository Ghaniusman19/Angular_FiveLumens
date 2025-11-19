import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { editscorecard } from '../../../services/editscorecard';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
@Component({
  selector: 'app-editscorecard',
  imports: [CommonModule, ReactiveFormsModule, CdkAccordionModule, CdkDropList, CdkDrag],
  templateUrl: './editscorecard.html',
  // template: `<p>Detailed ID is {{ detailId }}</p>`,
  styleUrl: './editscorecard.css',
})
export class Editscorecard implements OnInit, OnDestroy {
  public detailId: string = '';
  private routeSubscription: Subscription | undefined;
  form!: FormGroup;
  saving = false;
  saveMessage = '';
  apiResponse: any = null;

  // ===== DRAG & DROP HANDLERS =====
  dropSection(event: CdkDragDrop<any[]>, criteriaIndex: number): void {
    const criteria = (this.form.get('criterias') as FormArray).at(criteriaIndex);
    const sections = criteria?.get('scoringSections') as FormArray;
    if (sections && event.previousIndex !== event.currentIndex) {
      moveItemInArray(sections.controls, event.previousIndex, event.currentIndex);
    }
  }
  constructor(private editScoreCard: editscorecard, private fb: FormBuilder) {
    console.log('edit score Card loaded !');
  }
  route = inject(ActivatedRoute);
  http = inject(HttpClient);
  authorization = localStorage.getItem('authToken');
  authkey: any = this.authorization;
  router = inject(Router);
  public editSCData = signal<any[]>([]);

  // ===== HELPER FUNCTIONS TO BUILD FORM GROUPS =====

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

  createSectionFormGroup(section: any = {}): FormGroup {
    return this.fb.group({
      _id: [section._id || null],
      title: [section.title || '', Validators.required],
      details: this.fb.array(
        (section.details || []).map((d: any) => this.createDetailFormGroup(d))
      ),
      sectionTotal: [{ value: this.computeDetailsTotal(section.details || []), disabled: true }],
    });
  }

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
      criteriaTotal: [{ value: this.computeCriteriaTotal(criteria), disabled: true }],
    });
  }

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

  // ===== COMPUTE TOTAL HELPERS =====

  computeDetailsTotal(details: any[] = []): number {
    return (details || []).reduce((sum, d) => sum + Number(d.score || 0), 0);
  }

  computeCriteriaTotal(criteria: any = { scoringSections: [] }): number {
    return (criteria.scoringSections || []).reduce(
      (sum: number, s: any) => sum + this.computeDetailsTotal(s.details || []),
      0
    );
  }

  // ===== TEMPLATE HELPER GETTERS =====

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

  ngOnInit(): void {
    // Option 1: Using paramMap (Recommended for observable-based access)
    this.routeSubscription = this.route.queryParams.subscribe((params) => {
      this.detailId = params['id'];
      console.log(this.detailId, 'This is our detailed id from params');
    });
    const editPayLoad = { id: this.detailId };
    this.editScoreCard.EditScoreCard(editPayLoad, this.authkey).subscribe({
      next: (response: any): void => {
        this.apiResponse = response.data;
        this.editSCData.set(response.data.criterias);
        console.log('Full API Response:', response.data);

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

  // ===== ADD/REMOVE ACTIONS =====

  addCriteria(): void {
    const criterias = this.form.get('criterias') as FormArray;
    criterias.push(this.createCriteriaFormGroup());
  }

  removeCriteria(index: number): void {
    const criterias = this.form.get('criterias') as FormArray;
    criterias.removeAt(index);
  }

  addSection(criteriaIndex: number): void {
    const criteria = (this.form.get('criterias') as FormArray).at(criteriaIndex);
    const sections = criteria?.get('scoringSections') as FormArray;
    sections.push(this.createSectionFormGroup());
  }

  removeSection(criteriaIndex: number, sectionIndex: number): void {
    const criteria = (this.form.get('criterias') as FormArray).at(criteriaIndex);
    const sections = criteria?.get('scoringSections') as FormArray;
    sections.removeAt(sectionIndex);
  }

  addDetail(criteriaIndex: number, sectionIndex: number): void {
    const criteria = (this.form.get('criterias') as FormArray).at(criteriaIndex);
    const section = (criteria?.get('scoringSections') as FormArray).at(sectionIndex);
    const details = section?.get('details') as FormArray;
    details.push(this.createDetailFormGroup());
  }

  removeDetail(criteriaIndex: number, sectionIndex: number, detailIndex: number): void {
    const criteria = (this.form.get('criterias') as FormArray).at(criteriaIndex);
    const section = (criteria?.get('scoringSections') as FormArray).at(sectionIndex);
    const details = section?.get('details') as FormArray;
    details.removeAt(detailIndex);
  }

  addMeta(): void {
    const meta = this.form.get('metaData') as FormArray;
    meta.push(this.createMetaDataFormGroup());
  }

  removeMeta(index: number): void {
    const meta = this.form.get('metaData') as FormArray;
    meta.removeAt(index);
  }

  // ===== RECALCULATE TOTALS WHEN SCORE CHANGES =====

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

  // ===== SERIALIZE FORM TO API PAYLOAD =====

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
            score: Number(detail.score),
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
        isRequired: Boolean(meta.isRequired),
        isSecondLevel: Boolean(meta.isSecondLevel),
        options: meta.options || [],
      })),
    };
  }

  // ===== SAVE / UPDATE =====

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

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks if using observable-based access
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
}
