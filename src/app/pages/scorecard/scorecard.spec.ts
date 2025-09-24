import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Scorecard } from './scorecard';

describe('Scorecard', () => {
  let component: Scorecard;
  let fixture: ComponentFixture<Scorecard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Scorecard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Scorecard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
