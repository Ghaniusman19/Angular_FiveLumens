import { TestBed } from '@angular/core/testing';

import { Deletescorecard } from './deletescorecard';

describe('Deletescorecard', () => {
  let service: Deletescorecard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Deletescorecard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
