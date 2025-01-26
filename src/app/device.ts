export interface Device
{
    id: number;
    locationId?: number;
    className: string;
    manufacturer: string;
    model: string;
    description: string;
    address: number;
    connectionId: string;
    online: boolean;
    [key: string]: number | string | boolean;
}