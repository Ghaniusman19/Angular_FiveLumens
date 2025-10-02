import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Editscorecard } from './editscorecard';

describe('Editscorecard', () => {
  let component: Editscorecard;
  let fixture: ComponentFixture<Editscorecard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Editscorecard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Editscorecard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
