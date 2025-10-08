import { TestBed } from '@angular/core/testing';

import { ToggleStatus } from './toggle-status';

describe('ToggleStatus', () => {
  let service: ToggleStatus;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToggleStatus);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
