import { Component, OnInit, inject } from '@angular/core';
import { FetchAPIData } from '../../../services/fetch-apidata';
import { ScorecardData } from '../../../services/scorecard-data';
import { MatDialog } from '@angular/material/dialog';
import { Modal } from '../modal/modal';

@Component({
  selector: 'app-scorecard',
  imports: [],
  templateUrl: './scorecard.html',
  styleUrl: './scorecard.css',
})
export class Scorecard implements OnInit {
  scData: [] = [];
  groupsdata: [] = [];

  authorization = localStorage.getItem('authToken');
  authkey: any = this.authorization;
  constructor(private groups: FetchAPIData, private scorecardData: ScorecardData) {}

  ngOnInit(): void {
    if (!this.authorization) {
      console.error('Authorization token is missing');
      return;
    }
    const payload = { key: 'value' };
    //This is the code of the fetching of the scorecard  by post method
    this.scorecardData.scoreCardData(payload, this.authkey).subscribe({
      next: (response: any): void => {
        this.scData = response.data;
        console.log('API Response of scorecard data:', this.scData); // Log to console
      },
      error: (error: any) => {
        console.error('API Error:', error);
      },
    });
    //This is the code of the fetching of the grops all by get method
    this.groups.fetchGroupsData(this.authkey).subscribe({
      next: (data: any): void => {
        this.groupsdata = data.data;
        console.log('API response of the group data ', this.groupsdata);
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }
  readonly dialog = inject(MatDialog);
  openDialog() {
    const dialogRef = this.dialog.open(Modal);
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
