import {
    contentChildren,
    Directive,
    ElementRef,
    inject,
    input,
    OnInit,
} from '@angular/core';
import { DragNDropItemDirective } from '../item';
import {
    DragNDropContainerService,
    DragNDropCoverageService,
    DragNDropItemsService,
} from '../../model';

@Directive({
    selector: '[appDragNDropContainer]',
})
export class DragNDropContainerDirective implements OnInit {
    private readonly hostElem = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly dndContainerService = inject(DragNDropContainerService);
    private readonly itemService = inject(DragNDropItemsService);
    private readonly coverageService = inject(DragNDropCoverageService);
    private readonly dndItems = contentChildren(DragNDropItemDirective);

    readonly coveragePercentage = input(0);
    readonly coverageTime = input(0);

    ngOnInit() {
        this.dndContainerService.setElem(this.hostElem.nativeElement);
        this.itemService.setDndItems(this.dndItems());
        this.coverageService.setPercentage(this.coveragePercentage());
        this.coverageService.setTime(this.coverageTime());
    }
}
