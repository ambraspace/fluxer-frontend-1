import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'boolean'
})
export class BooleanPipe implements PipeTransform {

  transform(value: boolean, arg?: string): string {
    
    if (arg)
    {
      let options = arg.split("/");
      if (options.length == 2)
      {
        if (value)
        {
          return options[0];
        } else {
          return options[1];
        }
      }
    }

    if (value)
    {
      return "true";
    } else {
      return "false";
    }
    
  }

}
