export interface LogRequest
{
    deviceId: number;
    parameterName: string;
    since: Date;
    until: Date;
}