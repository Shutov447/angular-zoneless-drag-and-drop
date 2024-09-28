import { Component } from '@angular/core';
import { DragNDropModule } from 'src/drag-n-drop';

@Component({
    standalone: true,
    imports: [DragNDropModule],
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    readonly title = 'angular-zoneless-drag-n-drop';
    readonly gifs = [
        'gifs/chego_blyat.gif',
        'gifs/dokibird-huh.gif',
        'gifs/sticker.gif',
        'gifs/Vince_McMahon_no_comments.gif',
        'gifs/vybor_personazha.gif',
        'gifs/Tryaskkhalko.gif',
        'gifs/Oguzok_ukhmylnulsya_i_ushyol.gif',
        'gifs/fart-eye-brow.gif',
    ];
}
