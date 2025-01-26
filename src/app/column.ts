import { Alignment } from './alignment';

export interface Column
{
    id: number;
    title: string;
    description: string;
    alignment: Alignment;
    pipe: string;
    pipeArg: string;
    type: string;
}