import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Addscorecard } from './addscorecard';

describe('Addscorecard', () => {
  let component: Addscorecard;
  let fixture: ComponentFixture<Addscorecard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Addscorecard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Addscorecard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
