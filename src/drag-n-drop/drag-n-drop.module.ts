import { NgModule } from '@angular/core';
import {
    DragNDropContainerDirective,
    DragNDropItemDirective,
} from './directives';
import {
    DragNDropContainerService,
    DragNDropCoverageService,
    DragNDropItemsService,
} from './model';
import { IdService } from './lib';

@NgModule({
    declarations: [DragNDropContainerDirective, DragNDropItemDirective],
    providers: [
        DragNDropContainerService,
        DragNDropCoverageService,
        DragNDropItemsService,
        IdService,
    ],
    exports: [DragNDropContainerDirective, DragNDropItemDirective],
})
export class DragNDropModule {}
