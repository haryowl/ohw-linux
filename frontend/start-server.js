const { spawn } = require('child_process');
const path = require('path');

// Path to the serve executable
const servePath = path.join(__dirname, 'node_modules', '.bin', 'serve');

// Arguments for serve
const args = ['-s', 'build', '-l', '3002'];

console.log('Starting frontend server...');
console.log('Serve path:', servePath);
console.log('Arguments:', args);

// Spawn the serve process
const serveProcess = spawn(servePath, args, {
    stdio: 'inherit',
    shell: true
});

serveProcess.on('error', (error) => {
    console.error('Failed to start serve:', error);
    process.exit(1);
});

serveProcess.on('exit', (code) => {
    console.log(`Serve process exited with code ${code}`);
    process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('Shutting down frontend server...');
    serveProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
    console.log('Shutting down frontend server...');
    serveProcess.kill('SIGTERM');
}); 