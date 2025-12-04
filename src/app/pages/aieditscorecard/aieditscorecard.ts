// import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { HttpClient } from '@angular/common/http';
// import { Subscription } from 'rxjs';
// import { editscorecard } from '../../../services/editscorecard';
// import { JsonPipe } from '@angular/common';

// // Define an interface for your scorecard data
// interface ScorecardData {
//   _id: string;
//   title: string;
//   description: string;
//   coachingForm: string;
//   isPublished: boolean;
//   isActive: boolean;
//   groups: string[];
//   isAllGroups: boolean;
//   visibleToManagers: boolean;
//   coachingPurposeOnly: boolean;
//   criterias: any[];
//   metaData: any[];
//   createdAt?: string;
//   updatedAt?: string;
// }

// @Component({
//   selector: 'app-aieditscorecard',
//   imports: [JsonPipe],
//   templateUrl: './aieditscorecard.html',
//   styleUrl: './aieditscorecard.css',
// })
// export class AIeditscorecard implements OnInit, OnDestroy {
//   public ID: string = '';
//   private routeSubscription: Subscription | undefined;
//   route = inject(ActivatedRoute);
//   router = inject(Router);
//   http = inject(HttpClient);
//   authorization = localStorage.getItem('authToken');
//   authkey: any = this.authorization;

//   // Fix: Change type from 'string' to 'ScorecardData | null'
//   public AISCDataDetails = signal<ScorecardData | null>(null);

//   constructor(private editsc: editscorecard) {
//     console.log('AI scorecard page Called!');
//   }

//   ngOnInit(): void {
//     this.routeSubscription = this.route.queryParams.subscribe((params) => {
//       this.ID = params['id'];
//       console.log(this.ID, 'This is our detailed id from params');
//     });

//     const AIPayLoad = { id: this.ID };
//     this.editsc.EditScoreCard(AIPayLoad, this.authkey).subscribe({
//       next: (response: any): void => {
//         console.log('Full API Response:', response.data);
//         this.AISCDataDetails.set(response.data);
//         console.log(this.AISCDataDetails(), 'This is our AI scorecard data ');
//       },
//       error: (error: any) => {
//         console.log(error);
//       },
//     });
//   }

//   ngOnDestroy(): void {
//     if (this.routeSubscription) {
//       this.routeSubscription.unsubscribe();
//     }
//   }

//   buildFormDataManually(data: ScorecardData): FormData {
//     const fd = new FormData();

//     // Simple fields
//     fd.append('id', data._id);
//     fd.append('title', data.title);
//     fd.append('description', data.description);
//     fd.append('coachingForm', data.coachingForm);
//     fd.append('isPublished', data.isPublished.toString());
//     fd.append('isActive', data.isActive.toString());
//     fd.append('visibleToManagers', data.visibleToManagers.toString());
//     fd.append('coachingPurposeOnly', data.coachingPurposeOnly.toString());
//     fd.append('isAllGroups', data.isAllGroups.toString());

//     // Groups array
//     data.groups?.forEach((group: string, index: number) => {
//       fd.append(`groups[${index}]`, group);
//     });

//     // MetaData array
//     data.metaData?.forEach((meta: any, index: number) => {
//       fd.append(`metaData[${index}][fieldType]`, meta.fieldType);
//       fd.append(`metaData[${index}][title]`, meta.title);
//       fd.append(`metaData[${index}][isRequired]`, meta.isRequired.toString());
//       fd.append(`metaData[${index}][isSecondLevel]`, meta.isSecondLevel.toString());
//       fd.append(`metaData[${index}][prompt]`, meta.prompt);
//     });

//     // Criterias array
//     data.criterias?.forEach((criteria: any, cIndex: number) => {
//       fd.append(`criterias[${cIndex}][type]`, criteria.type);
//       fd.append(`criterias[${cIndex}][title]`, criteria.title);
//       fd.append(`criterias[${cIndex}][method]`, criteria.method);
//       fd.append(`criterias[${cIndex}][option]`, criteria.option);

//       // Scoring sections
//       criteria.scoringSections?.forEach((section: any, sIndex: number) => {
//         fd.append(`criterias[${cIndex}][scoringSections][${sIndex}][title]`, section.title);

