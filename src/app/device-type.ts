export interface DeviceType
{
    className: string;
    manufacturer?: string;
    model?: string;
    description?: string;
    initiationParameters: object;
    readableParameters?: string[];
    settableParameters?: string[];
    commandProducers?: string[];
}
