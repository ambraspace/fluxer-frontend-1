export interface AlarmData
{
    alarmId: number;
    deviceId: number;
    locationId: number;
    locationName: string;
    alarmText: string;
    triggeredAt: Date;
    clearedAt: Date;
}