//         // Details
//         section.details?.forEach((detail: any, dIndex: number) => {
//           fd.append(
//             `criterias[${cIndex}][scoringSections][${sIndex}][details][${dIndex}][description]`,
//             detail.description
//           );
//           fd.append(
//             `criterias[${cIndex}][scoringSections][${sIndex}][details][${dIndex}][score]`,
//             detail.score.toString()
//           );
//           fd.append(
//             `criterias[${cIndex}][scoringSections][${sIndex}][details][${dIndex}][scoringPercentage]`,
//             detail.scoringPercentage.toString()
//           );
//           fd.append(
//             `criterias[${cIndex}][scoringSections][${sIndex}][details][${dIndex}][prompt]`,
//             detail.prompt
//           );
//           fd.append(
//             `criterias[${cIndex}][scoringSections][${sIndex}][details][${dIndex}][isAutoFail]`,
//             detail.isAutoFail.toString()
//           );
//           fd.append(
//             `criterias[${cIndex}][scoringSections][${sIndex}][details][${dIndex}][uniqueId]`,
//             detail.uniqueId
//           );
//         });
//       });
//     });

//     return fd;
//   }

//   sendUpdate() {
//     console.log('send update clicked...!', this.AISCDataDetails());
//     const data = this.AISCDataDetails();

//     // Add null check
//     if (!data) {
//       console.error('No data available to update');
//       return;
//     }

//     const formdata = this.buildFormDataManually(data);

//     // Debug: Log FormData contents
//     console.log('FormData contents:');
//     formdata.forEach((value, key) => {
//       console.log(key, ':', value);
//     });

//     this.editsc.UpdateScoreCard(formdata, this.authkey).subscribe({
//       next: (response: any): void => {
//         console.log('Update successful:', response);
//       },
//       error: (error: any) => {
//         console.log('Update error:', error);
//       },
//     });
//   }
// }

import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  // isLoading = false;

  constructor(private editsc: editscorecard) {
    console.log('AI scorecard page Called!');
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

  public DeleteMetaData(i: number): void {
    console.log(i, 'meta data section number');
    this.metaDataArray.removeAt(i);
    console.log(this.metaDataArray, 'Updated meta data array');
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

  getScoringSection(criteriaIndex: number): FormArray {
    return this.criteriasArray.at(criteriaIndex).get('scoringSections') as FormArray;
  }

  getDetails(criteriaIndex: number, sectionIndex: number): FormArray {
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
      fd.append(`metaData[${index}][isRequired]`, meta.isRequired.toString());
      fd.append(`metaData[${index}][isSecondLevel]`, meta.isSecondLevel.toString());
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
            detail.score.toString()
          );
          fd.append(
            `criterias[${cIndex}][scoringSections][${sIndex}][details][${dIndex}][scoringPercentage]`,
            detail.scoringPercentage.toString()
          );
          fd.append(
            `criterias[${cIndex}][scoringSections][${sIndex}][details][${dIndex}][prompt]`,
            detail.prompt
          );
          fd.append(
            `criterias[${cIndex}][scoringSections][${sIndex}][details][${dIndex}][isAutoFail]`,
            detail.isAutoFail.toString()
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

  sendUpdate(): void {
    if (this.scorecardForm.invalid) {
      console.error('Form is invalid');
      return;
    }

    console.log('send update clicked...!', this.scorecardForm.value);
    const data = this.scorecardForm.value;

    // this.isLoading = true;
    const formdata = this.buildFormDataManually(data);

    // Debug: Log FormData contents
    console.log('FormData contents:');
    formdata.forEach((value, key) => {
      console.log(key, ':', value);
    });

    this.editsc.UpdateScoreCard(formdata, this.authkey).subscribe({
      next: (response: any): void => {
        console.log('Update successful:', response);
        // this.isLoading = false;
        alert('Scorecard updated successfully!');
        this.router.navigate(['scorecardnew']);
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

  toggleSection(section: 'metadata' | 'scoring'): void {
    this.expandedSections[section] = !this.expandedSections[section];
  }

  toggleSubSection(criteriaIndex: number, sectionIndex: number): void {
    const key = `${criteriaIndex}-${sectionIndex}`;
    this.expandedSubSections[key] = !this.expandedSubSections[key];
  }

  isSubSectionExpanded(criteriaIndex: number, sectionIndex: number): boolean {
    const key = `${criteriaIndex}-${sectionIndex}`;
    return this.expandedSubSections[key] !== false; // Default to true
  }
}
