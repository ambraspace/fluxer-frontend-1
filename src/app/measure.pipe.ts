import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'measure'
})
export class MeasurePipe implements PipeTransform {

  transform(value: number, digitsInfo?: string, locale?: string): string
  {
    
    if (digitsInfo)
    {

      let numericPart: RegExp = /\d+.\d\-\d/;
      let matches = digitsInfo.match(numericPart);
      if (matches && matches.length == 1)
      {
        return digitsInfo.replace(
          matches[0],
          DecimalPipe.prototype.transform(value, matches[0], (locale ? locale : "en-US")));
      } else {
        return "error";
      }

    } else {
      return DecimalPipe.prototype.transform(value);
    }
    
  }

}
