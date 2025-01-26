import { Cell } from './cell';

export interface Row
{
    id: number;
    locationId: number;
    cells: Cell[];
}