import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { editscorecard } from '../../../services/editscorecard';
import { CommonModule } from '@angular/common';

interface ScorecardData {
  _id: string;
  title: string;
  description: string;
  coachingForm: string;
  isPublished: boolean;
  isActive: boolean;
  groups: string[];
  isAllGroups: boolean;
  visibleToManagers: boolean;
  coachingPurposeOnly: boolean;
  criterias: any[];
  metaData: any[];
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-aieditscorecard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './aieditscorecard.html',
  styleUrl: './aieditscorecard.css',
})
export class AIeditscorecard implements OnInit, OnDestroy {
  public ID: string = '';
  private routeSubscription: Subscription | undefined;
  route = inject(ActivatedRoute);
  router = inject(Router);
  http = inject(HttpClient);
  fb = inject(FormBuilder);
  authorization = localStorage.getItem('authToken');
  authkey: any = this.authorization;
  public isMetaDropdownOpen = signal(false);
  public isScoringDropdownOpen = signal(false);
  scorecardForm!: FormGroup;
  public isMetaDataModalOpened = signal<boolean>(false);
  public metaDataScoreCard: FormGroup;
  public AddSectionScorecard: FormGroup;
  public AddCriteriaScorecard: FormGroup;
  public editingMetaDataIndex: number | null = null;
  public successModalOpened = signal<boolean>(false);
  public saveErrorMessage = signal<string | null>(null);
  public isSectionModalOpen = signal(false);
  public selectedCriteriaIndex: number | null = null;
  // currentCriteriaIndex: number | null = null;
  public currentScoringIndex: number | null = null;
  public currentcriteriatobeEdit: number | null = null;
  public isEditScoringMode = false;
  public isEditCriteriaMode = false;
  public scoringCriteriaModalOpen = signal(false);
  // isLoading = false;

  constructor(private editsc: editscorecard) {
    console.log('AI scorecard page Called!');
    this.metaDataScoreCard = new FormGroup({
      id: new FormControl(Math.random()),
      description: new FormControl('', Validators.required),
    });
    this.AddSectionScorecard = new FormGroup({
      id: new FormControl(Date.now()),
      title: new FormControl('', Validators.required),
    });
    this.AddCriteriaScorecard = new FormGroup({
      id: new FormControl(Date.now()),
      description: new FormControl('', Validators.required),
      isAutoFail: new FormControl('', Validators.required),
    });
  }
  public SectionModalOpen(index: number): void {
    this.selectedCriteriaIndex = index;
    this.isSectionModalOpen.update((mval) => !mval);
    this.isScoringDropdownOpen.set(false);
  }
  public closeSectionModal(): void {
    this.isSectionModalOpen.set(false);
  }
  public openMetaDropdown(): void {
    this.isMetaDropdownOpen.set(!this.isMetaDropdownOpen());
  }
  public closeMetaDropdown(): void {
    this.isMetaDropdownOpen.set(false);
  }
  public openScoringDropdown(): void {
    this.isScoringDropdownOpen.set(!this.isScoringDropdownOpen());
  }
  public closeScoringDropdown(): void {
    this.isScoringDropdownOpen.set(false);
  }
  closeMessage() {
    this.saveErrorMessage.set(null);
  }
  public DeleteMetaData(i: number): void {
    console.log(i, 'meta data section number');
    this.metaDataArray.removeAt(i);
    console.log(this.metaDataArray.value, 'Updated meta data array');
  }
  public EditMetaData(i: number): void {
    console.log(i, 'meta data section number to edit');
    // this.editMetaDataId = i;
    const metaDataControl = this.metaDataArray.at(i) as FormGroup;
    this.metaDataScoreCard.patchValue({
      description: metaDataControl.get('title')?.value,
    });
    this.editingMetaDataIndex = i;
    this.OpenMetaDataModal();
  }
  ngOnInit(): void {
    this.initializeForm();
    this.routeSubscription = this.route.queryParams.subscribe((params) => {
      this.ID = params['id'];
      console.log(this.ID, 'This is our detailed id from params');
      this.loadScorecardData();
    });
  }
  initializeForm(): void {
    this.scorecardForm = this.fb.group({
      _id: [''],
      title: ['', Validators.required],
      description: [''],
      coachingForm: [''],
      isPublished: [false],
      isActive: [false],
      visibleToManagers: [false],
      coachingPurposeOnly: [false],
      isAllGroups: [false],
      groups: this.fb.array([]),
      metaData: this.fb.array([]),
      criterias: this.fb.array([]),
      scoringSections: this.fb.array([]),
    });
  }

