import { contentChildren, Directive, effect, inject } from '@angular/core';
import { DragNDropItemDirective } from '../item';
import { DragNDropService } from '../service/drag-n-drop.service';

@Directive({
    selector: '[appDragNDropContainer]',
})
export class DragNDropContainerDirective {
    private readonly dndService = inject(DragNDropService);
    private readonly dndItems = contentChildren(DragNDropItemDirective);
    private readonly dndItemsEffect = effect(
        () => {
            this.dndService.dndItems.set(this.dndItems());
        },
        {
            allowSignalWrites: true,
        }
    );
}
