import { editscorecard } from './../../../services/editscorecard';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FetchAPIData } from '../../../services/fetch-apidata';
// import { MetaData } from '../../user';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  FormArray,
  AbstractControl,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

interface ScoringItems {
  id: number;
  value: string;
  criteria: any[];
}
@Component({
  selector: 'app-addscorecard',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropModule,
    MatChipsModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './addscorecard.html',
  styleUrl: './addscorecard.css',
})
export class Addscorecard implements OnInit, OnDestroy {
  //variables used in the page
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  public submittedSmallTextData: any[] = [];
  public submittedMetaData: {
    id: number;
    fieldType: string;
    title: string;
    isRequired: boolean;
    isSecondLevel: boolean;
    options?: string[];
  }[] = [];
  public saveErrorMessage = signal<string | null>(null);
  public multiselectOptions: string[] = [];
  public singleSelectOptions: string[] = [];
  public secondLevelSelect: string[] = [];
  public AddScoreCardID: string | null = '';
  private routeSubscription: Subscription | undefined;
  public criteriaVal: FormGroup;
  public metaDataScoreCard: FormGroup;
  public DateScoreCard: FormGroup;
  public LargeScoreCard: FormGroup;
  public SmallTextModal: FormGroup;
  public MultiSelectModal: FormGroup;
  public SingleSelectModal: FormGroup;
  public groupsdata: any[] = [];

  // public submittedMetaData: MetaData[] = [];
  public openCriteriaMenuId = signal<number | null>(null);
  public APIDATA = signal<any>(null);
  public isOpenedMetaData = signal<boolean>(false);
  public isMetaDataModalOpened = signal<boolean>(false);
  public isSingleSelectModalOpened = signal<boolean>(false);
  public isMultiSelectModalOpened = signal<boolean>(false);
  public isSmallTextModalOpened = signal<boolean>(false);
  public isLargeTextModalOpened = signal<boolean>(false);
  public isDateModalOpened = signal<boolean>(false);
  public isToggleScoringOpen = signal<boolean>(false);
  public openMenuId = signal<string | number | null>(null);
  public scoringForm: FormGroup;
  public scoringArray = signal<ScoringItems[]>([]);
  public isScoringModalOpened = signal<boolean>(false);
  public openScoringMenuId = signal<number | null>(null);
  public criteriaModalOpen = signal(false);
  public activeSectionId: number | null = null;
  public editingCriteriaId: number | null = null;
  public http = inject(HttpClient);
  public router = inject(Router);
  public route = inject(ActivatedRoute);
  public authorization = localStorage.getItem('authToken');
  public authkey: any = this.authorization;
  //constructor method calls very first when the page loads

  constructor(private editscorecard: editscorecard, private groups: FetchAPIData) {
    console.log('add scorecard page called!');
    console.log(this.AddScoreCardID);

    this.criteriaVal = new FormGroup({
      crValue: new FormControl(''),
    });

    this.metaDataScoreCard = new FormGroup({
      id: new FormControl(Math.random()),
      description: new FormControl('', Validators.required),
    });
    this.scoringForm = new FormGroup({
      id: new FormControl(Date.now()),
      description: new FormControl('', Validators.required),
    });
    this.DateScoreCard = new FormGroup({
      title: new FormControl('', Validators.required),
      isRequired: new FormControl(false),
      newType: new FormControl('dummy'),
      type: new FormControl('date'),
    });

    this.LargeScoreCard = new FormGroup({
      title: new FormControl('', Validators.required),
      isRequired: new FormControl(false),
      newType: new FormControl('dummy'),
      type: new FormControl('largeText'),
    });

    this.SmallTextModal = new FormGroup({
      title: new FormControl('', Validators.required),
      isRequired: new FormControl(false),
      newType: new FormControl('dummy'),
      type: new FormControl('smallText'),
    });

    this.MultiSelectModal = new FormGroup({
      title: new FormControl('', Validators.required),
      multiselect: new FormControl([], Validators.required),
      isFormChecked: new FormControl(false),
      isRequired: new FormControl(false),
      newType: new FormControl('dummy'),
      type: new FormControl('multiSelect'),
    });

    this.SingleSelectModal = new FormGroup({
      title: new FormControl('', Validators.required),
      options: new FormArray([], Validators.required), // First Level Chips
      isSecondLevel: new FormControl(false),
      isThirdLevel: new FormControl(false),
      subOptions: new FormArray([], Validators.required), // Second Level Array
      isFormChecked: new FormControl(false),
      isRequired: new FormControl(false),
      type: new FormControl('singleSelect'),
    });
  }
  isThirdLevelOpened = signal(false);

  getOptionsArray(levelCtrl: AbstractControl): FormArray<any> {
    const control = levelCtrl?.get('options');

    if (control instanceof FormArray) {
      return control;
    }

    const newArray = new FormArray<any>([]);

    if (levelCtrl instanceof FormGroup) {
      levelCtrl.setControl('options', newArray);
    }

    return newArray;
  }
  getIsThirdLevel(subCtrl: AbstractControl) {
    return subCtrl.get('isThirdLevel') as FormControl;
  }

