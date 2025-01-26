import { Column } from './column';
import { Row } from './row';

export interface TableView
{
    id: number;
    name: string;
    description: string;
    displayOrder: number;
    columns: Column[];
    rows: Row[];
}