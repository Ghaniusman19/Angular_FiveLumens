import { Addscorecard } from '../../../services/addscorecard';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { editscorecard } from '../../../services/editscorecard';
@Component({
  selector: 'app-viewscorecard',
  imports: [CdkAccordionModule, ReactiveFormsModule],
  templateUrl: './viewscorecard.html',
  styleUrl: './viewscorecard.css',
})
export class Viewscorecard implements OnInit, OnDestroy {
  public viewID: string = '';
  private routeSubscription: Subscription | undefined;
  constructor(private editscorecard: Addscorecard, private editsc: editscorecard) {
    console.log('View Page Called!');
  }
  route = inject(ActivatedRoute);
  router = inject(Router);
  http = inject(HttpClient);
  authorization = localStorage.getItem('authToken');
  authkey: any = this.authorization;
  public viewSCData = signal<any[]>([]);
  public viewSCDataDetails = signal<any[]>([]);
  public apiResponse = signal<any>(null);
  public SettingModalOpen = signal<boolean>(true);

  ngOnInit(): void {
    this.routeSubscription = this.route.queryParams.subscribe((params) => {
      this.viewID = params['id'];
      console.log(this.viewID, 'This is our detailed id from params');
    });
    const viewPayLoad = { id: this.viewID };
    this.editscorecard.EditScoreCard(viewPayLoad, this.authkey).subscribe({
      next: (response: any): void => {
        console.log('Full API Response:', response.data);
        this.viewSCDataDetails.set(response.data);
        console.log(this.viewSCDataDetails(), 'This is our view scorecard data ');
        // Store the entire data object for accordion display
        // Calculate totals for each section and criteria
        const criterias = (response.data.criterias || []).map((crit: any) => {
          const sections = (crit.scoringSections || []).map((sec: any) => {
            const secTotal = (sec.details || []).reduce(
              (sum: any, d: any) => sum + (Number(d.score) || 0),
              0
            );
            return { ...sec, sectionTotal: secTotal };
          });
          const critTotal = sections.reduce((sum: any, s: any) => sum + (s.sectionTotal || 0), 0);
          return { ...crit, scoringSections: sections, criteriaTotal: critTotal };
        });

        this.viewSCData.set(criterias);
        this.apiResponse.set({ ...response.data, criterias });
        console.log('Criterias:', this.viewSCData());
        // populate the scorecard form and make it readonly
        this.populateFormFromAPI(response.data);
      },
      error: (error: any) => {
        console.log(error);
      },
    });
    // initial patch will be done when API response arrives
  }

  // Fill the form from API data and disable it (readonly)
  private populateFormFromAPI(data: any): void {
    if (!data) return;

    // patch basic fields
    this.scorecardForm.patchValue({
      id: data._id || '',
      title: data.title || '',
      description: data.description || '',
      evaluationType: data.evaluationType || '',
      scoringModel: data.scoringModel || '',
      coachingForm: data.coachingForm || '',
      visibleToManagers: data.visibleToManagers,
      coachingPurposeOnly: data.coachingPurposeOnly,
      isActive: data.isActive || Boolean,
      isAllGroups: data.isAllGroups || Boolean,
      groups: data.groups || [],
    });

    // groups
    if (Array.isArray(data.groups)) {
      const groupsFA = this.scorecardForm.get('groups') as FormArray;
      groupsFA.clear();
      data.groups.forEach((g: any) => groupsFA.push(new FormControl(g)));
    }
    // disable the form to make view readonly
    try {
      this.scorecardForm.disable({ emitEvent: false });
      this.scorecardForm.get('id')?.setValue(data._id);
      this.scorecardForm.get('id')?.disable();
      this.scorecardForm.get('evaluationType')?.setValue(data.evaluationType);
      this.scorecardForm.get('evaluationType')?.disable();
    } catch (e) {
      console.warn('Could not disable form', e);
    }
  }
  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks if using observable-based access
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
  // function to handle view settings click / Modal
  public viewSettings(id: any) {
    console.log('View Settings Clicked', id);
    this.SettingModalOpen.set(true);
  }
  public closeSettingModal() {
    this.SettingModalOpen.set(false);
  }
  public scorecardForm: FormGroup = new FormGroup({
    id: new FormControl(''),
    title: new FormControl(''),
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
  convertToFormData(obj: any): FormData {
    const formData = new FormData();

    Object.keys(obj).forEach((key) => {
      const value = obj[key];

      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          formData.append(`${key}[${index}]`, item);
        });
      } else if (typeof value === 'boolean') {
        formData.append(key, value ? 'true' : 'false');
      } else {
        formData.append(key, value);
      }
    });
    return formData;
  }

  submitSettings() {
    if (this.scorecardForm) {
      const formData = this.scorecardForm.value;
      const formdataPayload = this.convertToFormData(formData);
      console.log('Form Data Submitted:', formData);
      this.editsc.ScoreCardSetting(formdataPayload, this.authkey).subscribe({
        next: (response: any): void => {
          console.log('Full API Setting api called response:', response.data);
          this.router.navigate(['scorecardnew']);
          // populate the scorecard form and make it readonly
        },
        error: (error: any) => {
          console.log(error);
        },
      });
      // Here you can call the update API with formData
    } else {
      console.log('Form is invalid');
    }
  }
}
