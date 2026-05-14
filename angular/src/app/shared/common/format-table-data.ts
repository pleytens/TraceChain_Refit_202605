import {inject, Pipe, PipeTransform} from "@angular/core";
import {LocalizationService} from "@abp/ng.core";
import { Types } from './constant.variable.model';

@Pipe({ standalone: true, name: "formatData" })
export class FormatDataPipe implements PipeTransform {
  transform(value: any, header: any): any {
    if (!value || !header) {
      return value;
    }
    let formattedValue = value;

    if (header.Type === Types.Date) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
        const year = date.getFullYear();
        formattedValue = `${day}-${month}-${year}`;
      }
    } else if (header.Type === Types.Time) {
      const time = new Date(value);
      if (!isNaN(time.getTime())) {
        formattedValue = time.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } else if (header.Type === Types.Double) {
      const num = Number(value);
      if (!isNaN(num)) {
        formattedValue = num.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
      }
    } else if (Array.isArray(value)) {
      formattedValue = value.join(", ");
    }

    return formattedValue;
  }
}
@Pipe({standalone: true, name: 'enumLabel'})
export class EnumLabelPipe implements PipeTransform {
  private readonly localizationService = inject(LocalizationService);

  transform(value: string | number, labelMap: Record<any, string>): string {
    const key = labelMap[value];
    if (!key) return value.toString();
    return this.localizationService.instant('::' + key);
  }
}
