import { TestBed } from '@angular/core/testing';

import { PhLocationsService } from './ph-locations.service';

describe('PhLocationsService', () => {
  let service: PhLocationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhLocationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
