import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from '@angular/core';

import Quill from 'quill';
import { QuillEditorComponent } from 'ngx-quill';
import { RootCoreModule } from '@abp/ng.core';
import QuillVideo from 'quill/formats/video';
import BlotFormatter from '@enzedonline/quill-blot-formatter2';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '@proxy/traceverified/trace-farm/file-management';

Quill.register('modules/blotFormatter2', BlotFormatter);
class CustomQuillVideo extends QuillVideo {
  html = null;
}

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [QuillEditorComponent, RootCoreModule],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
})
export class EditorComponent implements OnChanges {
  @ViewChild('quillEditor', { static: false })
  quillEditor!: QuillEditorComponent;
  @Input()
  content: any;
  @Input() autoFocus?: boolean = false;
  @Output() onBlurEmit = new EventEmitter();
  public editorFormats: string[] = [];
  quillModules: any;
  customModules: any;

  constructor(private fileService: StorageService) {
    this.editorBuild();
  }

  ngOnChanges() {
    this.editorBuild();
  }

  eventBlurHandle($event: any) {
    this.onBlurEmit.emit();
  }

  editorBuild() {
    this.editorFormats = [
      'background',
      'bold',
      'color',
      'font',
      'code',
      'italic',
      'link',
      'size',
      'strike',
      'script',
      'underline',
      'blockquote',
      'header',
      'indent',
      'list',
      'align',
      'direction',
      'code-block',
      'formula',
      'video',
      'image',
    ].filter((f): f is string => !!f);

    this.quillModules = {
      blotFormatter2: {
        align: {
          allowAligning: true,
        },
        resize: {
          allowResizing: true,
        },
        delete: {
          allowKeyboardDelete: true,
        },
        image: {
          allowAltTitleEdit: true,
          allowCompressor: true,
        },
      },
      toolbar: {
        container: [
          ['bold', 'italic', 'underline', 'strike'],
          [{ header: 1 }, { header: 2 }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ indent: '-1' }, { indent: '+1' }],
          ['direction', { align: [] }],
          [{ size: ['small', false, 'large', 'huge'] }],
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ['video', 'image'],
        ],
      },
    };

    this.customModules = [{ path: 'formats/video', implementation: CustomQuillVideo }];
  }

  setFocus(editor: any) {
    if (this.autoFocus) {
      editor.focus();
    }
  }

  async uploadImagesFromQuillContent(content: string): Promise<string> {
    const div = document.createElement('div');
    div.innerHTML = content;

    const images = Array.from(div.querySelectorAll('img'));
    const uploadPromises: Promise<void>[] = [];

    for (const img of images) {
      if (img.src.startsWith('data:image')) {
        try {
          const resizedFile = await this.dataURLToFileWithAspectResize(
            img.src,
            'image.png',
            800,
            800,
          );

          const fileType = resizedFile.name.split('.').pop();
          const imageName = this.generateUniqueFileName('', fileType);

          const uploadPromise = this.uploadEditorFile(resizedFile, imageName)
            .then(async () => {
              const uploadedUrl = await this.fileService
                .getFileUrlByFileName(imageName)
                .toPromise();
              img.src = uploadedUrl;
            })
            .catch(error => {
              console.error('Error uploading image:', error);
            });

          uploadPromises.push(uploadPromise);
        } catch (error) {
          console.error('Error resizing image:', error);
        }
      }
    }

    await Promise.all(uploadPromises);

    return div.innerHTML;
  }

  async dataURLToFileWithAspectResize(
    dataUrl: string,
    fileName: string,
    maxWidth: number,
    maxHeight: number,
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;

          if (width / maxWidth > height / maxHeight) {
            width = maxWidth;
            height = maxWidth / aspectRatio;
          } else {
            height = maxHeight;
            width = maxHeight * aspectRatio;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.round(width);
        canvas.height = Math.round(height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Failed to get canvas context'));
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          blob => {
            if (blob) {
              const file = new File([blob], fileName, { type: blob.type });
              resolve(file);
            } else {
              reject(new Error('Failed to create Blob from canvas'));
            }
          },
          'image/jpeg',
          0.7,
        );
      };

      img.onerror = err => reject(err);
      img.src = dataUrl;
    });
  }

  generateUniqueFileName(prefix: string, fileType: string): string {
    const uniqueId = uuidv4().replace(/-/g, '');
    return `${uniqueId}.${fileType}`;
  }

  uploadEditorFile(file: File, fileName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const formData: FormData = new FormData();
      formData.append('file', file, fileName);

      this.fileService.uploadFileByFile(formData).subscribe({
        next: res => {
          resolve(res);
        },
        error: err => {
          console.error('Upload error:', err);
          reject(err);
        },
      });
    });
  }
}
