/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */
import { OAuthTransactionMeta, OAuthStorageManagerInterface } from '../../oidc';
import { ServiceManagerInterface, ServiceInterface, ServiceManagerOptions, OktaAuthCoreInterface, OktaAuthCoreOptions } from '../types';
export declare class ServiceManager<M extends OAuthTransactionMeta, S extends OAuthStorageManagerInterface<M>, O extends OktaAuthCoreOptions> implements ServiceManagerInterface {
    private sdk;
    private options;
    private services;
    private started;
    private static knownServices;
    private static defaultOptions;
    constructor(sdk: OktaAuthCoreInterface<M, S, O>, options?: ServiceManagerOptions);
    private onLeader;
    isLeader(): boolean;
    isLeaderRequired(): boolean;
    start(): Promise<void>;
    stop(): Promise<void>;
    getService(name: string): ServiceInterface | undefined;
    private startServices;
    private stopServices;
    private canStartService;
    private createService;
}
