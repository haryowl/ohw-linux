const { exec } = require('child_process');
const path = require('path');

console.log('=== Galileosky Multi-Record Parsing Test Suite ===\n');

async function runTest(testFile, description) {
    return new Promise((resolve, reject) => {
        console.log(`Running: ${description}`);
        console.log('=' .repeat(60));
        
        const child = exec(`node ${testFile}`, { cwd: __dirname });
        
        let output = '';
        let errorOutput = '';
        
        child.stdout.on('data', (data) => {
            output += data;
            process.stdout.write(data);
        });
        
        child.stderr.on('data', (data) => {
            errorOutput += data;
            process.stderr.write(data);
        });
        
        child.on('close', (code) => {
            console.log('\n' + '=' .repeat(60));
            if (code === 0) {
                console.log(`✅ ${description} - COMPLETED`);
            } else {
                console.log(`❌ ${description} - FAILED (exit code: ${code})`);
            }
            console.log('');
            
            resolve({
                success: code === 0,
                output,
                errorOutput,
                exitCode: code
            });
        });
        
        child.on('error', (error) => {
            console.log(`❌ ${description} - ERROR: ${error.message}`);
            reject(error);
        });
    });
}

async function runAllTests() {
    const tests = [
        {
            file: 'test-multi-record-parsing.js',
            description: 'Multi-Record Parsing Tests (Synthetic Data)'
        },
        {
            file: 'test-real-data-parsing.js',
            description: 'Real Data Parsing Test (47 Records)'
        }
    ];
    
    const results = [];
    
    for (const test of tests) {
        try {
            const result = await runTest(test.file, test.description);
            results.push({
                ...test,
                ...result
            });
        } catch (error) {
            results.push({
                ...test,
                success: false,
                output: '',
                errorOutput: error.message,
                exitCode: -1
            });
        }
    }
    
    // Summary
    console.log('=== TEST SUMMARY ===');
    console.log('=' .repeat(60));
    
    const passed = results.filter(r => r.success).length;
    const total = results.length;
    
    results.forEach((result, index) => {
        const status = result.success ? '✅ PASSED' : '❌ FAILED';
        console.log(`${index + 1}. ${result.description}: ${status}`);
    });
    
    console.log('\n' + '=' .repeat(60));
    console.log(`Overall Result: ${passed}/${total} tests passed`);
    
    if (passed === total) {
        console.log('🎉 All tests passed! Multi-record parsing is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Check the output above for details.');
    }
    
    return results;
}

// Run all tests
runAllTests().catch(error => {
    console.error('Test suite execution failed:', error);
    process.exit(1);
}); 