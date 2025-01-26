export interface Cell
{
    id: number;
    deviceId: number;
    parameterName: string;
    value: boolean | number | string;
    methodName: string;
    arguments: object[];
}