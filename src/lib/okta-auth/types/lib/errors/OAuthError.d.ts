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
import CustomError from './CustomError';
import type { HttpResponse } from '../http';
export default class OAuthError extends CustomError {
    errorCode: string;
    errorSummary: string;
    error: string;
    error_description: string;
    resp: HttpResponse | null;
    constructor(errorCode: string, summary: string, resp?: HttpResponse);
}
