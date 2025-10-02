import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Scorecardnew } from './scorecardnew';

describe('Scorecardnew', () => {
  let component: Scorecardnew;
  let fixture: ComponentFixture<Scorecardnew>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Scorecardnew]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Scorecardnew);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
