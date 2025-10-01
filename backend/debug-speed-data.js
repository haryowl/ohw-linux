const { Buffer } = require('buffer');

// Hex data from the logs
const hexData = "01500010C8D7202D4EA168300C1D4CDDFF55EFD8063300000000342B00350540011A41A25E42C20D450200460000500000510400525A4F533F00E200000000E300000000E404000000E501030000E601000000105A";

console.log('🔍 Analyzing hex data for speed information');
console.log('='.repeat(60));

// Convert hex to buffer
const buffer = Buffer.from(hexData, 'hex');

console.log('Full hex data:', hexData);
console.log('Buffer length:', buffer.length);

// Find the 0x33 tag position
let position = 0;
while (position < buffer.length - 1) {
    const tag = buffer.readUInt8(position);
    if (tag === 0x33) {
        console.log(`\n✅ Found 0x33 tag at position ${position}`);
        
        // Read the speed and direction values (4 bytes total)
        const speedValue = buffer.readUInt16LE(position + 1);
        const directionValue = buffer.readUInt16LE(position + 3);
        
        console.log(`Raw speed value: ${speedValue}`);
        console.log(`Raw direction value: ${directionValue}`);
        console.log(`Calculated speed: ${speedValue / 10} km/h`);
        console.log(`Calculated direction: ${directionValue / 10} degrees`);
        
        break;
    }
    position++;
}

if (position >= buffer.length - 1) {
    console.log('\n❌ 0x33 tag not found in the data');
}

// Let's also check the structure of the packet
console.log('\n📦 Packet structure analysis:');
console.log('='.repeat(60));

// The packet starts with 0x01 (packet type)
const packetType = buffer.readUInt8(0);
console.log(`Packet type: 0x${packetType.toString(16).padStart(2, '0')}`);

// Length is at position 1-2
const packetLength = buffer.readUInt16LE(1);
console.log(`Packet length: ${packetLength}`);

// Start parsing from position 3
let offset = 3;
console.log('\nTags found:');
while (offset < buffer.length - 2) {
    const tag = buffer.readUInt8(offset);
    const tagHex = `0x${tag.toString(16).padStart(2, '0')}`;
    console.log(`  ${tagHex} at position ${offset}`);
    offset++;
} 