export interface ServiceInterface {
    start(): Promise<void>;
    stop(): Promise<void>;
    isStarted(): boolean;
    canStart(): boolean;
    requiresLeadership(): boolean;
}
export interface ServiceManagerInterface {
    isLeaderRequired(): boolean;
    isLeader(): boolean;
    start(): Promise<void>;
    stop(): Promise<void>;
    getService(name: string): ServiceInterface | undefined;
}
export interface AutoRenewServiceOptions {
    autoRenew?: boolean;
    autoRemove?: boolean;
}
export interface SyncStorageServiceOptions {
    syncStorage?: boolean;
    syncChannelName?: string;
}
export interface LeaderElectionServiceOptions {
    electionChannelName?: string;
    broadcastChannelName?: string;
}
declare type seconds = number;
export interface RenewOnTabActivationServiceOptions {
    renewOnTabActivation?: boolean;
    tabInactivityDuration?: seconds;
}
export declare type ServiceManagerOptions = AutoRenewServiceOptions & SyncStorageServiceOptions & LeaderElectionServiceOptions & RenewOnTabActivationServiceOptions;
export {};
