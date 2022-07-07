import tl = require('azure-pipelines-task-lib/task');
import * as te from "azure-devops-node-api/TestApi";
import * as azdev from "azure-devops-node-api";
import * as ti from "azure-devops-node-api/interfaces/TestInterfaces";
//import ExtendApi = require('./ExtendApi');

async function run() {
    try {
        const sTestPlanID = tl.getInput('testPlan', true)!;
        const sTestSuiteID = tl.getInput('testSuite', true)!;

        const iTestPlanID: number = parseInt(sTestPlanID);
        const iTestSuiteID: number = parseInt(sTestSuiteID);
        console.log(`Test plan id: ${iTestPlanID}`);
        console.log(`Test suite id: ${iTestSuiteID}`);
        const collectionUri = tl.getVariable('System.TeamFoundationCollectionUri')!;
        const token = tl.getEndpointAuthorization('SystemVssConnection', true)!.parameters.AccessToken;
        const project = tl.getVariable('System.TeamProject')!;
        console.log(`Collection URL: ${collectionUri}`);
        let authHandler = azdev.getPersonalAccessTokenHandler(token); 
        let connection = new azdev.WebApi(collectionUri, authHandler); 
        let test: te.ITestApi = await connection.getTestApi();
        let pointIds: number[] = []
        let tps: ti.TestPoint[] = await test.getPoints(project, iTestPlanID, iTestSuiteID);
        tps.forEach(tp => {
            console.log(`Test point id: ${tp.id}`);
            pointIds.push(tp.id)
        });
        //const extendapi = new ExtendApi.ExtendApi(collectionUri, [authHandler]);
        //const testPlan: ti.TestPlan = await extendapi.getTestPlanById(project, iTestPlanID);
        const testplanid: ti.ShallowReference = {
            id: `${iTestPlanID}`
        }
        const testRunModel: ti.RunCreateModel = {
            name: 'testrun',
            plan: testplanid,
            configurationIds: [],
            pointIds: pointIds
        };
        let testRunNew: ti.TestRun = await test.createTestRun(testRunModel, project)
        console.log(`Test point id: ${testRunNew.id}`);

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