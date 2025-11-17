import { Addscorecard } from '../../../services/addscorecard';
import { ActivatedRoute, Router } from '@angular/router';
import { editscorecard } from './../../../services/editscorecard';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { CdkAccordionModule } from '@angular/cdk/accordion';

@Component({
  selector: 'app-viewscorecard',
  imports: [CdkAccordionModule],
  templateUrl: './viewscorecard.html',
  styleUrl: './viewscorecard.css',
})
export class Viewscorecard implements OnInit, OnDestroy {
  public viewID: string = '';
  private routeSubscription: Subscription | undefined;
  constructor(private editscorecard: Addscorecard) {
    console.log('View Page Called!');
  }
  route = inject(ActivatedRoute);
  router = inject(Router);
  http = inject(HttpClient);
  authorization = localStorage.getItem('authToken');
  authkey: any = this.authorization;
  public viewSCData = signal<any[]>([]);
  public apiResponse = signal<any>(null);

  ngOnInit(): void {
    this.routeSubscription = this.route.queryParams.subscribe((params) => {
      this.viewID = params['id'];
      console.log(this.viewID, 'This is our detailed id from params');
    });
    const viewPayLoad = { id: this.viewID };
    this.editscorecard.EditScoreCard(viewPayLoad, this.authkey).subscribe({
      next: (response: any): void => {
        console.log('Full API Response:', response);
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
      },
      error: (error: any) => {
        console.log(error);
      },
    });
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
  }
}
