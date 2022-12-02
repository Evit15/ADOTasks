import tl = require('azure-pipelines-task-lib/task');
import * as te from "azure-devops-node-api/TestApi";
import * as azdev from "azure-devops-node-api";
import * as ti from "azure-devops-node-api/interfaces/TestInterfaces";

async function run() {
    try {
        const testrunid: string = tl.getInput('TestRunID', true)!;
        const testrunstate: string = tl.getInput('State', true)!;
        const iTestRunId: number = +testrunid;
        if (isNaN(iTestRunId)) {
            tl.setResult(tl.TaskResult.Failed, 'Test Run ID is not the number');
            return;
        }
        console.log('Test Run ID is ', iTestRunId);
        console.log('Test Run State is ', testrunstate);
        const collectionUri = tl.getVariable('System.TeamFoundationCollectionUri')!;
        const token = tl.getEndpointAuthorization('SystemVssConnection', true)!.parameters.AccessToken;
        const project = tl.getVariable('System.TeamProject')!;
        console.log(`Collection URL: ${collectionUri}`);
        console.log(`Project: ${project}`);
        let authHandler = azdev.getPersonalAccessTokenHandler(token); 
        let connection = new azdev.WebApi(collectionUri, authHandler); 
        let test: te.ITestApi = await connection.getTestApi();
        let runUpdateModel: ti.RunUpdateModel = {
            state: testrunstate
        };
        let testrun:ti.TestRun = await test.updateTestRun(runUpdateModel, project, iTestRunId);
        tl.setResult(tl.TaskResult.Succeeded, `Update Test Run State is successfully`);
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