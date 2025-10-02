import { Component } from '@angular/core';
import { MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import {
  ɵInternalFormsSharedModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
} from '@angular/forms';

@Component({
  selector: 'app-modal',
  imports: [MatDialogActions, MatDialogContent, ɵInternalFormsSharedModule, ReactiveFormsModule],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  constructor(public dialogref: MatDialogRef<Modal>) {}
  scorecardForm = new FormGroup({
    title: new FormControl(''),
    description: new FormControl(''),
    evaluationType: new FormControl(''),
    scoringModel: new FormControl(''),
    coachingForm: new FormControl(''),
    visibleToManagers: new FormControl(''),
    coachingPurposeOnly: new FormControl(''),
  });
  ScorecardSubmit() {
    console.log(this.scorecardForm.value);
    this.scorecardForm.reset();
  }
  closeDialog(): void {
    this.dialogref.close('someResult');
  }
  onClose() {
    console.log('closed button clicked ');
  }
}