  loadScorecardData(): void {
    // this.isLoading = true;
    const AIPayLoad = { id: this.ID };
    this.editsc.EditScoreCard(AIPayLoad, this.authkey).subscribe({
      next: (response: any): void => {
        console.log('Full API Response:', response.data);
        this.populateForm(response.data);
        // this.isLoading = false;
      },
      error: (error: any) => {
        console.log(error);
        // this.isLoading = false;
      },
    });
  }
  populateForm(data: ScorecardData): void {
    // Populate basic fields
    this.scorecardForm.patchValue({
      _id: data._id,
      title: data.title,
      description: data.description,
      coachingForm: data.coachingForm,
      isPublished: data.isPublished,
      isActive: data.isActive,
      visibleToManagers: data.visibleToManagers,
      coachingPurposeOnly: data.coachingPurposeOnly,
      isAllGroups: data.isAllGroups,
    });

    // Populate groups
    const groupsArray = this.scorecardForm.get('groups') as FormArray;
    groupsArray.clear();
    data.groups?.forEach((group) => {
      groupsArray.push(this.fb.control(group));
    });

    // Populate metaData
    const metaDataArray = this.scorecardForm.get('metaData') as FormArray;
    metaDataArray.clear();
    data.metaData?.forEach((meta) => {
      metaDataArray.push(this.createMetaDataGroup(meta));
    });

    // Populate criterias
    const criteriasArray = this.scorecardForm.get('criterias') as FormArray;
    criteriasArray.clear();
    data.criterias?.forEach((criteria) => {
      criteriasArray.push(this.createCriteriaGroup(criteria));
    });
  }
  createMetaDataGroup(meta: any): FormGroup {
    return this.fb.group({
      _id: [meta._id],
      fieldType: [meta.fieldType],
      title: [meta.title],
      isRequired: [meta.isRequired],
      isSecondLevel: [meta.isSecondLevel],
      options: [meta.options],
      prompt: [meta.prompt],
      secondLevel: [meta.secondLevel],
    });
  }
  createCriteriaGroup(criteria: any): FormGroup {
    const criteriasGroup = this.fb.group({
      _id: [criteria._id],
      type: [criteria.type],
      title: [criteria.title],
      method: [criteria.method],
      option: [criteria.option],
      totalScore: [criteria.totalScore],
      scoringSections: this.fb.array([]),
    });

    const sectionsArray = criteriasGroup.get('scoringSections') as FormArray;
    criteria.scoringSections?.forEach((section: any) => {
      sectionsArray.push(this.createSectionGroup(section));
    });

    return criteriasGroup;
  }

  createSectionGroup(section: any): FormGroup {
    const sectionGroup = this.fb.group({
      _id: [section._id],
      title: [section.title],
      details: this.fb.array([]),
    });

    const detailsArray = sectionGroup.get('details') as FormArray;
    section.details?.forEach((detail: any) => {
      detailsArray.push(this.createDetailGroup(detail));
    });

    return sectionGroup;
  }
  createDetailGroup(detail: any): FormGroup {
    return this.fb.group({
      _id: [detail._id],
      uniqueId: [detail.uniqueId],
      description: [detail.description],
      score: [detail.score],
      scoringPercentage: [detail.scoringPercentage],
      prompt: [detail.prompt],
      isAutoFail: [detail.isAutoFail],
      dependencies: [detail.dependencies],
      definition: this.fb.group({
        title: [detail.definition?.title || ''],
        description: [detail.definition?.description || ''],
        descriptions: [detail.definition?.descriptions || []],
      }),
    });
  }
  // Getters for FormArrays
  get metaDataArray(): FormArray {
    return this.scorecardForm.get('metaData') as FormArray;
  }

  get criteriasArray(): FormArray {
    return this.scorecardForm.get('criterias') as FormArray;
  }

  public OpenMetaDataModal(): void {
    this.isMetaDataModalOpened.update((cVal) => !cVal);
    console.log('opened meta data modal!');
    this.isMetaDropdownOpen.set(false);
  }
  public closeMetaDataModal(): void {
    this.isMetaDataModalOpened.update((cVal) => !cVal);
    // this.editMetaDataId = null;
  }

