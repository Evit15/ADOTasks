
import * as vsom from "azure-devops-node-api/VsoClient"
import * as restm from 'typed-rest-client/RestClient';
import * as basem from 'azure-devops-node-api/ClientApiBases';
import VsoBaseInterfaces from 'azure-devops-node-api/interfaces/common/VsoBaseInterfaces'
import * as ti from "azure-devops-node-api/interfaces/TestInterfaces";

export interface IExtendApi extends basem.ClientApiBase {
    getTestPlanById(project: string, planId: number): Promise<ti.TestPlan> ;
}
export class ExtendApi extends basem.ClientApiBase {
    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[], options?: VsoBaseInterfaces.IRequestOptions) {
        super(baseUrl, handlers, 'node-Test-api', options);
    }
    /**
     * Get a specific test case in a test suite with test case id.
     * 
     * @param {string} project - Project ID or project name
     * @param {number} planId - ID of the test plan that contains the suites.
     * @param {number} suiteId - ID of the suite that contains the test case.
     * @param {number} testCaseIds - ID of the test case to get.
     */
    public async getTestPlanById(
        project: string,
        planId: number
        ): Promise<ti.TestPlan> {

        return new Promise<ti.TestPlan>(async (resolve, reject) => {
            let routeValues: any = {
                project: project,
                planId: planId
            };

            try {
                let verData: vsom.ClientVersioningData = await this.vsoClient.getVersioningData(
                    "7.1-preview.3",
                    "Test",
                    "a4a1ec1c-b03f-41ca-8857-704594ecf58e",
                    routeValues);

                let url: string = verData.requestUrl!;
                let options: restm.IRequestOptions = this.createRequestOptions('application/json', 
                                                                                verData.apiVersion);

                let res: restm.IRestResponse<ti.TestPlan>;
                res = await this.rest.get<ti.TestPlan>(url, options);

                let ret = this.formatResponse(res.result,
                                                null,
                                                false);

                resolve(ret);
                
            }
            catch (err) {
                reject(err);
            }
        });
    }
}