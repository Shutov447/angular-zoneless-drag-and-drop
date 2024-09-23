import { NgModule } from '@angular/core';
import { DragNDropContainerDirective } from './container';
import { DragNDropItemDirective } from './item';
import { DragNDropService } from './service';

@NgModule({
    declarations: [DragNDropContainerDirective, DragNDropItemDirective],
    providers: [DragNDropService],
    exports: [DragNDropContainerDirective, DragNDropItemDirective],
})
export class DragNDropModule {}
