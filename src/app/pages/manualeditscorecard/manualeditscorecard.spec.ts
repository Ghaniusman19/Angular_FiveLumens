import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Manualeditscorecard } from './manualeditscorecard';

describe('Manualeditscorecard', () => {
  let component: Manualeditscorecard;
  let fixture: ComponentFixture<Manualeditscorecard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Manualeditscorecard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Manualeditscorecard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
