import tl = require('azure-pipelines-task-lib/task');
import * as azdev from "azure-devops-node-api";
import * as witAPI from "azure-devops-node-api/WorkItemTrackingApi"
import * as witInterfaces from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
import * as vssInterfaces from 'azure-devops-node-api/interfaces/common/VSSInterfaces'
import * as te from "azure-devops-node-api/TestApi";
import * as ti from "azure-devops-node-api/interfaces/TestInterfaces";

async function getListTestCaseId(connection: azdev.WebApi, project: string){
    let testIds: number[] = [];
    const sTestPlanID = tl.getInput('testPlan', true)!;
    const sTestSuiteID = tl.getInput('testSuite', true)!;
    const iTestPlanID: number = parseInt(sTestPlanID);
    const iTestSuiteID: number = parseInt(sTestSuiteID);
    console.log(`Test plan id: ${iTestPlanID}`);
    console.log(`Test suite id: ${iTestSuiteID}`);
    let test: te.ITestApi = await connection.getTestApi();
    let tps: ti.TestPoint[] = await test.getPoints(project, iTestPlanID, iTestSuiteID);
    tps.forEach(tp => {
        console.log(`Test point id: ${tp.id} with test case id: ${tp.testCase.id}`);
        if(tp.testCase.id != undefined){
            let iTestCaseID: number = parseInt(tp.testCase.id);
            testIds.push(iTestCaseID);
        }
    });
    return testIds;
}

async function run() {
    try {
        const setSelector: string = tl.getInput("setSelector", true)!;
        let testIds: number[] = [];
        const collectionUri = tl.getVariable('System.TeamFoundationCollectionUri')!;
        const token = tl.getEndpointAuthorization('SystemVssConnection', true)!.parameters.AccessToken;
        const project = tl.getVariable('System.TeamProject')!;
        console.log(`Collection URL: ${collectionUri}`);
        let authHandler = azdev.getPersonalAccessTokenHandler(token); 
        let connection = new azdev.WebApi(collectionUri, authHandler); 
        if(setSelector === 'testCase'){
            const inputString: string | undefined = tl.getInput('testcaseid', true);
            if (inputString == undefined || inputString == '') {
                tl.setResult(tl.TaskResult.Failed, 'Please input test case id');
                return;
            }
            const iTestCaseID: number = parseInt(inputString);
            if (iTestCaseID == 0 || isNaN(iTestCaseID)){
                tl.setResult(tl.TaskResult.Failed, 'Please input test case id is number');
                return;
            }
            console.log('Set automation status for test case ', iTestCaseID);
            testIds.push(iTestCaseID);
        }else{
            testIds = await getListTestCaseId(connection, project);
        }
        
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
        testIds.forEach( async tc => {
            let wi: witInterfaces.WorkItem = await wit.updateWorkItem(null, wijson, tc);
            console.log(`Update success fro test case id : ${tc}`); 
        });
        console.log(`All test cases are updated successfully!`); 
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