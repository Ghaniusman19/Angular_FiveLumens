import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Viewscorecard } from './viewscorecard';

describe('Viewscorecard', () => {
  let component: Viewscorecard;
  let fixture: ComponentFixture<Viewscorecard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Viewscorecard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Viewscorecard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
