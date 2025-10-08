import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  isVisible = true;

  @Output() closed = new EventEmitter<void>();
  closeModal() {
    this.isVisible = false;
    this.closed.emit();
  }
}
