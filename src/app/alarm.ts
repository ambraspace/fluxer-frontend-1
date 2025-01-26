export interface Alarm 
{
    id: number;
    message: string;
    delay?: number;
    flagRaised?: boolean;
    parameterName: string;
    relation: string;
    value: string;
}