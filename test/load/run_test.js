const { exec, execSync } = require('child_process');
const { readdirSync } = require('fs');
const chalk = require('chalk');

const { sleep } = require('../helpers');

let server;

const runArtilleryTest = async (path) => {
  try {
    const command = './node_modules/artillery/bin/artillery run ' + path + ' --target ' + process.env.HEROKU_URL;
    console.log(command);
    process.stdout.write(`-  Test ${path}\r`);
    execSync(command);
    console.log(chalk.green('\u{2713}'), ' Test ' + path + ' ran successfully');
    return path;
  } catch (error) {
    console.log(chalk.red('\u{2717}'), ' Test ' + path + ' failed');
    const wrappedError = new Error(error);
    wrappedError.file = path;

    throw wrappedError;
  }
}

const runArtillery = async () => {
  try {
    const loadPath = './test/load';
    const dir = await readdirSync(loadPath);
    const tests = dir.filter((fileName) => /\.ya?ml$/.test(fileName));

    const results = await Promise.allSettled(tests.map((testFile) => runArtilleryTest(loadPath + '/' + testFile)));

    console.log('\r\n', chalk.underline('Load test results:'));

    results.forEach(({ status, reason, value }) => {
      console.log(
        status === 'fulfilled'
          ? chalk.green('\u{2713} ')
          : chalk.red('\u{2717} '),
        status === 'fulfilled'
          ? value
          : reason.file
      );
    })

    if (results.some(({ status }) => status === 'rejected')) {
      throw new Error();
    }

  } catch (error) {
    console.log(chalk.red('\r\n\u{2717}'),' Error running artillery')
    throw error;
  }
}

const runTest = async () => {
  try {
    await runArtillery();

    server.kill();

    console.log('\r\n', chalk.green('\u{2713}'), ' Tests ran successfully');
    process.exit(0);
  } catch (error) {
    console.log('\r\n', chalk.red('\u{2717}'), ' Error running tests');
    if (server && server.kill) {
      server.kill();
    }
    process.exit(-1);
  }
}

return runTest();
