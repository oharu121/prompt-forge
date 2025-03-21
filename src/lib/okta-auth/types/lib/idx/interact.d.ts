/*!
 * Copyright (c) 2021, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */
import { OktaAuthIdxInterface, InteractOptions, InteractResponse } from './types';
export interface InteractParams {
    client_id: string;
    scope: string;
    redirect_uri: string;
    code_challenge: string;
    code_challenge_method: string;
    state: string;
    activation_token?: string;
    recovery_token?: string;
    client_secret?: string;
    max_age?: string | number;
    acr_values?: string;
    nonce?: string;
}
export declare function interact(authClient: OktaAuthIdxInterface, options?: InteractOptions): Promise<InteractResponse>;
