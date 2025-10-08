import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Modal } from './modal/modal';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, Modal],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('FiveLumensAngular');
  onModalClosed() {
    console.log('Modal was closed.');
  }
  ngOnInit(): void {}
}