  public SubmitmetaData(): void {
    if (this.metaDataScoreCard.invalid) return;
    const descriptionValue = this.metaDataScoreCard.get('description')?.value;
    const isRequiredValue = this.metaDataScoreCard.get('isRequired')?.value || false;
    // const item = this.submittedMetaData.find((m) => m.id === id);

    if (this.editingMetaDataIndex !== null) {
      // Update existing metadata
      const metaDataControl = this.metaDataArray.at(this.editingMetaDataIndex) as FormGroup;
      metaDataControl.patchValue({
        title: descriptionValue,
        isRequired: isRequiredValue,
      });

      this.editingMetaDataIndex = null; // reset after editing
    } else {
      // Add new metadata
      const newMetaData = new FormGroup({
        id: new FormControl(Date.now()),
        title: new FormControl(descriptionValue),
        isRequired: new FormControl(isRequiredValue),
        fieldType: new FormControl('largeText'),
        isSecondLevel: new FormControl(false),
        prompt: new FormControl(''),
      });
      this.metaDataArray.push(newMetaData);
    }
    // Reset form and close modal
    this.metaDataScoreCard.reset();
    this.closeMetaDataModal();
    console.log(this.metaDataArray.value);
  }

  public SubmitAddSectionData(): void {
    if (this.selectedCriteriaIndex === null) return;

    const scoringArray = this.getScoringSection(this.selectedCriteriaIndex);
    const titleVal = this.AddSectionScorecard.get('title')?.value;

    if (this.isEditScoringMode && this.currentScoringIndex !== null) {
      // Edit existing section
      const sectionToEdit = scoringArray.at(this.currentScoringIndex) as FormGroup;
      sectionToEdit.patchValue({ title: titleVal });
    } else {
      // Add new section
      const newSection = new FormGroup({
        id: new FormControl(Date.now()),
        title: new FormControl(titleVal),
        details: new FormArray([]),
      });
      scoringArray.push(newSection);
      console.log(scoringArray.value);
    }
    // Reset modal and state
    this.AddSectionScorecard.reset();
    this.isSectionModalOpen.set(false);
    this.isEditScoringMode = false;
    this.currentScoringIndex = null;
  }

  public SubmitAddCriteriaData(): void {
    if (this.selectedCriteriaIndex === null || this.currentScoringIndex === null) {
      console.warn('Indexes missing ===> Cannot add criteria.');
      return;
    }

    const scoreDetArr = this.getDetails(this.selectedCriteriaIndex, this.currentScoringIndex);
    const descVal = this.AddCriteriaScorecard.get('description')?.value;

    if (this.isEditCriteriaMode && this.currentcriteriatobeEdit !== null) {
      // Edit criteria detail
      const detailToEdit = scoreDetArr.at(this.currentcriteriatobeEdit) as FormGroup;
      detailToEdit.patchValue({
        description: descVal,
      });
    } else {
      // ADD new criteria detail
      const newDetail = new FormGroup({
        id: new FormControl(Date.now()),
        description: new FormControl(descVal),
        details: new FormControl([]),
        score: new FormControl(),
        scoringPercentage: new FormControl(''),
        isAutoFail: new FormControl(),
        prompt: new FormControl(''),
      });

      scoreDetArr.push(newDetail);
      this.scoringCriteriaModalOpen.set(false);

      console.log('Criteria Added:', scoreDetArr.value);
    }

    // Cleanup
    this.AddCriteriaScorecard.reset();
    this.isEditCriteriaMode = false;
    this.currentcriteriatobeEdit = null;
  }

  EditCriteria(ci: number, si: number, di: number): void {
    console.log('ID OF EDIT CRITERIA IS  ', ci, si, di);
    this.selectedCriteriaIndex = ci;
    this.currentScoringIndex = si;
    this.currentcriteriatobeEdit = di;
    this.isEditCriteriaMode = true;
    const scoreDetArr = this.getDetails(ci, si);
    const criteriaToEdit = scoreDetArr.at(di) as FormGroup;
    this.AddCriteriaScorecard.patchValue({
      description: criteriaToEdit.get('description')?.value,
      isAutoFail: criteriaToEdit.get('isAutoFail')?.value,
    });
    this.scoringCriteriaModalOpen.set(true);
  }
  getScoringSection(criteriaIndex: number): FormArray {
    return this.criteriasArray.at(criteriaIndex).get('scoringSections') as FormArray;
  }

