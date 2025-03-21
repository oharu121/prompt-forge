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
import { IdxRemediation, IdxRemediationValue } from '../types/idx-js';
import { RemediateOptions } from '../types';
import { Remediator, RemediationValues } from './Base/Remediator';
import { Authenticator, Credentials } from '../authenticator';
export interface EnrollProfileValues extends RemediationValues {
    firstName?: string;
    lastName?: string;
    email?: string;
    credentials?: Credentials;
    password?: string;
    passcode?: string;
}
export declare class EnrollProfile extends Remediator<EnrollProfileValues> {
    static remediationName: string;
    authenticator: Authenticator<any> | null;
    constructor(remediation: IdxRemediation, values?: EnrollProfileValues, options?: RemediateOptions);
    canRemediate(): boolean;
    getCredentialsFromRemediation(): IdxRemediationValue | undefined;
    mapUserProfile({ form: { value: profileAttributes } }: {
        form: {
            value: any;
        };
    }): any;
    mapCredentials(): Credentials | undefined;
    getInputUserProfile(input: any): any[];
    getInputCredentials(input: any): any[];
    getErrorMessages(errorRemediation: any): any;
}
