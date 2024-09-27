import { NgModule } from '@angular/core';
import {
    DragNDropContainerDirective,
    DragNDropItemDirective,
} from './directives';
import {
    DragNDropContainerService,
    DragNDropCoverageService,
    DragNDropItemsService,
    IdService,
} from './lib';

@NgModule({
    declarations: [DragNDropContainerDirective, DragNDropItemDirective],
    providers: [
        DragNDropContainerService,
        DragNDropItemsService,
        DragNDropCoverageService,
        IdService,
    ],
    exports: [DragNDropContainerDirective, DragNDropItemDirective],
})
export class DragNDropModule {}
