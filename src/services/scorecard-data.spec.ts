import { TestBed } from '@angular/core/testing';

import { ScorecardData } from './scorecard-data';

describe('ScorecardData', () => {
  let service: ScorecardData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScorecardData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
