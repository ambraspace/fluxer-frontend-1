import { Instruction } from './instruction';

export interface Trigger
{
    id: number;
    name: string;
    description: string;
    instructions: Instruction[];
}