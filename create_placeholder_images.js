const fs = require('fs');
const { createCanvas } = require('canvas');

// Create the directory if it doesn't exist
if (!fs.existsSync('./assets/images')) {
    fs.mkdirSync('./assets/images', { recursive: true });
}

// Create 10 placeholder images with different colors and numbers
const colors = [
    '#ff6b6b', // Red
    '#48dbfb', // Blue
    '#1dd1a1', // Green
    '#feca57', // Yellow
    '#54a0ff', // Light Blue
    '#5f27cd', // Purple
    '#ff9ff3', // Pink
    '#00d2d3', // Teal
    '#ff6b6b', // Red
    '#48dbfb'  // Blue
];

// Create each image
for (let i = 0; i < 10; i++) {
    const canvas = createCanvas(100, 100);
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 100, 100);
    
    // Draw colored circle
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.arc(50, 50, 40, 0, Math.PI * 2);
    ctx.fill();
    
    // Add number
    ctx.fillStyle = 'white';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((i + 1).toString(), 50, 50);
    
    // Save to file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`./assets/images/image${i + 1}.png`, buffer);
    
    console.log(`Created image${i + 1}.png`);
}

// Create a placeholder image
const placeholderCanvas = createCanvas(100, 100);
const placeholderCtx = placeholderCanvas.getContext('2d');

// Fill background
placeholderCtx.fillStyle = '#f0f0f0';
placeholderCtx.fillRect(0, 0, 100, 100);

// Draw question mark
placeholderCtx.fillStyle = '#777';
placeholderCtx.font = 'bold 60px Arial';
placeholderCtx.textAlign = 'center';
placeholderCtx.textBaseline = 'middle';
placeholderCtx.fillText('?', 50, 50);

// Save to file
const placeholderBuffer = placeholderCanvas.toBuffer('image/png');
fs.writeFileSync('./assets/images/placeholder.png', placeholderBuffer);

console.log('Created placeholder.png');

console.log('All placeholder images created successfully!'); 