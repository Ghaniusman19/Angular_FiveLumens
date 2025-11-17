import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { editscorecard } from '../../../services/editscorecard';
import { HttpClient } from '@angular/common/http';
import { JsonPipe } from '@angular/common';
@Component({
  selector: 'app-editscorecard',
  imports: [JsonPipe],
  templateUrl: './editscorecard.html',
  // template: `<p>Detailed ID is {{ detailId }}</p>`,
  styleUrl: './editscorecard.css',
})
export class Editscorecard implements OnInit, OnDestroy {
  public detailId: string = '';
  private routeSubscription: Subscription | undefined;

  constructor(private editScoreCard: editscorecard) {
    console.log('edit score Card loaded !');
  }
  route = inject(ActivatedRoute);
  http = inject(HttpClient);
  authorization = localStorage.getItem('authToken');
  authkey: any = this.authorization;
  router = inject(Router);
  public editSCData = signal<any[]>([]);

  ngOnInit(): void {
    // Option 1: Using paramMap (Recommended for observable-based access)
    this.routeSubscription = this.route.queryParams.subscribe((params) => {
      this.detailId = params['id'];
      console.log(this.detailId, 'This is our detailed id from params');
    });
    const editPayLoad = { id: this.detailId };
    this.editScoreCard.EditScoreCard(editPayLoad, this.authkey).subscribe({
      next: (response: any): void => {
        console.log('Full API Response:', response);
        this.editSCData.set(response.data);
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