  getDetails(criteriaIndex: any, sectionIndex: any): FormArray {
    return this.getScoringSection(criteriaIndex).at(sectionIndex).get('details') as FormArray;
  }

  buildFormDataManually(data: any): FormData {
    const fd = new FormData();
    // Simple fields
    fd.append('id', data._id);
    fd.append('title', data.title);
    fd.append('description', data.description);
    fd.append('coachingForm', data.coachingForm);
    fd.append('isPublished', data.isPublished.toString());
    fd.append('isActive', data.isActive.toString());
    fd.append('visibleToManagers', data.visibleToManagers.toString());
    fd.append('coachingPurposeOnly', data.coachingPurposeOnly.toString());
    fd.append('isAllGroups', data.isAllGroups.toString());

    // Groups array
    data.groups?.forEach((group: string, index: number) => {
      fd.append(`groups[${index}]`, group);
    });

    // MetaData array
    data.metaData?.forEach((meta: any, index: number) => {
      fd.append(`metaData[${index}][fieldType]`, meta.fieldType);
      fd.append(`metaData[${index}][title]`, meta.title);
      fd.append(`metaData[${index}][isRequired]`, meta.isRequired);
      fd.append(`metaData[${index}][isSecondLevel]`, meta.isSecondLevel);
      fd.append(`metaData[${index}][prompt]`, meta.prompt);
    });

    // Criterias array
    data.criterias?.forEach((criteria: any, cIndex: number) => {
      fd.append(`criterias[${cIndex}][type]`, criteria.type);
      fd.append(`criterias[${cIndex}][title]`, criteria.title);
      fd.append(`criterias[${cIndex}][method]`, criteria.method);
      fd.append(`criterias[${cIndex}][option]`, criteria.option);

      // Scoring sections
      criteria.scoringSections?.forEach((section: any, sIndex: number) => {
        fd.append(`criterias[${cIndex}][scoringSections][${sIndex}][title]`, section.title);

        // Details
        section.details?.forEach((detail: any, dIndex: number) => {
          fd.append(
            `criterias[${cIndex}][scoringSections][${sIndex}][details][${dIndex}][description]`,
            detail.description
          );
          fd.append(
            `criterias[${cIndex}][scoringSections][${sIndex}][details][${dIndex}][score]`,
            detail.score
          );
          fd.append(
            `criterias[${cIndex}][scoringSections][${sIndex}][details][${dIndex}][scoringPercentage]`,
            detail.scoringPercentage
          );
          fd.append(
            `criterias[${cIndex}][scoringSections][${sIndex}][details][${dIndex}][prompt]`,
            detail.prompt
          );
          fd.append(
            `criterias[${cIndex}][scoringSections][${sIndex}][details][${dIndex}][isAutoFail]`,
            detail.isAutoFail
          );
          fd.append(
            `criterias[${cIndex}][scoringSections][${sIndex}][details][${dIndex}][uniqueId]`,
            detail.uniqueId
          );
        });
      });
    });

    return fd;
  }
  public sendUpdate(): void {
    if (this.scorecardForm.invalid) {
      console.error('Form is invalid');
      return;
    }
    // console.log('send update clicked..!', this.scorecardForm.value);
    const data = this.scorecardForm.value;
    // this.isLoading = true;
    const formdata = this.buildFormDataManually(data);
    // Debug: Log FormData contents
    console.log('FormData contents:');
    formdata.forEach((value, key) => {
      console.log(key, ':', value);
    });
    const metaArr = this.metaDataArray.value;
    const metaArrVal = metaArr.some((val: any) => val.prompt == '');

    if (metaArrVal) {
      this.saveErrorMessage.set('Please fill all prompt fields in Meta Data sections.');
      return;
    }
    // Validate all criteria → scoring sections → details
    for (let cIndex = 0; cIndex < this.criteriasArray.length; cIndex++) {
      const criteria = this.criteriasArray.at(cIndex) as FormGroup;
      const scoringSections = criteria.get('scoringSections') as FormArray;

      if (!scoringSections || scoringSections.length === 0) {
        this.saveErrorMessage.set(`Criteria ${cIndex + 1} has no scoring section.`);
        return;
      }

      for (let sIndex = 0; sIndex < scoringSections.length; sIndex++) {
        const section = scoringSections.at(sIndex) as FormGroup;
        const details = section.get('details') as FormArray;

        if (!details || details.length === 0) {
          this.saveErrorMessage.set(
            `Criteria ${cIndex + 1}, Section ${sIndex + 1} has no details.`
          );
          return;
        }

        // NOW check each detail
        for (let dIndex = 0; dIndex < details.length; dIndex++) {
          const detail = details.at(dIndex).value;

          if (
            !detail.description?.trim() ||
            detail.score === null ||
            // !detail.scoringPercentage?.trim() ||
            !detail.prompt?.trim()
          ) {
            this.saveErrorMessage.set(
              `Please fill all fields in Criteria ${cIndex + 1}, Section ${sIndex + 1}, Detail ${
                dIndex + 1
              }.`
            );
            return;
          }
        }
      }
    }

    console.log(this.criteriasArray.value);
    console.log(metaArrVal, 'meta data array value');
    this.editsc.UpdateScoreCard(formdata, this.authkey).subscribe({
      next: (response: any): void => {
        // console.log('Update successful:', response);
        this.successModalOpened.set(true);
        setTimeout(() => {
          // this.successModalOpened.set(false);
          this.router.navigate(['scorecardnew']);
        }, 1000);
      },
      error: (error: any) => {
        console.log('Update error:', error);
        // this.isLoading = false;
        alert('Error updating scorecard');
      },
    });
  }
  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
  // Add these properties to your component class
  expandedSections = {
    metadata: true,
    scoring: true,
  };

