export interface Instruction
{
    id: number;
    deviceId: number;
    methodName: string;
    arguments: object[];
}