import { TestBed } from '@angular/core/testing';

import { IsActive } from './is-active';

describe('IsActive', () => {
  let service: IsActive;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IsActive);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
