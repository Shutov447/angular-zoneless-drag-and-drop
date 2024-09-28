import {
    AfterViewInit,
    contentChildren,
    Directive,
    ElementRef,
    inject,
    input,
} from '@angular/core';
import { DragNDropItemDirective } from '../item';
import {
    DragNDropContainerService,
    DragNDropCoverageService,
    DragNDropItemsService,
    Transition,
} from '../../lib';

@Directive({
    selector: '[appDragNDropContainer]',
    host: {
        '[style.position]': 'this.dndContainerService.positionType()',
    },
})
export class DragNDropContainerDirective implements AfterViewInit {
    private readonly hostElem = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly dndContainerService = inject(DragNDropContainerService);
    private readonly itemsService = inject(DragNDropItemsService);
    private readonly coverageService = inject(DragNDropCoverageService);
    private readonly dndItems = contentChildren(DragNDropItemDirective);

    readonly coveragePercentage = input(50);
    readonly coverageTime = input(0);
    readonly transitions = input<Transition[]>([]);

    ngAfterViewInit() {
        if (this.transitions().length > 0)
            this.itemsService.transitions.set(this.transitions());
        this.dndContainerService.setElem(this.hostElem.nativeElement);
        this.itemsService.setDndItems(this.dndItems());
        this.coverageService.setPercentage(this.coveragePercentage());
        this.coverageService.setTime(this.coverageTime());
    }
}
