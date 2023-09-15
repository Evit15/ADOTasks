import tl = require('azure-pipelines-task-lib/task');
import * as te from "azure-devops-node-api/TestApi";
import * as azdev from "azure-devops-node-api";
import * as ti from "azure-devops-node-api/interfaces/TestInterfaces";
import ExtendApi = require('./ExtendApi');

function tryParseInt(str:string, errMsg: string) {
    const parsed = parseInt(str, 10);
    if (isNaN(parsed)) {
        throw new Error(`${str} is not a number (${errMsg})`);
    }
    return parsed
}
function throwExpression(errorMessage: string): never {
    throw new Error(errorMessage);
  }
async function run() {
    try {
        const bUseUISelction = tl.getBoolInput('uiSelection', true)!;
        const bGetRecursive = tl.getBoolInput('getRecursive', false)!;
        const bUseLinkToBuild = tl.getBoolInput('linkToArtifact', true)!;
        let sTestPlanID:string = ''
        let sTestSuiteID:string = ''
        if(bUseUISelction){
            sTestPlanID = tl.getInput('testPlan', true)!;
            sTestSuiteID = tl.getInput('testSuite', true)!;
        }else{
            sTestPlanID = tl.getInput('testPlanString', true)!;
            sTestSuiteID = tl.getInput('testSuiteString', true)!;
        }
        const sTestRunOutput = tl.getInput('outputTestRunID', true)!;
        const sTestRunName = tl.getInput('testRunName', true)!;

        const iTestPlanID: number = tryParseInt(sTestPlanID, 'Test Plan ID');
        const iTestSuiteIDs: number[] = sTestSuiteID.split(',').map(function(item) {
            return tryParseInt(item, 'Test Suite ID');
        });
        console.log(`Test plan id: ${iTestPlanID}`);
        console.log(`Test suite id: ${iTestSuiteIDs}`);
        const collectionUri = tl.getVariable('System.TeamFoundationCollectionUri')!;
        const token = tl.getEndpointAuthorization('SystemVssConnection', true)!.parameters.AccessToken;
        const project = tl.getVariable('System.TeamProject')!;
        console.log(`Collection URL: ${collectionUri}`);
        let authHandler = azdev.getPersonalAccessTokenHandler(token); 
        let connection = new azdev.WebApi(collectionUri, authHandler); 
        let test: te.ITestApi = await connection.getTestApi();
        let pointIds: number[] = []
        await Promise.all(iTestSuiteIDs.map(async (suiteid) => {
            let tps: ti.TestPoint[] = await test.getPoints(project, iTestPlanID, suiteid);
            const tpsConst = tps ?? throwExpression("Test Plan ID or Test Suite ID is not exist ") 
            tpsConst.forEach(tp => {
                console.log(`Test point id: ${tp.id}`);
                pointIds.push(tp.id)
            });
        }));
        if(bGetRecursive){
            const extendapi = new ExtendApi.ExtendApi(collectionUri, [authHandler]);
            const testSuite: ti.TestSuite = await extendapi.getTestSuitesForPlan(project, iTestPlanID, true);
            console.log(`Test suite name _____: ${testSuite.name}`);
        }
        //const extendapi = new ExtendApi.ExtendApi(collectionUri, [authHandler]);
        //const testPlan: ti.TestPlan = await extendapi.getTestPlanById(project, iTestPlanID);
        const testplanid: ti.ShallowReference = {
            id: `${iTestPlanID}`
        }
        let testRunModel: ti.RunCreateModel = {
            name: `${sTestRunName}`,
            plan: testplanid,
            configurationIds: [],
            pointIds: pointIds,
            automated: true
        };
        // associate with Release
        const releaseid = tl.getVariable('Release.ReleaseId');
        console.log(`Release id: ${releaseid}`);
        if(releaseid != undefined){
            const releasename = tl.getVariable('Release.ReleaseName');
            const releaseuri = tl.getVariable('Release.ReleaseUri');
            const releaseenvuri = tl.getVariable('Release.EnvironmentUri');
            console.log(`Release name: ${releasename}`);
            console.log(`Release uri: ${releaseuri}`);
            console.log(`Release env uri: ${releaseenvuri}`);
            let releaseref: ti.ReleaseReference = {
                id: parseInt(releaseid),
                name: releasename
            };
            testRunModel.releaseReference = releaseref;
            testRunModel.releaseUri = releaseuri;
            testRunModel.releaseEnvironmentUri = releaseenvuri;

            if(bUseLinkToBuild){
                const sBuildArtifactName = tl.getInput('testArtifact', true)!;
                const buildNumber = tl.getVariable(`RELEASE_ARTIFACTS_${sBuildArtifactName}_BUILDNUMBER`);
                const buildID = tl.getVariable(`RELEASE_ARTIFACTS_${sBuildArtifactName}_BUILDID`);
                const buildurl = tl.getVariable(`RELEASE_ARTIFACTS_${sBuildArtifactName}_BUILDURI`);
                if(buildNumber != undefined && buildID != undefined){
                    console.log(`Build number: ${buildNumber}`);
                    console.log(`Build id: ${buildID}`);
                    console.log(`Build uri: ${buildurl}`);
                    let buildConfig: ti.BuildConfiguration = {
                        number: buildNumber,
                        id: parseInt(buildID),
                        uri: buildurl
                    }
                    let buildRef: ti.ShallowReference = {
                        id: buildID,
                        name: buildNumber,
                        url: buildurl
                    };
                    testRunModel.buildReference = buildConfig
                    testRunModel.build = buildRef
                }else{
                    console.warn(`Build number of variable RELEASE_ARTIFACTS_${sBuildArtifactName}_BUILDNUMBER not exist`);
                }
            }
        }
        
        let testRunNew: ti.TestRun = await test.createTestRun(testRunModel, project)
        console.log(`Test run id: ${testRunNew.id}`);

        tl.setVariable(sTestRunOutput, `${testRunNew.id}`);
        tl.setResult(tl.TaskResult.Succeeded, `Test run id: ${testRunNew.id}`);

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