import { TestBed } from '@angular/core/testing';

import { DragNDropContainerService } from './drag-n-drop-container.service';

describe('DragNDropContainerService', () => {
  let service: DragNDropContainerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DragNDropContainerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
