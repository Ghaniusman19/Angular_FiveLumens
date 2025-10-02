import { editscorecard } from './../../../services/editscorecard';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MetaData } from '../../user';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-addscorecard',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './addscorecard.html',
  styleUrl: './addscorecard.css',
})
export class Addscorecard implements OnInit, OnDestroy {
  //variables used in the page
  public AddScoreCardID: string | null = '';
  private routeSubscription: Subscription | undefined;
  public metaDataScoreCard: FormGroup;
  public submittedMetaData: MetaData[] = [];
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
  public openMenuId = signal<string | null>(null);
  public scoringForm: FormGroup;
  public scoringArray = signal<{ id: number; value: string; criteria: any[] }[]>([]);
  public isScoringModalOpened = signal<boolean>(false);
  public openScoringMenuId = signal<number | null>(null);
  public criteriaModalOpen = signal(false);
  public activeSectionId = signal<number | null>(null);
  public http = inject(HttpClient);
  public router = inject(Router);
  public route = inject(ActivatedRoute);
  public authorization = localStorage.getItem('authToken');
  public authkey: any = this.authorization;
  //constructor method calls very first when the page loads
  constructor(private editscorecard: editscorecard) {
    console.log('add scorecard page called!');
    console.log(this.AddScoreCardID);
    this.metaDataScoreCard = new FormGroup({
      id: new FormControl(Math.random()),
      description: new FormControl(''),
    });

    this.scoringForm = new FormGroup({
      id: new FormControl(Date.now()),
      description: new FormControl(''),
    });
  }
  //ngOnIniT methods triggers first and then when any event happens and change ...
  ngOnInit(): void {
    this.routeSubscription = this.route.queryParams.subscribe((params) => {
      this.AddScoreCardID = params['id'];
      const editPayload = { id: this.AddScoreCardID };
      this.editscorecard.EditScoreCard(editPayload, this.authkey).subscribe({
        next: (response: any): void => {
          console.log('hey how are you this is my response ....', response);
          this.APIDATA.set(response.data);
          console.log(this.APIDATA());
        },
        error: (error: any) => {
          console.log(error);
        },
      });
    });
    this.getDatafromLocalStorage();
    // this.getScoringFromLocal();
  }
  //ngOnDestroy
  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
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
  private getDatafromLocalStorage() {
    const storedData = localStorage.getItem('description val');
    if (storedData) {
      this.submittedMetaData = JSON.parse(storedData);
    }
  }
  private SaveDataToLocalStorage() {
    localStorage.setItem('description val', JSON.stringify(this.submittedMetaData));
  }
  //Method to submit meta data form
  public SubmitmetaData() {
    console.log(this.metaDataScoreCard.value);
    this.closeMetaDataModal();
    if (this.metaDataScoreCard.valid) {
      const descriptionValue = this.metaDataScoreCard.get('description')?.value;
      const id = Math.random().toString(36).substring(2, 9);

      const newMetaData = {
        id: id,
        value: descriptionValue,
      };
      if (descriptionValue || id) {
        this.submittedMetaData.push(newMetaData);
      }
      this.SaveDataToLocalStorage();
      this.metaDataScoreCard.reset({ id: Math.random(), description: '' });
    }
  }
  public ToggleScoring() {
    this.isToggleScoringOpen.update((cVal) => !cVal);
    console.log('toggle scoring...');
  }
  public toggleMenu(id: string) {
    if (this.openMenuId() === id) {
      this.openMenuId.set(null); // close if same menu is clicked again
    } else {
      this.openMenuId.set(id);
    }
  }
  public deleteItem(id: string) {
    this.submittedMetaData = this.submittedMetaData.filter((item) => item.id !== id);
    localStorage.setItem('description val', JSON.stringify(this.submittedMetaData));
    this.openMenuId.set(null); // close menu after delete
  }
  public editItem(id: string) {
    const item = this.submittedMetaData.find((m) => m.id === id);
    if (item) {
      const newValue = prompt('Edit description:', item.value);
      if (newValue !== null && newValue.trim() !== '') {
        item.value = newValue.trim();
        localStorage.setItem('description val', JSON.stringify(this.submittedMetaData));
      }
    }
    this.openMenuId.set(null); // close menu after edit
  }
  public OpenScoringModal(): void {
    this.isScoringModalOpened.update((c) => !c);
    this.isToggleScoringOpen.update((c) => !c);
  }
  public closeScoringModal(): void {
    this.isScoringModalOpened.set(false);
  }
  //used method to submit scoring sections
  public SubmitScoring() {
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
  private saveScoringToLocal() {
    localStorage.setItem('scoringData', JSON.stringify(this.scoringArray));
  }
  // private getScoringFromLocal() {
  //   const stored = localStorage.getItem('scoringData');
  //   if (stored) {
  //     this.scoringArray = JSON.parse(stored);
  //   }
  // }
  public toggleScoringMenu(id: number) {
    this.openScoringMenuId.set(this.openScoringMenuId() === id ? null : id);
  }
  public editScoring(id: number) {
    const item = this.scoringArray().find((x) => x.id === id);
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
  // Delete
  public deleteScoring(id: number) {
    this.scoringArray.set(this.scoringArray().filter((x) => x.id !== id));
    this.saveScoringToLocal();
  }
  public criteriaForm = new FormGroup({
    description: new FormControl('', { nonNullable: true }),
    autofill: new FormControl(false, { nonNullable: true }),
  });
  public openCriteriaModal(sectionId: number) {
    this.activeSectionId.set(sectionId);
    this.criteriaForm.reset();
    this.criteriaModalOpen.set(true);
  }
  public closeCriteriaModal() {
    this.criteriaModalOpen.set(false);
  }
  public isCriteriaModalOpened() {
    return this.criteriaModalOpen();
  }
  public submitCriteria() {
    if (this.criteriaForm.valid && this.activeSectionId()) {
      const newCriteria = {
        id: Date.now(),
        description: this.criteriaForm.value.description,
        autofill: this.criteriaForm.value.autofill,
      };

      const updated = this.scoringArray().map((section) =>
        section.id === this.activeSectionId()
          ? { ...section, criteria: [...(section.criteria || []), newCriteria] }
          : section
      );

      this.scoringArray.set(updated);
      localStorage.setItem('scoringArray', JSON.stringify(updated));
      this.closeCriteriaModal();
    }
  }
  public deleteCriteria(sectionId: number, criteriaId: number) {
    const updated = this.scoringArray().map((section) =>
      section.id === sectionId
        ? { ...section, criteria: section.criteria.filter((c) => c.id !== criteriaId) }
        : section
    );
    this.scoringArray.set(updated);
    localStorage.setItem('scoringArray', JSON.stringify(updated));
  }
  public toggleCriteriaMenu(criteriaId: number) {
    this.openCriteriaMenuId.set(this.openCriteriaMenuId() === criteriaId ? null : criteriaId);
  }
  public editCriteria(sectionId: number, criteriaId: number) {
    const section = this.scoringArray().find((s) => s.id === sectionId);
    const criteria = section?.criteria.find((c) => c.id === criteriaId);

    if (criteria) {
      this.criteriaForm.patchValue({
        description: criteria.description,
        autofill: criteria.autofill,
      });
      this.activeSectionId.set(sectionId);
      // delete old criteria before editing
      this.deleteCriteria(sectionId, criteriaId);

      this.criteriaModalOpen.set(true);
    }
  }
}
