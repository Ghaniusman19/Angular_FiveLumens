import { Component, OnInit, inject } from '@angular/core';
import { FetchAPIData } from '../../../services/fetch-apidata';
import { ScorecardData } from '../../../services/scorecard-data';
import { MatDialog } from '@angular/material/dialog';
import { Modal } from '../modal/modal';
import { User, Employees } from '../../user';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Test } from '../../../services/test';

@Component({
  selector: 'app-scorecard',
  imports: [ReactiveFormsModule],
  templateUrl: './scorecard.html',
  styleUrl: './scorecard.css',
})
export class Scorecard implements OnInit {
  scData: [] = [];
  groupsdata: [] = [];

  private authKey = inject(Test);
  newAuth = this.authKey.getToken();
  myname = this.authKey.getName();
  myData = this.authKey.getNumbers('Usman', 10);
  authorization = localStorage.getItem('authToken');
  authkey: any = this.authorization;
  //THIS IS THE ARRAY OF USERS  ..AND THE INTERFACE OF THE USER IS MADE IN THE USER.TS FILE IN THE SRC DIRECTORY ...
  users: User[] = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com' },
  ];

  Employee: Employees[] = [
    { empId: 1, empName: 'Alice', empDesignation: 'alice@example.com' },
    { empId: 2, empName: 'Bob', empDesignation: 'bob@example.com' },
    { empId: 3, empName: 'Charlie', empDesignation: 'charlie@example.com' },
  ];

  search = new FormGroup({
    search: new FormControl(''),
  });
  onSubmit() {
    console.log('This is the Search Value ', this.search.value);
    this.search.reset();
  }
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
