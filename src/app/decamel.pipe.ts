import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decamel'
})
export class DecamelPipe implements PipeTransform {

  transform(value: string): string
  {
    
    let pattern = /[a-z0-9][A-Z0-9]/;

    if (!value) return value;

    if (value.length<2) return value;

    let index: number = -1;
    while ((index = value.search(pattern)) >= 0)
    {
      value = value.substring(0, index + 1) + " " +
        value.substring(index + 1, index + 2).toLowerCase() +
        value.substring(index + 2);
    }

    return value;
    
  }

}
