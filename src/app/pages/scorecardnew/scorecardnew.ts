import { ScorecardData } from './../../../services/scorecard-data';
import { FetchAPIData } from '../../../services/fetch-apidata';
import { ToggleStatus } from '../../../services/toggle-status';
import { IsActive } from '../../../services/is-active';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Addscorecard } from '../../../services/addscorecard';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
// import { NgZone } from '@angular/core';
@Component({
  selector: 'app-scorecardnew',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './scorecardnew.html',
  styleUrl: './scorecardnew.css',
})
export class Scorecardnew implements OnInit {
  constructor(
    private groups: FetchAPIData,
    private ScorecardData: ScorecardData,
    private addScorecard: Addscorecard,
    // private delscorecard: Deletescorecard,
    // private ngZone: NgZone,
    private toggleStatus: ToggleStatus,
    private isActive: IsActive
  ) {
    console.log('scorecard New Constructor Called');
  }

  public http = inject(HttpClient);
  public authorization = localStorage.getItem('authToken');
  public authkey: any = this.authorization;
  public router = inject(Router);
  public isActiveModal = signal(false);
  public selectedRowId = signal<string | null>(null);
  public is3DotDropdown = signal<string | null>(null);
  public isActiveStatusModal = signal<string | null>(null);
  //state to change clone ... modal toggle state
  public isCloneModalOpen = signal<string | null>(null);
  public isEvaluateModalOpen = signal<string | null>(null);
  //This is to show the notification of delete scorecard row
  public notification = signal<string | null>(null);
  public filterToggle = signal(false);
  // public activeModalId = signal<string | null>(null);
  public pendingStatus: boolean = false;
  //This is the variable to hide and show the modal of scorecard
  public scData = signal<any[]>([]);
  public groupsdata: any[] = [];
  public currentPage = signal(1); // default first page
  public pageSize = signal(25); // default page size
  public totalItems = signal(0);
  public teamsData: any[] = [];
  public userData: any[] = [];
  public scorecardFormArray: any[] = [];
  public titlename = signal<string>('');