  expandedSubSections: Record<string, boolean> = {};
  public toggleSection(section: 'metadata' | 'scoring'): void {
    this.expandedSections[section] = !this.expandedSections[section];
  }
  public toggleSubSection(criteriaIndex: number, sectionIndex: number): void {
    const key = `${criteriaIndex}-${sectionIndex}`;
    this.expandedSubSections[key] = !this.expandedSubSections[key];
  }
  public isSubSectionExpanded(criteriaIndex: number, sectionIndex: number): boolean {
    const key = `${criteriaIndex}-${sectionIndex}`;
    return this.expandedSubSections[key] !== false; // Default to true
  }
  public DeleteScoring(ci: any, si: any): void {
    console.log('ID OF DEL SCORING IS  ', ci);
    const scoringArray = this.getScoringSection(ci);
    if (!scoringArray) {
      console.error('scoring section not found for', ci);
    }
    scoringArray.removeAt(si);
    console.log(scoringArray.value);
  }
  public EditScoring(ci: number, si: number): void {
    this.selectedCriteriaIndex = ci; // which criteria
    this.currentScoringIndex = si; // which section inside criteria
    this.isEditScoringMode = true;
    const scoringArray = this.getScoringSection(ci);
    const sectionToEdit = scoringArray.at(si) as FormGroup;
    // Patch the modal form
    this.AddSectionScorecard.patchValue({
      title: sectionToEdit.get('title')?.value,
    });
    // Open modal
    this.isSectionModalOpen.set(true);
  }

  AddScoringCritera(ci: number, si: number): void {
    console.log('ID OF ADD SCORING CRITERIA IS ', ci, si);
    // Set indexes for adding
    this.selectedCriteriaIndex = ci;
    this.currentScoringIndex = si;
    // Make sure we are in "Add Mode"
    this.isEditCriteriaMode = false;
    this.currentcriteriatobeEdit = null;

    // Reset form (important)
    this.AddCriteriaScorecard.reset();

    // Open modal
    this.scoringCriteriaModalOpen.set(true);
  }

  public closeCriteriaModal(): void {
    this.scoringCriteriaModalOpen.set(false);
  }
  DeleteCriteria(ci: number, si: number, di: number): void {
    console.log('ID OF DEL CRITERIA IS ', ci, si, di);
    const scoredetails = this.getDetails(ci, si);
    if (!scoredetails) {
      console.error('scoring section not found for', ci, si);
    }
    scoredetails.removeAt(di);
    console.log(scoredetails.value, ' This is our Updated criterias');
  }
}
