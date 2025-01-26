import { Installation } from './installation';

export interface User 
{

    id: number;
    username: string;
    password?: string;
    role: string;
    email: string;
    fcmToken: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    installationIds: number[];

}