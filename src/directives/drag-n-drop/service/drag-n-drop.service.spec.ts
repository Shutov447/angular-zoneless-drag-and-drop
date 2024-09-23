import { TestBed } from '@angular/core/testing';

import { DragNDropService } from './drag-n-drop.service';

describe('DragNDropService', () => {
  let service: DragNDropService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DragNDropService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