  //This method is to fetch API for the pagination
  ngOnInit(): void {
    this.fetchData();
    this.getAllTeams();
    this.getAllUsers();
    console.log('ng on in it called console');
    if (!this.authorization) {
      console.error('Authorization token is missing');
      return;
    }
    const formData = new FormData();
    formData.append('isActive', 'true');
    formData.append('page', this.currentPage().toString());

    //This is the code of the fetching of the scorecard  by post method
    this.ScorecardData.scoreCardData(formData, this.authkey).subscribe({
      next: (response: any): void => {
        const activeData = (response?.data?.collection || []).filter(
          (item: any) => item.isActive === true
        );
        this.scData.set(activeData);
        console.log('API Response of scorecard data 1111:', this.scData()); // Log to console
        // this.ngZone.run(() => {

        // });
      },
      error: (error: any) => {
        console.error('API Error:', error);
      },
    });
    //This is the code of the fetching of the groups  by get method
    this.groups.fetchGroupsData(this.authkey).subscribe({
      next: (data: any): void => {
        this.groupsdata = data.data;
        this.selectAllGroupsInCloneForm();

        console.log('API response of the group data ', this.groupsdata);
      },
      error: (err: any) => {
        console.log(err);
      },
    });
    this.scorecardForm.get('scoringModel')?.valueChanges.subscribe((val: any) => {
      this.handleRemove(val);
    });
  }
  public fetchData(): void {
    const formData = new FormData();
    formData.append('isActive', 'true');
    formData.append('page', this.currentPage().toString());
    formData.append('perPage', this.pageSize().toString());
    this.ScorecardData.scoreCardData(formData, this.authkey).subscribe({
      next: (response: any): void => {
        this.scData.set(response?.data?.collection || []);
        this.totalItems.set(response?.data?.pagination?.total);
        console.log(this.totalItems(), ' these are our total items');
        // total count from API
        console.log('Paginated Data:', this.scData());
        // this.ngZone.run(() => {

        // });
      },
      error: (error: any) => {
        console.error('API Error in fetchData:', error);
      },
    });
  }
  public getAllTeams(): void {
    this.groups.getAllTeams(this.authkey).subscribe({
      next: (data: any): void => {
        this.teamsData = data.data;
        console.log(this.teamsData, 'This is our teams data again');
      },
      error: (error: any) => {
        console.error('API Error in fetchData:', error);
      },
    });
  }
  public getAllUsers(): void {
    this.groups.getAllUsers(this.authkey).subscribe({
      next: (data: any): void => {
        this.userData = data.data;
        console.log(this.userData, 'This is our userData data again');
      },
      error: (error: any) => {
        console.error('API Error in fetchData:', error);
      },
    });
  }
  public changePageSize(event: Event): void {
    console.log(event, 'this is our event...');
    const value = Number((event.target as HTMLSelectElement).value);
    this.pageSize.set(value);
    this.currentPage.set(1); // reset to first page
    this.fetchData();
  }
  public previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((v) => v - 1);
      this.fetchData();
    }
  }
  public nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((v) => v + 1);
      this.fetchData();
    }
  }
  public totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));
  //This is called when class and components load just like useefect ...
  convertToFormData(obj: any): FormData {
    const formData = new FormData();
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        formData.append(key, obj[key]);
      }
    }
    return formData;
  }

  OpenModalStatus(event: Event, item: any) {
    console.log(item);
    const id = item._id;
    event.stopPropagation();
    event.preventDefault();
    this.pendingStatus = !item.isActive;
    if (this.isActiveStatusModal() === id) {
      // agar same row pe dobara click ho to close kar do
      this.isActiveStatusModal.set(null);
      this.selectedRowId.set(null);
    } else {
      this.isActiveStatusModal.set(id);
      this.selectedRowId.set(null);
    }
    console.log('This is my toggle state id', id);
  }

  confirmToggle(item: string): void {
    //store open Modal ID..
    console.log(item);
    console.log(item, 'this is the item..');
    const formVal = new FormData();
    formVal.append('id', item);
    this.isActiveStatusModal.set(null);
    this.toggleStatus.ToggleActiveState(formVal, this.authkey).subscribe({
      next: (response: any): void => {
        console.log('This is the response of the toggle status', response);
      },
      error: (error: any): void => {
        console.log('This is the Error.. of the toggle status', error);
      },
    });
  }
  cancelToggle(item: string): void {
    console.log(item);
    this.isActiveStatusModal.set(null);
  }
  //This is to close the status check Modal...
  public handleRemove(val: any): void {
    if (val === 'audit') {
      this.scorecardForm.removeControl('coachingForm');
    }
  }
  //code for the opening and closing of the modal add scorecard....
  public OpenModal(): void {
    this.isActiveModal.update((currentVal) => !currentVal);
  }
  public closeModal(): void {
    this.isActiveModal.update((currentVal) => !currentVal);
  }
  //code for the opening and closing of the 3 dot dropdown
  public Open3DotDropDown(id: string): void {
    if (this.is3DotDropdown() === id) {
      // agar same row pe dobara click ho to close kar do
      this.is3DotDropdown.set(null);
      this.selectedRowId.set(null);
    } else {
      this.is3DotDropdown.set(id);
      this.selectedRowId.set(id);
    }
    console.log('this is my id', id);
  }
  //This is the function to view scorecard
  public View(id: string): void {
    console.log(id);
    console.log('page gone to dashboard', this.selectedRowId());
    this.router.navigate(['view'], { queryParams: { id: this.selectedRowId() } });
  }
  //This is the function to delete scorecard
  public DeleteScorecard(id: string): void {
    console.log('this is the delete id key  ', id);
    const formdata = new FormData();
    formdata.append('id', id);
    // const delID = { id: id };
    this.notification.set('Removed successfully!');
    this.addScorecard.Deletescorecard(formdata, this.authkey).subscribe({
      next: (Response: any): void => {
        console.log('this is the respomse from delete api', Response);
        this.notification.set(null);
      },
      error: (error: any) => {
        console.log('this is the error from delete api', error);
      },
    });
  }
  //This is the funcpublic tion to Edit scorecard
  public EditScorecard(id: string): void {
    console.log('this is the Edit id key  ', id);
    this.router.navigate(['edit'], { queryParams: { id: this.selectedRowId() } });
    // this.router.navigate(['addscorecard'], { queryParams: { id: this.selectedRowId() } });
  }
  public CloneScoreCad(id: any): void {
    console.log(id);
    this.isActive.isActiveData(this.authkey).subscribe({
      next: (response: any): void => {
        console.log('this is the response of the is active API..', response);
      },
      error: (error: any) => {
        console.log('this is the error from isActive api', error);
      },
    });
    this.groups.fetchGroupsData(this.authkey).subscribe({
      next: (data: any): void => {
        // this.groupsdata = data.data;
        console.log('API response of the group data ', data);
        // this.groupsdata
      },
      error: (err: any) => {
        console.log(err);
      },
    });
    if (this.isCloneModalOpen() === id) {
      this.isCloneModalOpen.set(null);
      this.selectedRowId.set(null);
    } else {
      this.isCloneModalOpen.set(id);
      this.selectedRowId.set(id);
    }
  }
  public closeClone(id: any): void {
    console.log(id);
    this.isCloneModalOpen.set(null);
  }
  public closeEvaluate(id: any): void {
    console.log(id);
    this.isEvaluateModalOpen.set(null);
  }
  //This is to close the 3 dot dropdown
  public close3DotDropDown(): void {
    this.is3DotDropdown.set(null);
  }
  EvaluateScorecard(id: string, item: any): void {
    const scItemdata = item.title;
    console.log(scItemdata);
    console.log(id);
    if (this.isEvaluateModalOpen() === id) {
      this.isEvaluateModalOpen.set(null);
      this.selectedRowId.set(null);
    } else {
      this.isEvaluateModalOpen.set(id);
      this.selectedRowId.set(id);
      this.titlename.set(scItemdata);
      console.log(this.titlename(), 'ye mene title ka name print krwaya hai');
    }
    // this.router.navigate(['evaluate'], { queryParams: { id: id } });
  }
  public FilterToggle(): void {
    console.log('filter clicked');
    this.filterToggle.update((currentVal) => !currentVal);
  }
  public closeFilter(): void {
    console.log('Filter Modal is Closed...');
    this.filterToggle.update((currentVal) => !currentVal);
  }
  //This is the model of the reactive form of the Filter of Scorecard Page.....
  public filterForm: FormGroup = new FormGroup({
    evaluationTypeFilter: new FormControl(''),
    scoringModelFilter: new FormControl(''),
    groups: new FormArray([]),
    isActive: new FormControl(''),
  });
  public scorecardForm: FormGroup = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl(''),
    evaluationType: new FormControl(''),
    scoringModel: new FormControl(''),
    coachingForm: new FormControl(''),
    visibleToManagers: new FormControl(false),
    coachingPurposeOnly: new FormControl(false),
    groups: new FormArray([]),
    isActive: new FormControl(true),
    isAllGroups: new FormControl(false),
  });
  public scorecardFormclone: FormGroup = new FormGroup({
    id: new FormControl(''),
    title: new FormControl('', Validators.required),
    description: new FormControl(''),
    evaluationType: new FormControl(''),
    scoringModel: new FormControl(''),
    coachingForm: new FormControl(''),
    visibleToManagers: new FormControl(false),
    coachingPurposeOnly: new FormControl(false),
    groups: new FormArray([]),
    isActive: new FormControl(true),
    isAllGroups: new FormControl(true),
  });
  public scorecardFormEvaluate: FormGroup = new FormGroup({
    id: new FormControl(''),
    title: new FormControl(''),
    evaluationType: new FormControl(''),
    groups: new FormArray([]),
    teams: new FormArray([]),
    users: new FormControl(''),
    isActive: new FormControl(true),
    isAllGroups: new FormControl(true),
    isAllteams: new FormControl(true),
  });
  public filterScorecardSubmit(): void {
    console.log('Filter Scorecard Submit');

    // const formValues = this.filterForm.value;
    const formValues = new FormData();
    formValues.append('isActive', this.filterForm.value.isActive);
    formValues.append('evaluationTypeFilter', this.filterForm.value.evaluationTypeFilter);
    formValues.append('scoringModelFilter', this.filterForm.value.scoringModelFilter);
    formValues.append('page', this.currentPage().toString());
    if (Array.isArray(this.filterForm.value.groups)) {
      this.filterForm.value.groups.forEach((groupId: string, index: number) => {
        formValues.append(`groups[${index}]`, groupId);
      });
    }
    this.ScorecardData.scoreCardData(formValues, this.authkey).subscribe({
      next: (response: any): void => {
        console.log('This is the response of the scorecard filter', response);
        this.scData.set(response?.data?.collection);
        this.totalItems.set(response?.data?.pagination?.total);
        console.log('API Response of scorecard data:', this.scData());
      },
      error: (error: any) => {
        console.log('This is the error of the scorecard filter', error);
      },
    });
    this.filterToggle.update((currentVal) => !currentVal);
    this.filterForm.reset();
  }
  public scorecardSubmitclone(): void {
    console.log('button submit .....');
    if (this.scorecardFormclone) {
      console.log(this.selectedRowId());
      this.scorecardFormclone.get('id')?.setValue(this.selectedRowId());
      console.log(this.scorecardFormclone.value, 'clone scorecard form values');
      console.log('again clicked...');

      this.addScorecard.CloneScoreCard(this.scorecardFormclone.value, this.authkey).subscribe({
        next: (response: any): void => {
          console.log('this is the response from clone api', response);
        },
        error: (error: any) => {
          console.log('this is the error from clone api', error);
        },
      });
      this.scorecardFormclone.reset();
      this.isCloneModalOpen.set(null);
      // const scorecardPayload = { FormData: this.scorecardForm.value };
      // const formValues = this.scorecardFormclone.value;
      // console.log(formValues);
      //This is the code to convert json form key value data into formdata format
    }
  }
  //This is to be the search function functionality...
  public onSearchInput(event: Event): void {
    const searchItem = (event.target as HTMLInputElement).value;
    console.log(searchItem);
    const searchPayload = new FormData();
    searchPayload.append('isActive', this.scorecardForm.value.isActive);
    searchPayload.append('search', searchItem);

    this.ScorecardData.scoreCardData(searchPayload, this.authkey).subscribe({
      next: (response: any): void => {
        const activeData = (response?.data?.collection || []).filter(
          (item: any) => item.isActive === true
        );
        this.scData.set(activeData);
        this.totalItems.set(response?.data?.pagination?.total);
        console.log('API Response of scorecard data:', this.scData()); // Log to console
      },
      error: (error: any) => {
        console.error('API Error:', error);
      },
    });
  }
  //This is the model of the reactive form of AddScorecard...

  public scorecardSubmitEvaluate(item: any): void {
    console.log(item);
    console.log('Evaluate Submit Clicked');
    if (this.scorecardFormEvaluate) {
      console.log(this.selectedRowId());
      this.scorecardFormEvaluate.get('id')?.setValue(this.selectedRowId());
      this.scorecardFormEvaluate.get('title')?.setValue(this.titlename());
      // this.scorecardFormEvaluate
      //   .get('title')
      //   ?.setValue(this.scData().find((item) => item._id === this.selectedRowId()).title);
      console.log(this.scorecardFormEvaluate.value, 'evaluate scorecard form values');
      this.scorecardFormEvaluate.reset();
      this.isEvaluateModalOpen.set(null);
    }
  }
  get groupsArray(): FormArray {
    return this.scorecardForm.get('groups') as FormArray;
  }
  //This is the method to change the groups and  onGroupsChange called
  public onGroupCheckboxChange(id: string, event: Event) {
    const groupsArray = this.scorecardForm.get('groups') as FormArray;
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
    this.scorecardForm.get('isAllGroups')?.setValue(this.isAllSelected());
    console.log('Groups in FormArray:', groupsArray.value);
  }
  public onGroupCheckboxChangeEvaluate(id: string, event: Event) {
    const groupsArray = this.scorecardFormEvaluate.get('groups') as FormArray;
    const checkbox = event.target as HTMLInputElement;

    if (checkbox.checked) {
      groupsArray.push(new FormControl(id));

      this.groups.AllUsersPost(this.authkey, groupsArray).subscribe({
        next: (response: any): void => {
          console.log(response, 'This is the response of all users api in evaluate form');
        },
        error: (error: any) => {
          console.error('API Error in fetchData:', error);
        },
      });
    } else {
      const index = groupsArray.controls.findIndex((c) => c.value === id);
      if (index !== -1) {
        groupsArray.removeAt(index);
      }
    }

    // Update Select All flag
    this.scorecardFormEvaluate.get('isAllGroups')?.setValue(this.isAllSelected());
    console.log('Groups in FormArray:', groupsArray.value);
  }
  public onGroupCheckboxChangeTeams(id: string, event: Event) {
    const groupsArray = this.scorecardFormEvaluate.get('teams') as FormArray;
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
    this.scorecardFormEvaluate.get('isAllteams')?.setValue(this.isAllSelected());
    console.log('Groups in FormArray:', groupsArray.value);
  }
  public onSelectAllChange(event: Event) {
    const groupsArray = this.scorecardForm.get('groups') as FormArray;
    const checkbox = event.target as HTMLInputElement;
    groupsArray.clear();
    if (checkbox.checked) {
      this.groupsdata.forEach((g) => groupsArray.push(new FormControl(g._id)));
      this.scorecardForm.get('isAllGroups')?.setValue(true);
    } else {
      this.scorecardForm.get('isAllGroups')?.setValue(false);
    }
    console.log('Groups in FormArray:', groupsArray.value);
  }
  public onSelectAllChangeEvaluate(event: Event) {
    const groupsArray = this.scorecardFormEvaluate.get('groups') as FormArray;
    const checkbox = event.target as HTMLInputElement;
    groupsArray.clear();
    if (checkbox.checked) {
      console.log('values checked');
      this.groupsdata.forEach((g) => groupsArray.push(new FormControl(g._id)));
      // const formdata = new FormData();
      // this.groupsArray.forEach(item => {
      //   formdata.append('groups', item);
      // })

      this.scorecardFormEvaluate.get('isAllGroups')?.setValue(true);
      this.groups.AllUsersPost(this.authkey, this.groupsArray.value).subscribe({
        next: (response: any): void => {
          console.log(response, 'This is the response of all users api in evaluate form');
        },
        error: (error: any) => {
          console.error('API Error in fetchData:', error);
        },
      });
    } else {
      this.scorecardFormEvaluate.get('isAllGroups')?.setValue(false);
    }
    console.log('Groups in FormArray:', groupsArray.value);
  }
  public onSelectAllChangeTeams(event: Event) {
    const groupsArray = this.scorecardFormEvaluate.get('teams') as FormArray;
    const checkbox = event.target as HTMLInputElement;
    groupsArray.clear();
    if (checkbox.checked) {
      this.teamsData.forEach((g) => groupsArray.push(new FormControl(g._id)));
      this.scorecardFormEvaluate.get('isAllTeams')?.setValue(true);
    } else {
      this.scorecardFormEvaluate.get('isAllTeams')?.setValue(false);
    }
    console.log('Groups in FormArray:', groupsArray.value);
  }
  public selectAllGroupsInCloneForm(): void {
    const groupsArray = this.scorecardFormclone.get('groups') as FormArray;
    groupsArray.clear();
    this.groupsdata.forEach((g) => groupsArray.push(new FormControl(g._id)));
    this.scorecardFormclone.get('isAllGroups')?.setValue(true);
  }
  public isSelectedInClone(id: any): boolean {
    const groupsArray = this.scorecardFormclone.get('groups') as FormArray;
    return groupsArray.value.includes(id);
  }
  // Helper for checking if all groups are selected in the clone form
  public isAllSelectedInClone(): boolean {
    const groupsArray = this.scorecardFormclone.get('groups') as FormArray;
    return (
      this.groupsdata &&
      this.groupsdata.length > 0 &&
      groupsArray.value.length === this.groupsdata.length
    );
  }
  // Handler for select all checkbox in the clone form
  public onSelectAllChangeClone(event: Event): void {
    const groupsArray = this.scorecardFormclone.get('groups') as FormArray;
    const checkbox = event.target as HTMLInputElement;
    groupsArray.clear();
    if (checkbox.checked) {
      this.groupsdata.forEach((g: any) => groupsArray.push(new FormControl(g._id)));
      this.scorecardFormclone.get('isAllGroups')?.setValue(true);
    } else {
      this.scorecardFormclone.get('isAllGroups')?.setValue(false);
    }
    groupsArray.markAsDirty();
    groupsArray.markAsTouched();
  }
  // Handler for individual group checkbox in the clone form
  public onGroupCheckboxChangeClone(id: string, event: Event): void {
    const groupsArray = this.scorecardFormclone.get('groups') as FormArray;
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      if (!groupsArray.value.includes(id)) {
        groupsArray.push(new FormControl(id));
      }
    } else {
      const index = groupsArray.controls.findIndex((c) => c.value === id);
      if (index !== -1) {
        groupsArray.removeAt(index);
      }
    }
    // Update Select All flag
    this.scorecardFormclone.get('isAllGroups')?.setValue(this.isAllSelectedInClone());
    groupsArray.markAsDirty();
    groupsArray.markAsTouched();
  }
  //  Helper to check if a group is selected
  public isSelected(id: string): boolean {
    const groupsArray = this.scorecardForm.get('groups') as FormArray;
    return groupsArray.value.includes(id);
  }
  public isSelectedEvaluate(id: string): boolean {
    const groupsArray = this.scorecardFormEvaluate.get('groups') as FormArray;
    return groupsArray.value.includes(id);
  }
  public isSelectedTeams(id: string): boolean {
    const groupsArray = this.scorecardFormEvaluate.get('teams') as FormArray;
    return groupsArray.value.includes(id);
  }

  public isSelectEvaluate(id: string): boolean {
    const groupsArray = this.scorecardFormEvaluate.get('groups') as FormArray;
    return groupsArray.value.includes(id);
  }
  //  Helper to check Select All status
  public isAllSelected(): boolean {
    const groupsArray = this.scorecardForm.get('groups') as FormArray;
    return groupsArray.length === this.groupsdata.length;
  }

  public isAllSelectedEvaluate(): boolean {
    const groupsArray = this.scorecardFormEvaluate.get('groups') as FormArray;

    return groupsArray.length === this.groupsdata.length;
  }
  public isAllSelectedTeams(): boolean {
    const groupsArray = this.scorecardFormEvaluate.get('teams') as FormArray;
    return groupsArray.length === this.teamsData.length;
  }

  public onFilterGroupCheckboxChange(id: string, event: Event) {
    const groupsArray = this.filterForm.get('groups') as FormArray;
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      groupsArray.push(new FormControl(id));
    } else {
      const index = groupsArray.controls.findIndex((c) => c.value === id);
      if (index !== -1) {
        groupsArray.removeAt(index);
      }
    }

    console.log('Filter Groups in FormArray:', groupsArray.value);
  }
  public onFilterSelectAllChange(event: Event) {
    const groupsArray = this.filterForm.get('groups') as FormArray;
    const checkbox = event.target as HTMLInputElement;
    groupsArray.clear();

    if (checkbox.checked) {
      this.groupsdata.forEach((g) => groupsArray.push(new FormControl(g._id)));
    }

    console.log('Filter Groups in FormArray:', groupsArray.value);
  }
  //  Helpers for Filter
  public isFilterSelected(id: string): boolean {
    const groupsArray = this.filterForm.get('groups') as FormArray;
    return groupsArray.value.includes(id);
  }
  public isAllFilterSelected(): boolean {
    const groupsArray = this.filterForm.get('groups') as FormArray;
    return groupsArray.length === this.groupsdata.length && this.groupsdata.length > 0;
  }
  //This is the event / function to submit the form of add scorecard...
  public scorecardSubmit(): void {
    console.log('button submit .....');
    if (this.scorecardForm) {
      console.log(this.scorecardForm.value.groups, ' hey me');
      console.log('again clicked...');
      // const scorecardPayload = { FormData: this.scorecardForm.value };
      const formValues = this.scorecardForm.value;
      console.log(formValues);
      //This is the code to convert json form key value data into formdata format

      const formData = new FormData();
      for (const key in formValues) {
        if (formValues.hasOwnProperty(key)) {
          if (Array.isArray(formValues[key])) {
            formValues[key].forEach((val: any, index: number) => {
              formData.append(`${key}[${index}]`, val);
            });
          } else {
            formData.append(key, formValues[key]);
          }
        }
      }

      this.scorecardFormArray.push(this.scorecardForm.value);
      this.scorecardForm.reset();
      this.isActiveModal.update((currentVal) => !currentVal);
      this.addScorecard.AddScoreCard(formData, this.authkey).subscribe({
        next: (response: any): void => {
          console.log('Add Scorecard Response', response);
          const scorecardId = response.data._id;
          this.router.navigate(['addscorecard'], { queryParams: { id: scorecardId } });
        },
        error: (error: any) => {
          console.log('Add scorecard Error', error);
        },
      });
    }
    console.log('This is the scorecardformArray...', this.scorecardFormArray);
    console.log('scorecard form data submit', this.scorecardForm.value);
    this.scorecardForm.reset();
  }
}
