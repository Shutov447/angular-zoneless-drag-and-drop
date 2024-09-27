import { TestBed } from '@angular/core/testing';

import { DragNDropFacadeService } from './drag-n-drop-facade.service';

describe('DragNDropFacadeService', () => {
  let service: DragNDropFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DragNDropFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
