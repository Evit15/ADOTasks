import tl = require('azure-pipelines-task-lib/task');
import * as azdev from "azure-devops-node-api";
import * as witAPI from "azure-devops-node-api/WorkItemTrackingApi"
import * as witInterfaces from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
import * as vssInterfaces from 'azure-devops-node-api/interfaces/common/VSSInterfaces'

async function run() {
    try {
        const inputString: string | undefined = tl.getInput('testcaseid', true);
        if (inputString == undefined || inputString == '') {
            tl.setResult(tl.TaskResult.Failed, 'Please input test case id');
            return;
        }
        const iTestCaseID: number = parseInt(inputString);
        if (iTestCaseID == 0 || iTestCaseID == NaN){
            tl.setResult(tl.TaskResult.Failed, 'Please input test case id is number');
            return;
        }
        console.log('Set automation status for test case ', iTestCaseID);
        const collectionUri = tl.getVariable('System.TeamFoundationCollectionUri')!;
        const token = tl.getEndpointAuthorization('SystemVssConnection', true)!.parameters.AccessToken;
        const project = tl.getVariable('System.TeamProject')!;
        console.log(`Collection URL: ${collectionUri}`);
        let authHandler = azdev.getPersonalAccessTokenHandler(token); 
        let connection = new azdev.WebApi(collectionUri, authHandler); 
        let wit: witAPI.IWorkItemTrackingApi = await connection.getWorkItemTrackingApi();
        let wijson: vssInterfaces.JsonPatchDocument = 
            [
                { 
                    "op": "add", 
                    "path": "/fields/Microsoft.VSTS.TCM.AutomatedTestId",
                    "value": "1234" 
                },
                { 
                    "op": "add", 
                    "path": "/fields/Microsoft.VSTS.TCM.AutomatedTestStorage",
                    "value": "MyDLLName.dll" 
                },
                { 
                    "op": "add", 
                    "path": "/fields/Microsoft.VSTS.TCM.AutomatedTestName",
                    "value": "MyDLLName.TestCaseName" 
                }
            ];
        let wi: witInterfaces.WorkItem = await wit.updateWorkItem(null, wijson, iTestCaseID);
        console.log(`Update success fro test case id : ${iTestCaseID}`); 
    }
    catch (err) {
        let errorMessage = "Failed to do something exceptional";
        if (err instanceof Error) {
            errorMessage = err.message;
        }
        tl.setResult(tl.TaskResult.Failed, errorMessage);
    }
}

run();