  get optionsArray() {
    return this.SingleSelectModal.get('options') as FormArray;
  }
  get subOptionsArray() {
    return this.SingleSelectModal.get('subOptions') as FormArray;
  }
  getSecondLevelOptions(subCtrl: AbstractControl): FormArray {
    return subCtrl.get('secondLevelOptions') as FormArray;
  }
  getThirdLevels(subCtrl: AbstractControl): FormArray<any> {
    const control = subCtrl?.get('thirdLevels');
    if (control instanceof FormArray) {
      return control;
    } else {
      // Ensure the control exists to prevent null errors
      const newArray = new FormArray<any>([]);
      if (subCtrl instanceof FormGroup) {
        subCtrl.setControl('thirdLevels', newArray);
      }
      return newArray;
    }
  }

  get subFields(): FormArray {
    return this.SingleSelectModal.get('subFields') as FormArray;
  }
  addTopChip(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      const chips = this.SingleSelectModal.get('topLevelChips')?.value || [];
      chips.push(value);
      this.SingleSelectModal.get('topLevelChips')?.setValue(chips);
    }
    event.chipInput!.clear();
  }
  removeTopChip(chip: string): void {
    const chips = this.SingleSelectModal.get('topLevelChips')?.value || [];
    const index = chips.indexOf(chip);
    if (index >= 0) {
      chips.splice(index, 1);
      this.SingleSelectModal.get('topLevelChips')?.setValue(chips);
    }
  }

  generateSubFields() {
    this.subFields.clear(); // reset
    const chips = this.SingleSelectModal.get('topLevelChips')?.value || [];

    chips.forEach((chip: string) => {
      this.subFields.push(
        new FormGroup({
          label: new FormControl(chip), // sub-field name = chip
          nestedChips: new FormControl<string[]>([]), // nested chips inside
        })
      );
    });
  }
  addNestedChip(event: MatChipInputEvent, index: number): void {
    const value = (event.value || '').trim();
    if (value) {
      const nestedChips = this.subFields.at(index).get('nestedChips')?.value || [];
      nestedChips.push(value);
      this.subFields.at(index).get('nestedChips')?.setValue(nestedChips);
    }
    event.chipInput!.clear();
  }
  removeNestedChip(chip: string, index: number): void {
    const nestedChips = this.subFields.at(index).get('nestedChips')?.value || [];
    const chipIndex = nestedChips.indexOf(chip);
    if (chipIndex >= 0) {
      nestedChips.splice(chipIndex, 1);
      this.subFields.at(index).get('nestedChips')?.setValue(nestedChips);
    }
  }
  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.submittedMetaData, event.previousIndex, event.currentIndex);
    this.SaveDataToLocalStorage(); // order save karna
  }
  dropSection(event: CdkDragDrop<any[]>) {
    const sections = this.scoringArray();
    moveItemInArray(sections, event.previousIndex, event.currentIndex);
    this.scoringArray.set(sections); // signal update
    this.saveScoringToLocal();
  }
  dropCriteria(event: CdkDragDrop<any[]>, section: any) {
    moveItemInArray(section.criteria, event.previousIndex, event.currentIndex);
    this.scoringArray.set([...this.scoringArray()]); // trigger UI refresh
    this.saveScoringToLocal();
  }

  addChip(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.multiselectOptions.push(value);
      this.MultiSelectModal.get('multiselect')?.setValue(this.multiselectOptions);
    }
    event.chipInput!.clear();
  }
  removeChip(option: string): void {
    const index = this.multiselectOptions.indexOf(option);
    if (index >= 0) {
      this.multiselectOptions.splice(index, 1);
      this.MultiSelectModal.get('multiselect')?.setValue(this.multiselectOptions);
    }
  }
  addSingleSelectCHip(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.singleSelectOptions.push(value);
      this.SingleSelectModal.get('options')?.setValue(this.singleSelectOptions);
    }
    event.chipInput!.clear();
  }
  removeSingleSelectChip(option: string): void {
    const index = this.singleSelectOptions.indexOf(option);
    if (index >= 0) {
      this.singleSelectOptions.splice(index, 1);
      this.SingleSelectModal.get('options')?.setValue(this.singleSelectOptions);
    }
  }

  removesecondlevel(option: string): void {
    const index = this.secondLevelSelect.indexOf(option);
    if (index >= 0) {
      this.secondLevelSelect.splice(index, 1);
      this.SingleSelectModal.get('secondlevelOption')?.setValue(this.singleSelectOptions);
    }
  }

  addOptionChip(event: MatChipInputEvent) {
    const value = (event.value || '').trim();
    if (value) {
      this.optionsArray.push(new FormControl(value));
      // second level ke liye empty placeholder banate hain
      this.subOptionsArray.push(
        new FormGroup({
          title: new FormControl(value),
          secondLevelOptions: new FormArray([]),
          isThirdLevel: new FormControl(false),
          thirdLevels: new FormArray([]),
        })
      );
    }
    event.chipInput!.clear();
  }

  removeOptionChip(index: number) {
    this.optionsArray.removeAt(index);
    this.subOptionsArray.removeAt(index);
  }

  addSecondLevelChip(event: MatChipInputEvent, parentIndex: number) {
    const value = (event.value || '').trim();
    if (value) {
      const parent = this.subOptionsArray.at(parentIndex);
      const secondLevelArray = parent.get('secondLevelOptions') as FormArray;
      secondLevelArray.push(new FormControl(value));

      // Also create corresponding third-level container for this child
      const thirdLevelsArray = parent.get('thirdLevels') as FormArray;
      thirdLevelsArray.push(
        new FormGroup({
          title: new FormControl(value),
          options: new FormArray([]), // will store 3rd-level chips
        })
      );
    }
    event.chipInput!.clear();
  }

  removeSecondLevelChip(parentIndex: number, chipIndex: number) {
    const parent = this.subOptionsArray.at(parentIndex);
    (parent.get('secondLevelOptions') as FormArray).removeAt(chipIndex);
    (parent.get('thirdLevels') as FormArray).removeAt(chipIndex);
  }

  addThirdLevelChip(event: MatChipInputEvent, parentIndex: number, secondIndex: number) {
    const value = (event.value || '').trim();
    if (value) {
      const parent = this.subOptionsArray.at(parentIndex);
      const thirdLevelsArray = parent.get('thirdLevels') as FormArray;
      const targetThirdLevel = thirdLevelsArray.at(secondIndex).get('options') as FormArray;
      targetThirdLevel.push(new FormControl(value));
    }
    event.chipInput!.clear();
  }
  limitToMax(event: any) {
    const value = event.target.value;
    if (value >= 3) {
      event.target.value = 3;
    }
  }

  removeThirdLevelChip(parentIndex: number, secondIndex: number, chipIndex: number) {
    const parent = this.subOptionsArray.at(parentIndex);
    const thirdLevelsArray = parent.get('thirdLevels') as FormArray;
    const targetThirdLevel = thirdLevelsArray.at(secondIndex).get('options') as FormArray;
    targetThirdLevel.removeAt(chipIndex);
  }
  //ngOnIniT methods triggers first and then when any event happens and change ...
  ngOnInit(): void {
    this.routeSubscription = this.route.queryParams.subscribe((params) => {
      this.AddScoreCardID = params['id'];
      const editPayload = { id: this.AddScoreCardID };
      this.groups.fetchGroupsData(this.authkey).subscribe({
        next: (data: any): void => {
          this.groupsdata = data.data;
          console.log('API response of the group data ', this.groupsdata);
        },
        error: (err: any) => {
          console.log(err);
        },
      });
      this.editscorecard.EditScoreCard(editPayload, this.authkey).subscribe({
        next: (response: any): void => {
          console.log('hey how are you this is my response ....', response);
          this.APIDATA.set(response.data);
          this.populateEditForm(response.data);
          // populate local forms/state from API response and set readonly
          this.populateFormFromAPI(response.data);
          console.log('APIDATA set and form populated', this.APIDATA());
        },
        error: (error: any) => {
          console.log(error);
        },
      });
    });

    this.getDatafromLocalStorage();
    // this.getScoringFromLocal();
  }

  EditFormData = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    id: new FormControl(''),
    groups: new FormArray([]),
    isAllGroups: new FormControl(false),
    evaluationType: new FormControl('', Validators.required),
    scoringModel: new FormControl('', Validators.required),
    coachingForm: new FormControl(''),
    visibleToManagers: new FormControl(false),
    coachingPurposeOnly: new FormControl(false),
  });
  populateEditForm(data: any): void {
    this.EditFormData.patchValue({
      title: data.title,
      description: data.description,
      id: data._id,
      groups: data.groups,
      isAllGroups: data.isAllGroups,
      evaluationType: data.evaluationType,
      scoringModel: data.scoringModel,
      coachingForm: data.coachingForm,
      visibleToManagers: data.visibleToManagers,
      coachingPurposeOnly: data.coachingPurposeOnly,
    });
  }
  //ngOnDestroy
  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
  // Populate component state and forms from API response (readonly)
  public isAllSelected(): boolean {
    const groupsArray = this.EditFormData.get('groups') as FormArray;
    return groupsArray.length === this.groupsdata.length;
  }
  public onSelectAllChange(event: Event) {
    const groupsArray = this.EditFormData.get('groups') as FormArray;
    const checkbox = event.target as HTMLInputElement;
    groupsArray.clear();
    if (checkbox.checked) {
      this.groupsdata.forEach((g: any) => groupsArray.push(new FormControl(g._id)));
      this.EditFormData.get('isAllGroups')?.setValue(true);
    } else {
      this.EditFormData.get('isAllGroups')?.setValue(false);
    }
    console.log('Groups in FormArray:', groupsArray.value);
  }
  public isSelected(id: string): boolean {
    const groupsArray = this.EditFormData.get('groups') as FormArray;
    return groupsArray.value.includes(id);
  }
  public onGroupCheckboxChange(id: string, event: Event) {
    const groupsArray = this.EditFormData.get('groups') as FormArray;
    const checkbox = event.target as HTMLInputElement;

    if (checkbox.checked) {
      groupsArray.push(new FormControl(id));
    } else {
      const index = groupsArray.controls.findIndex((c) => c.value === id);
      if (index !== -1) {
        groupsArray.removeAt(index);
      }
    }

    // Update Select All flag
    this.EditFormData.get('isAllGroups')?.setValue(this.isAllSelected());
    console.log('Groups in FormArray:', groupsArray.value);
  }
  private populateFormFromAPI(data: any): void {
    if (!data) return;

    // Normalize metadata
    if (Array.isArray(data.metaData)) {
      this.submittedMetaData = data.metaData.map((m: any) => ({
        id: m._id || m.id || Date.now(),
        fieldType: m.fieldType || m.fieldType || '',
        title: m.title || '',
        isRequired: Boolean(m.isRequired),
        isSecondLevel: Boolean(m.isSecondLevel) || '',
        options: m.options || [],
      }));
    }

    // Convert API criterias -> local scoringArray structure
    const localSections: ScoringItems[] = [];
    if (Array.isArray(data.criterias)) {
      data.criterias.forEach((crit: any, critIndex: number) => {
        (crit.scoringSections || []).forEach((sec: any, secIndex: number) => {
          const sectionId = Date.now() + critIndex * 1000 + secIndex;
          const section: ScoringItems = {
            id: sectionId,
            value: sec.title || crit.title || `Section ${sectionId}`,
            criteria: (sec.details || []).map((d: any, di: number) => ({
              id: d._id || Number(d.uniqueId) || Date.now() + di,
              description: d.description || d.prompt || '',
              autofill: Boolean(d.isAutoFail),
              type: crit.type || '',
              method: crit.method || '',
              option: crit.option || '',
              value: Number(d.score) || 0,
              percentage: Number(d.scoringPercentage) || 0,
            })),
          };
          localSections.push(section);
        });
      });
    }

    if (localSections.length > 0) {
      this.scoringArray.set(localSections);
      // compute totals for each section
      localSections.forEach((s) => this.calculateTotal(s.id));
    }

    // Disable editing - make forms read-only
    // try {
    //   this.DateScoreCard.disable();
    //   this.LargeScoreCard.disable();
    //   this.SmallTextModal.disable();
    //   this.MultiSelectModal.disable();
    //   this.SingleSelectModal.disable();
    //   this.criteriaForm.disable();
    //   this.scoringForm.disable();
    // } catch (e) {
    //   // ignore if forms not initialized
    // }
  }
  //methods to open and close single select modal
  public OpenSingleSelectModal(): void {
    this.isSingleSelectModalOpened.update((cVal) => !cVal);
    this.isOpenedMetaData.update((CVAL) => !CVAL);
  }
  public closeSingleSelectModal(): void {
    this.isSingleSelectModalOpened.update((val) => !val);
  }
  //methods to open and close Multi select modal
  public OpenMultiSelectModal(): void {
    this.isMultiSelectModalOpened.update((val) => !val);
    this.isOpenedMetaData.update((CVAL) => !CVAL);
  }
  public closeMultiSelectModal(): void {
    this.isMultiSelectModalOpened.update((VAL) => !VAL);
  }
  //methods to open and close small Text  modal
  public OpenSmallTextModal(): void {
    this.isSmallTextModalOpened.update((val) => !val);
    this.isOpenedMetaData.update((CVAL) => !CVAL);
  }
  public closeSmallTextModal(): void {
    this.isSmallTextModalOpened.update((val) => !val);
  }
  //methods to open and close large Text  modal
  public OpenLargeTextModal(): void {
    this.isLargeTextModalOpened.update((val) => !val);
    this.isOpenedMetaData.update((CVAL) => !CVAL);
  }
  public closeLargeTextModal(): void {
    this.isLargeTextModalOpened.update((val) => !val);
  }
  //methods to open and close Add Date modal
  public OpenDateModal(): void {
    this.isDateModalOpened.update((val) => !val);
    this.isOpenedMetaData.update((CVAL) => !CVAL);
  }
  public closeDateModal(): void {
    this.isDateModalOpened.update((val) => !val);
  }
  public toggleMetaData() {
    this.isOpenedMetaData.update((currentVal) => !currentVal);
  }
  public OpenMetaDataModal(): void {
    this.isMetaDataModalOpened.update((cVal) => !cVal);
    console.log('opened meta data modal!');
    this.isOpenedMetaData.update((currentVal) => !currentVal);
  }
  public closeMetaDataModal(): void {
    this.isMetaDataModalOpened.update((cVal) => !cVal);
  }
  private getDatafromLocalStorage(): void {
    const storedData = localStorage.getItem('description val');
    if (storedData) {
      const parsed = JSON.parse(storedData);
      // Normalize metadata: ensure all required fields exist
      this.submittedMetaData = parsed.map((meta: any) => ({
        id: meta.id,
        fieldType: meta.fieldType || '',
        title: meta.title || '',
        isRequired: meta.hasOwnProperty('isRequired') ? Boolean(meta.isRequired) : false,
        isSecondLevel: meta.hasOwnProperty('isSecondLevel') ? Boolean(meta.isSecondLevel) : true,
        options: meta.options || [],
      }));
    }
  }
  private SaveDataToLocalStorage(): void {
    localStorage.setItem('description val', JSON.stringify(this.submittedMetaData));
  }
  //Method to submit meta data form
  public SubmitmetaData(): void {
    console.log(this.metaDataScoreCard.value);
    this.closeMetaDataModal();
    if (this.metaDataScoreCard.valid) {
      const descriptionValue = this.metaDataScoreCard.get('description')?.value;
      const id = Math.random();
      const newMetaData = {
        id,
        fieldType: descriptionValue,
        title: descriptionValue,
        isRequired: false,
        isSecondLevel: false,
        options: [],
      };
      if (descriptionValue || id) {
        this.submittedMetaData.push(newMetaData);
      }
      this.SaveDataToLocalStorage();
      this.metaDataScoreCard.reset({ id: Math.random(), description: '' });
    }
  }
  //This is to submit the Date modal
  // Date Modal
  public SubmitDateData(): void {
    if (this.DateScoreCard.valid) {
      const newItem = {
        id: Date.now(),
        fieldType: 'date',
        title: this.DateScoreCard.value.title,
        isRequired: Boolean(this.DateScoreCard.value.isRequired),
        isSecondLevel: true,
        options: [],
      };

      this.submittedMetaData.push(newItem);
      this.SaveDataToLocalStorage();
      console.log('All Meta Data:', this.submittedMetaData);
      this.DateScoreCard.reset({ title: '', isRequired: false });
      this.closeDateModal();
    }
  }
  //This is to submit the Date modal
  // Large Text
  public SubmitLargeTextData(): void {
    if (this.LargeScoreCard.valid) {
      const newItem = {
        id: Date.now(),
        fieldType: 'largeText',
        title: this.LargeScoreCard.value.title,
        isRequired: Boolean(this.LargeScoreCard.value.isRequired),
        isSecondLevel: true,
        options: [],
      };
      this.submittedMetaData.push(newItem);
      this.SaveDataToLocalStorage();
      console.log('All Meta Data:', this.submittedMetaData);
      this.LargeScoreCard.reset({ title: '', isRequired: false });
      this.closeLargeTextModal();
    }
  }
  //This is to submit the Small Text modal
  // Small Text
  public SubmitSmallTextData(): void {
    if (this.SmallTextModal.valid) {
      if (this.editingItemId) {
        const index = this.submittedMetaData.findIndex((item) => item.id === this.editingItemId);
        if (index !== -1) {
          this.submittedMetaData[index] = {
            ...this.submittedMetaData[index],
            title: this.SmallTextModal.value.title,
            isRequired: Boolean(this.SmallTextModal.value.isRequired),
          };
        }
        this.editingItemId = null;
      } else {
        const newItem = {
          id: Date.now(),
          fieldType: 'smallText',
          title: this.SmallTextModal.value.title,
          isRequired: Boolean(this.SmallTextModal.value.isRequired),
          isSecondLevel: true,
          options: [],
        };
        this.submittedMetaData.push(newItem);
      }
      this.SaveDataToLocalStorage();
      console.log('All Meta Data:', this.submittedMetaData);
      this.SmallTextModal.reset({ title: '', isRequired: false });
      this.closeSmallTextModal();
    }
  }
  deleteItemSmallText(id: number) {
    this.submittedSmallTextData = this.submittedSmallTextData.filter((item) => item.id !== id);
  }
  //This is to submit the Multi select  modal
  // Multi Select
  public SubmitMultiSelectData(): void {
    if (this.MultiSelectModal.valid) {
      if (this.editingItemId) {
        const index = this.submittedMetaData.findIndex((item) => item.id === this.editingItemId);
        if (index !== -1) {
          this.submittedMetaData[index] = {
            ...this.submittedMetaData[index],
            title: this.MultiSelectModal.value.title,
            isRequired: Boolean(this.MultiSelectModal.value.isRequired),
            options: this.MultiSelectModal.value.multiselect,
          };
        }
        this.editingItemId = null;
      } else {
        const newItem = {
          id: Date.now(),
          fieldType: 'multiSelect',
          title: this.MultiSelectModal.value.title,
          isRequired: Boolean(this.MultiSelectModal.value.isRequired),
          isSecondLevel: true,
          options: this.MultiSelectModal.value.multiselect,
        };
        this.submittedMetaData.push(newItem);
      }
      this.SaveDataToLocalStorage();
      console.log('All Meta Data:', this.submittedMetaData);
      this.MultiSelectModal.reset({ title: '', isRequired: false });
      this.closeMultiSelectModal();
    }
  }
  // Single Select
  public SubmitSingleSelectData(): void {
    console.log(this.SingleSelectModal.value);
    if (this.SingleSelectModal.valid) {
      if (this.editingItemId) {
        const index = this.submittedMetaData.findIndex((item) => item.id === this.editingItemId);
        if (index !== -1) {
          this.submittedMetaData[index] = {
            ...this.submittedMetaData[index],
            title: this.SingleSelectModal.value.title,
            isRequired: Boolean(this.SingleSelectModal.value.isRequired),
            isSecondLevel: Boolean(this.SingleSelectModal.value.isSecondLevel),
            options: this.SingleSelectModal.value.options,
          };
        }
        this.editingItemId = null;
      } else {
        const newItem = {
          id: Date.now(),
          fieldType: 'singleSelect',
          title: this.SingleSelectModal.value.title,
          isRequired: Boolean(this.SingleSelectModal.value.isRequired),
          isSecondLevel: Boolean(this.SingleSelectModal.value.isSecondLevel),
          options: this.SingleSelectModal.value.options,
        };
        this.submittedMetaData.push(newItem);
      }
      this.SaveDataToLocalStorage();
      console.log('All Meta Data:', this.submittedMetaData);
      this.SingleSelectModal.reset({
        title: '',
        addSecondLevel: false,
        isRequired: false,
      });
      this.closeSingleSelectModal();
    }
  }
  public ToggleScoring(): void {
    this.isToggleScoringOpen.update((cVal) => !cVal);
    console.log('toggle scoring...');
  }
  public toggleMenu(id: string | number): void {
    if (this.openMenuId() === id) {
      this.openMenuId.set(null); // close if same menu is clicked again
    } else {
      this.openMenuId.set(id);
    }
  }
  public deleteItem(id: string | number): void {
    this.submittedMetaData = this.submittedMetaData.filter((item) => item.id !== id);
    // localStorage.setItem('description val', JSON.stringify(this.submittedMetaData));
    this.openMenuId.set(null); // close menu after delete
  }
  public editingItemId: number | null = null;
  public editingFieldType: string | null = null;

  public editItem(id: string | number): void {
    this.isOpenedMetaData.update((currentVal) => !currentVal);
    const item = this.submittedMetaData.find((m) => m.id === id);
    if (item) {
      this.editingItemId = item.id;
      this.editingFieldType = item.fieldType;
      // Prefill the appropriate form based on fieldType
      switch (item.fieldType) {
        case 'date':
          this.DateScoreCard.patchValue({
            title: item.title,
            isRequired: item.isRequired,
          });
          this.OpenDateModal();
          break;
        case 'smallText':
          this.SmallTextModal.patchValue({
            title: item.title,
            isRequired: item.isRequired,
          });
          this.OpenSmallTextModal();
          break;
        case 'largeText':
          this.LargeScoreCard.patchValue({
            title: item.title,
            isRequired: item.isRequired,
          });
          this.OpenLargeTextModal();
          break;
        case 'multiSelect':
          this.MultiSelectModal.patchValue({
            title: item.title,
            multiselect: item.options,
            isRequired: item.isRequired,
          });
          // this.multiselectOptions = [...(item.options || [])];
          this.OpenMultiSelectModal();
          break;
        case 'singleSelect':
          // For single select, we need to handle the complex structure
          this.SingleSelectModal.patchValue({
            title: item.title,
            isRequired: item.isRequired,
            isSecondLevel: item.isSecondLevel,
            options: item.options,
            // subOptions: item.subOptions,
            // isThirdLevel: item.isThirdLevel,
            // thirdLevels: item.thirdLevels,
            // isFormChecked: item.isFormChecked,
          });
          //  this.SingleSelectModal = new FormGroup({
          //       title: new FormControl('', Validators.required),
          //       options: new FormArray([], Validators.required), // First Level Chips
          //       isSecondLevel: new FormControl(false),
          //       isThirdLevel: new FormControl(false),
          //       subOptions: new FormArray([], Validators.required), // Second Level Array
          //       isFormChecked: new FormControl(false),
          //       isRequired: new FormControl(false),
          //       type: new FormControl('singleSelect'),
          //     });
          // Clear existing arrays
          this.optionsArray.clear();
          this.subOptionsArray.clear();
          // Populate options
          if (item.options && Array.isArray(item.options)) {
            item.options.forEach((opt: any) => {
              this.optionsArray.push(new FormControl(opt));
              this.subOptionsArray.push(
                new FormGroup({
                  title: new FormControl(opt),
                  secondLevelOptions: new FormArray([]),
                  isThirdLevel: new FormControl(false),
                  thirdLevels: new FormArray([]),
                })
              );
            });
          }
          this.OpenSingleSelectModal();
          break;
        default:
          // Fallback to prompt for unknown types
          const newValue = prompt('Edit description:', item.title);
          if (newValue !== null && newValue.trim() !== '') {
            item.title = newValue.trim();
            localStorage.setItem('description val', JSON.stringify(this.submittedMetaData));
          }
          break;
      }
    }
    this.openMenuId.set(null); // close menu after edit
  }
  public OpenScoringModal(): void {
    this.isScoringModalOpened.update((c: any) => !c);
    this.isToggleScoringOpen.update((c: any) => !c);
  }
  public closeScoringModal(): void {
    this.isScoringModalOpened.set(false);
  }
  //used method to submit scoring sections
  public SubmitScoring(): void {
    if (this.scoringForm.valid) {
      const desc = this.scoringForm.get('description')?.value;
      const id = Date.now();
      if (desc || id) {
        const newSection = { id, value: desc, criteria: [] };
        this.scoringArray.set([...this.scoringArray(), newSection]);
        this.saveScoringToLocal();
      }
      this.scoringForm.reset();
      this.closeScoringModal();
    }
  }
  private saveScoringToLocal(): void {
    localStorage.setItem('scoringData', JSON.stringify(this.scoringArray));
  }
  public toggleScoringMenu(id: number): void {
    this.openScoringMenuId.set(this.openScoringMenuId() === id ? null : id);
  }
  public editScoring(id: number): void {
    const item = this.scoringArray().find((x: any) => x.id === id);
    if (item) {
      const newVal = prompt('Edit Scoring ', item.value);
      if (newVal !== null && newVal.trim() !== '') {
        item.value = newVal.trim();
        localStorage.setItem('scoringData', JSON.stringify(this.SubmitScoring));
      }
      this.scoringForm.patchValue({ description: item.value, id: item.id });
      // this.OpenScoringModal();
      this.openMenuId.set(null);
    }
  }
  public closeScoringMenu(): void {
    this.openScoringMenuId.set(null);
  }
  public closeCriteriaMenu(): void {
    this.openCriteriaMenuId.set(null);
  }
  // Delete
  public deleteScoring(id: number): void {
    this.scoringArray.set(this.scoringArray().filter((x: any) => x.id !== id));
    this.saveScoringToLocal();
  }
  public criteriaForm = new FormGroup({
    description: new FormControl('', { nonNullable: true }),
    autofill: new FormControl(false, { nonNullable: true }),
    type: new FormControl('', { nonNullable: true }),
    method: new FormControl('', { nonNullable: true }),
    option: new FormControl('', { nonNullable: true }),
  });
  public openCriteriaModal(sectionId: number) {
    this.activeSectionId = sectionId;
    this.criteriaForm.reset();
    this.criteriaModalOpen.set(true);
  }
  public closeCriteriaModal() {
    this.criteriaModalOpen.set(false);
    this.editingCriteriaId = null;
    this.criteriaForm.reset();
    this.activeSectionId = null;
  }
  public isCriteriaModalOpened() {
    return this.criteriaModalOpen();
  }
  public saveCriteria() {
    const formValue = this.criteriaForm.value;
    const section = this.scoringArray().find((s: any) => s.id === this.activeSectionId);
    if (!section) return;
    if (this.editingCriteriaId) {
      //  Update existing item
      section.criteria = section.criteria.map((c: any) =>
        c.id === this.editingCriteriaId
          ? {
              ...c,
              description: formValue.description,
              autofill: formValue.autofill,
              type: formValue.type,
              method: formValue.method,
              option: formValue.option,
            }
          : c
      );
    } else {
      //  Add new item
      const newCriteria = {
        id: Date.now(),
        description: formValue.description,
        autofill: formValue.autofill,
        type: formValue.type,
        method: formValue.method,
        option: formValue.option,
        value: 0,
        percentage: 0,
      };
      section.criteria.push(newCriteria);
    }

    // Reset modal + states
    this.criteriaForm.reset();
    this.editingCriteriaId = null;
    this.activeSectionId = null;
    this.criteriaModalOpen.set(false);
    this.calculatePercentages(section.id); //
  }
  public deleteCriteria(sectionId: number, criteriaId: number) {
    const updated = this.scoringArray().map((section: any) =>
      section.id === sectionId
        ? { ...section, criteria: section.criteria.filter((c: any) => c.id !== criteriaId) }
        : section
    );
    this.scoringArray.set(updated);
    this.calculatePercentages(sectionId);
    localStorage.setItem('scoringArray', JSON.stringify(updated));
  }
  public toggleCriteriaMenu(criteriaId: number) {
    this.openCriteriaMenuId.set(this.openCriteriaMenuId() === criteriaId ? null : criteriaId);
  }
  public editCriteria(sectionId: number, criteriaId: number) {
    const section = this.scoringArray().find((s: any) => s.id === sectionId);
    const criteria = section?.criteria.find((c: any) => c.id === criteriaId);
    if (criteria) {
      this.criteriaForm.patchValue({
        description: criteria.description,
        autofill: criteria.autofill,
        type: criteria.type || '',
        method: criteria.method || '',
        option: criteria.option || '',
      });
      this.activeSectionId = sectionId;
      this.editingCriteriaId = criteriaId;
      this.criteriaModalOpen.set(true);
    }
  }
  public canSaveScorecard(): boolean {
    const sections = this.scoringArray();
    if (!sections || sections.length === 0) {
      return false;
    }
    // ensure each section has at least one criteria
    for (const s of sections) {
      if (!s.criteria || s.criteria.length === 0) {
        return false;
      }
    }
    return true;
  }
  //Method to save only score card...
  public SaveOnlyScoreCard(): void {
    console.log('save only scorecard..');
    this.saveErrorMessage.set(null);
    const sections = this.scoringArray();
    if (!sections || sections.length === 0) {
      const msg = 'Error: Please add at least one scoring section before saving.';
      console.error(msg);
      this.saveErrorMessage.set(msg);
      return;
    }
    const sectionsWithoutCriteria = sections.filter(
      (sec: any) => !sec.criteria || sec.criteria.length === 0
    );
    if (sectionsWithoutCriteria.length > 0) {
      // Build a helpful message listing offending sections (by id or value)
      const ids = sectionsWithoutCriteria.map((s: any) => s.id ?? s.value ?? 'unknown').join(', ');
      const msg = `Error: Please add criteria for the following section(s) before saving: ${ids}`;
      console.error(msg);
      this.saveErrorMessage.set(msg);
      return;
    }
    try {
      // Recalculate totals/percentages before final submit (optional, but recommended)
      for (const sec of sections) {
        // ensure totals and percentages up-to-date
        this.calculatePercentages(sec.id);
        this.calculateTotal(sec.id);
      }

      const payload = {
        id: this.AddScoreCardID,
        _id: this.AddScoreCardID,
        title: this.APIDATA().title,
        description: this.APIDATA().description,
        isPublished: false,
        isActive: false,
        metaData: this.submittedMetaData.map((meta) => ({
          id: meta.id,
          fieldType: meta.fieldType,
          title: meta.title,
          isRequired: Boolean(meta.isRequired),
          isSecondLevel: Boolean(meta.isSecondLevel),
          options: meta.options || [],
        })),
        criterias: this.transformScoringToAPIFormat(sections),
      };
      // Diagnostic logs to inspect payload before sending
      try {
        console.log('DEBUG: final payload.metaData items:', payload.metaData);
        console.log(
          'DEBUG: metaData keys per item:',
          payload.metaData.map((m: any) => Object.keys(m))
        );
        console.log('DEBUG: final payload JSON:', JSON.stringify(payload));
      } catch (e) {
        console.log('DEBUG: payload serialization error', e);
      }
      this.editscorecard.UpdateScoreCard(payload, this.authkey).subscribe({
        next: (response: any): void => {
          console.log('hey how are you this is my response ....', response);
          console.log(this.AddScoreCardID);
          // this.APIDATA.set(response.data);
          // console.log(this.APIDATA());
        },
        error: (error: any) => {
          console.log(error);
        },
      });
      this.router.navigate(['scorecardnew']);
      // Show in console (or call API here)
      console.log('SaveOnlyScoreCard - payload ready:', payload);
      // Example: Save locally (you already have helper)
      localStorage.setItem('scorecardPayload', JSON.stringify(payload));
      // Optionally show success message (console)
      console.log('Scorecard saved successfully.');
      // Clear error flag if any
      this.saveErrorMessage.set(null);
    } catch (err) {
      console.error('Save error:', err);
      this.saveErrorMessage.set('Error while saving, check console for details.');
    } finally {
    }
  }
  // new code starts
  public sectionTotals: Record<number, number> = {};
  public sectionPercentages: Record<number, number> = {};
  calculatePercentages(sectionId: number) {
    const section = this.scoringArray().find((s: any) => s.id === sectionId);
    if (!section) return;
    const totalItems = section.criteria.length;
    if (totalItems === 0) return;
    const percentage = +(100 / totalItems).toFixed(2);
    // assign this percentage to every criteria in that section
    section.criteria.forEach((c: any) => (c.percentage = percentage));
    // store for easy access
    this.sectionPercentages[sectionId] = percentage;
  }
  calculateTotal(sectionId: number) {
    const section = this.scoringArray().find((s) => s.id === sectionId);
    if (!section) return;

    const total = section.criteria.reduce((sum, c) => sum + (Number(c.value) || 0), 0);
    this.sectionTotals[sectionId] = total;
  }
  getGrandTotal(): number {
    return Object.values(this.sectionTotals).reduce((sum, total) => sum + total, 0);
  }
  getSectionTotal(sectionId: number): number {
    return this.sectionTotals[sectionId] || 0;
  }
  onCriteriaValueChange(sectionId: number, criteriaId: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const newValue = Number(input.value) || 0;

    const section = this.scoringArray().find((s) => s.id === sectionId);
    if (!section) return;

    //  Update the specific criteria value
    const criteria = section.criteria.find((c) => c.id === criteriaId);
    if (criteria) {
      criteria.value = newValue;
    }
    //  Recalculate the total
    this.calculateTotal(sectionId);
  }
  // ===== TRANSFORMATION FUNCTION FOR API PAYLOAD =====
  private transformScoringToAPIFormat(sections: ScoringItems[]): any[] {
    return sections.map((section) => ({
      type: section.criteria[0]?.type || 'customerExperience', // Must be: customerExperience or compliance
      title: section.value,
      method: section.criteria[0]?.method || 'numeric',
      option: section.criteria[0]?.option || 'none',
      totalScore: this.getSectionTotal(section.id),
      scoringSections: [
        {
          title: section.value,
          details: section.criteria.map((crit: any) => ({
            description: crit.description,
            score: crit.value,
            scoringPercentage: crit.percentage,
            prompt: crit.description,
            isAutoFail: crit.autofill,
            uniqueId: crit.id.toString(),
            definition: {
              title: crit.description,
              description: crit.description,
              descriptions: [],
            },
          })),
        },
      ],
    }));
  }
  public isEditModalOpen = signal(true);
  public OpenEditModal(): void {
    this.isEditModalOpen.set(true);
    console.log('setting clicked');
  }
  public closeEditModal(): void {
    this.isEditModalOpen.set(false);
  }
  public EditFormSubmit(): void {
    console.log('Edit ...Form Submitted');
    console.log('Our data of form is ', this.EditFormData.value);
    this.editscorecard.ScoreCardSetting(this.EditFormData.value, this.authkey).subscribe({
      next: (response: any): void => {
        console.log('hey how are you this is my response ....', response);
        // this.APIDATA.set(response.data);
        // console.log(this.APIDATA());
      },
      error: (error: any) => {
        console.log(error);
      },
    });
    this.isEditModalOpen.set(false);
    this.router.navigate(['scorecardnew']);
    // scorecardnew
  }
}
