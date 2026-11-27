const { PdfLatex, BusyTexRunner, ensureCacheVersion } = require('texlyre-busytex');
const fs = require('fs');

async function test() {
  await ensureCacheVersion();
  const runner = new BusyTexRunner({
    busytexBasePath: './public/core',
    verbose: true
  });
  
  await runner.initialize(false);
  const compiler = new PdfLatex(runner);
  
  const content = fs.readFileSync('test_main.tex', 'utf8');
  
  const result = await compiler.compile({
    input: content,
    mainTexPath: 'main.tex',
    rerun: true
  });
  
  console.log('Success:', result.success);
  console.log('ExitCode:', result.exitCode);
  console.log('Has PDF?', !!result.pdf);
  
  if (result.pdf) {
    fs.writeFileSync('test_output.pdf', result.pdf);
    console.log('PDF saved to test_output.pdf');
  } else {
    console.log('NO PDF WAS RETURNED!');
    // Let's print the last few lines of the log
    const lines = result.log.split('\n');
    console.log(lines.slice(-20).join('\n'));
  }
  
  runner.terminate();
}

test().catch(console.error);
