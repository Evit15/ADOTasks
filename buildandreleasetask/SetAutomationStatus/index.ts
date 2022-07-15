import tl = require('azure-pipelines-task-lib/task');

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