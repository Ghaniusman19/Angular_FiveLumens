import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { editscorecard } from '../../../services/editscorecard';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-editscorecard',
  imports: [],
  templateUrl: './editscorecard.html',
  // template: `<p>Detailed ID is {{ detailId }}</p>`,
  styleUrl: './editscorecard.css',
})
export class Editscorecard implements OnInit, OnDestroy {
  public detailId: string = '';
  private routeSubscription: Subscription | undefined;

  constructor(private editScoreCard: editscorecard) {
    console.log('edit score Card loaded !');
    console.log(this.detailId);
  }
  route = inject(ActivatedRoute);
  http = inject(HttpClient);
  authorization = localStorage.getItem('authToken');
  authkey: any = this.authorization;
  router = inject(Router);
  editSC: any = '';
  ngOnInit(): void {
    // Option 1: Using paramMap (Recommended for observable-based access)
    this.routeSubscription = this.route.queryParams.subscribe((params) => {
      this.detailId = params['id'];
    });
    const editPayLoad = { id: this.detailId };
    this.editScoreCard.EditScoreCard(editPayLoad, this.authkey).subscribe({
      next: (response: any): void => {
        console.log(response);
        this.editSC = response.data;
        console.log(this.editSC);
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
}
