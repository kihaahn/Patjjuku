document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const gridSizeSelect = document.getElementById('grid-size');
    const difficultySelect = document.getElementById('difficulty');
    const newGameBtn = document.getElementById('new-game-btn');
    const resetBtn = document.getElementById('reset-btn');
    const sudokuGrid = document.getElementById('sudoku-grid');
    const imageDock = document.getElementById('image-dock');
    const trashCan = document.getElementById('trash-can');
    const winMessage = document.getElementById('win-message');
    
    // Game variables
    let currentGridSize = parseInt(gridSizeSelect.value);
    let currentDifficulty = difficultySelect.value;
    let solution = [];
    let currentGrid = [];
    let prefilledCells = [];
    let images = [];
    let draggingElement = null;
    let winSound = new Audio('assets/sounds/win.mp3');
    
    // Initialize the game
    init();
    
    function init() {
        loadImages().then(() => {
            // Start a new game after images are loaded
            startNewGame();
        });
        
        newGameBtn.addEventListener('click', startNewGame);
        resetBtn.addEventListener('click', resetGame);
        
        // Add drag and drop event listeners
        document.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchstart', startDrag, { passive: false });
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', endDrag);
        
        // Set up trash can
        trashCan.addEventListener('mouseup', dropInTrash);
        trashCan.addEventListener('touchend', dropInTrash);
    }
    
    async function loadImages() {
        // Default images
        const defaultImages = [
            'assets/images/image1.png',
            'assets/images/image2.png',
            'assets/images/image3.png',
            'assets/images/image4.png',
            'assets/images/image5.png',
            'assets/images/image6.png',
            'assets/images/image7.png',
            'assets/images/image8.png',
            'assets/images/image9.png',
            'assets/images/image10.png'
        ];
        
        try {
            // Try to load custom images from the custom folder
            const customImages = [];
            const customPath = 'assets/images/custom/';
            
            // Check for image files named 1.png through 10.png in the custom folder
            for (let i = 1; i <= 10; i++) {
                const imagePath = `${customPath}${i}.png`;
                customImages.push(imagePath);
            }
            
            // If custom images exist, use them, otherwise use default
            const imagesToUse = customImages.length > 0 ? customImages : defaultImages;
            
            // Preload all images and verify they load correctly
            const imagePromises = imagesToUse.map((path, index) => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => resolve(path);
                    img.onerror = () => resolve(defaultImages[index] || 'assets/images/placeholder.png');
                    img.src = path;
                });
            });
            
            // Wait for all images to load and get their final paths
            images = await Promise.all(imagePromises);
            console.log('Successfully loaded images:', images);
            
        } catch (error) {
            console.error("Error loading images:", error);
            images = defaultImages;
        }
    }
    
    function startNewGame() {
        currentGridSize = parseInt(gridSizeSelect.value);
        currentDifficulty = difficultySelect.value;
        
        // Set grid size class
        sudokuGrid.className = 'sudoku-grid size-' + currentGridSize;
        
        // Generate a valid sudoku solution and create a puzzle from it
        generateSudoku();
        
        // Render the grid
        renderGrid();
        
        // Render the image dock
        renderImageDock();
        
        // Clear any conflicts (there shouldn't be any in a new game, but just in case)
        document.querySelectorAll('.conflict').forEach(cell => {
            cell.classList.remove('conflict');
        });
    }
    
    function resetGame() {
        // Reset the current grid to the initial state with only prefilled cells
        currentGrid = Array.from({ length: currentGridSize }, () =>
            Array(currentGridSize).fill(null)
        );
        
        // Add prefilled cells back
        prefilledCells.forEach(cell => {
            const { row, col, value } = cell;
            currentGrid[row][col] = value;
        });
        
        // Re-render the grid
        renderGrid();
        
        // Re-render the image dock
        renderImageDock();
        
        // Clear any conflicts (there shouldn't be any after reset, but just in case)
        document.querySelectorAll('.conflict').forEach(cell => {
            cell.classList.remove('conflict');
        });
    }
    
    function generateSudoku() {
        // Generate a valid sudoku solution
        solution = generateSolution(currentGridSize);
        
        // Create a puzzle by removing some cells
        createPuzzle();
    }
    
    function generateSolution(size) {
        // Generate a valid sudoku solution
        const grid = Array.from({ length: size }, () => Array(size).fill(null));
        
        // Get the block size (square root of grid size, or closest)
        const blockSize = Math.floor(Math.sqrt(size));
        
        // Helper function to check if a value is valid at a position
        const isValid = (grid, row, col, num) => {
            // Check row
            for (let x = 0; x < size; x++) {
                if (grid[row][x] === num) return false;
            }
            
            // Check column
            for (let y = 0; y < size; y++) {
                if (grid[y][col] === num) return false;
            }
            
            // Check block (for sizes that are perfect squares)
            if (blockSize * blockSize === size) {
                const blockRow = Math.floor(row / blockSize) * blockSize;
                const blockCol = Math.floor(col / blockSize) * blockSize;
                
                for (let y = 0; y < blockSize; y++) {
                    for (let x = 0; x < blockSize; x++) {
                        if (grid[blockRow + y][blockCol + x] === num) return false;
                    }
                }
            }
            
            return true;
        };
        
        // Recursive function to fill the grid
        const fillGrid = (grid, row = 0, col = 0) => {
            // If we've filled all rows, the grid is complete
            if (row === size) return true;
            
            // Move to the next row after filling the current row
            if (col === size) return fillGrid(grid, row + 1, 0);
            
            // Skip cells that are already filled
            if (grid[row][col] !== null) return fillGrid(grid, row, col + 1);
            
            // Try each possible value
            const values = Array.from({ length: size }, (_, i) => i + 1);
            // Shuffle values for randomness
            values.sort(() => Math.random() - 0.5);
            
            for (const num of values) {
                if (isValid(grid, row, col, num)) {
                    grid[row][col] = num;
                    
                    // Recursively try to fill the rest of the grid
                    if (fillGrid(grid, row, col + 1)) {
                        return true;
                    }
                    
                    // If we can't complete the grid with this value, backtrack
                    grid[row][col] = null;
                }
            }
            
            // No valid value was found, backtrack
            return false;
        };
        
        // Fill the grid
        fillGrid(grid);
        return grid;
    }
    
    function createPuzzle() {
        // Create a puzzle by removing some cells from the solution
        currentGrid = JSON.parse(JSON.stringify(solution)); // Deep copy
        
        // Determine how many cells to keep pre-filled based on difficulty
        let keepPercentage;
        switch (currentDifficulty) {
            case 'easy':
                keepPercentage = 0.6; // 60% filled
                break;
            case 'medium':
                keepPercentage = 0.45; // 45% filled
                break;
            case 'hard':
                keepPercentage = 0.3; // 30% filled
                break;
            default:
                keepPercentage = 0.45; // Default to medium
        }
        
        // Calculate number of cells to keep
        const totalCells = currentGridSize * currentGridSize;
        const cellsToKeep = Math.floor(totalCells * keepPercentage);
        
        // Create a list of all cell positions
        const positions = [];
        for (let row = 0; row < currentGridSize; row++) {
            for (let col = 0; col < currentGridSize; col++) {
                positions.push({ row, col });
            }
        }
        
        // Shuffle the positions
        positions.sort(() => Math.random() - 0.5);
        
        // Clear cells not in the 'keep' list
        prefilledCells = [];
        for (let i = cellsToKeep; i < totalCells; i++) {
            const { row, col } = positions[i];
            currentGrid[row][col] = null;
        }
        
        // Store prefilled cells
        for (let row = 0; row < currentGridSize; row++) {
            for (let col = 0; col < currentGridSize; col++) {
                if (currentGrid[row][col] !== null) {
                    prefilledCells.push({
                        row,
                        col,
                        value: currentGrid[row][col]
                    });
                }
            }
        }
    }
    
    function renderGrid() {
        // Clear the grid
        sudokuGrid.innerHTML = '';
        
        // Calculate the block size
        const blockSize = Math.floor(Math.sqrt(currentGridSize));
        const isPerfectSquare = blockSize * blockSize === currentGridSize;
        
        // Create cells
        for (let row = 0; row < currentGridSize; row++) {
            for (let col = 0; col < currentGridSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Add borders for block visualization (for perfect square sizes)
                if (isPerfectSquare) {
                    if ((col + 1) % blockSize === 0 && col < currentGridSize - 1) {
                        cell.classList.add('border-right');
                    }
                    if ((row + 1) % blockSize === 0 && row < currentGridSize - 1) {
                        cell.classList.add('border-bottom');
                    }
                }
                
                // If the cell has a value, add the image
                if (currentGrid[row][col] !== null) {
                    const value = currentGrid[row][col];
                    const imageIndex = value - 1;
                    
                    // Create image element
                    const img = document.createElement('img');
                    img.draggable = false; // Prevent default drag behavior
                    img.alt = `Image ${value}`;
                    img.dataset.value = value; // Set value in dataset for dragging
                    
                    // Ensure the image source exists and is valid
                    if (images[imageIndex] && images[imageIndex].startsWith('assets/')) {
                        img.src = images[imageIndex];
                        console.log(`Cell (${row},${col}): Set image src to ${img.src}`);
                    } else {
                        console.error(`Invalid image at index ${imageIndex}:`, images[imageIndex]);
                        img.src = 'assets/images/placeholder.png';
                    }
                    
                    // Add error handler to fallback to placeholder
                    img.onerror = () => {
                        console.error(`Failed to load image at index ${imageIndex}`);
                        img.src = 'assets/images/placeholder.png';
                    };
                    
                    cell.appendChild(img);
                    
                    // Mark prefilled cells
                    const isPrefilled = prefilledCells.some(
                        c => c.row === row && c.col === col
                    );
                    if (isPrefilled) {
                        cell.classList.add('prefilled');
                        img.classList.add('prefilled-image');
                    }
                }
                
                sudokuGrid.appendChild(cell);
            }
        }
    }
    
    function renderImageDock() {
        // Clear the dock
        imageDock.innerHTML = '';
        
        // Add images to the dock (one for each number in the sudoku)
        for (let i = 0; i < currentGridSize; i++) {
            const dockItem = document.createElement('div');
            dockItem.className = 'dock-item';
            
            // Create image element
            const img = document.createElement('img');
            img.draggable = false; // Prevent default drag behavior
            img.alt = `Image ${i + 1}`;
            img.dataset.value = i + 1;
            
            // Ensure the image source exists and is valid
            if (images[i] && images[i].startsWith('assets/')) {
                img.src = images[i];
            } else {
                console.error(`Invalid dock image at index ${i}:`, images[i]);
                img.src = 'assets/images/placeholder.png';
            }
            
            // Add error handler to fallback to placeholder
            img.onerror = () => {
                console.error(`Failed to load dock image at index ${i}`);
                img.src = 'assets/images/placeholder.png';
            };
            
            dockItem.appendChild(img);
            imageDock.appendChild(dockItem);
        }
    }
    
    // Drag and drop functionality
    function startDrag(e) {
        // Only allow dragging from dock items or non-prefilled grid cells
        const target = e.target.closest('.dock-item img, .grid-cell:not(.prefilled) img');
        if (!target) {
            console.log('Drag prevented on element:', e.target);
            return;
        }
        
        // Prevent default behavior
        e.preventDefault();
        
        // Get the touch or mouse position
        const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
        
        // Create a new dragging container
        draggingElement = document.createElement('div');
        draggingElement.classList.add('dragging');
        
        // Create and add the image to the container
        const img = document.createElement('img');
        img.src = target.src;
        img.alt = target.alt;
        img.dataset.value = target.dataset.value;
        draggingElement.appendChild(img);
        
        // Add to document body
        document.body.appendChild(draggingElement);
        
        // Store the data value
        draggingElement.dataset.value = target.dataset.value;
        
        // Store the original image src
        draggingElement.dataset.originalSrc = target.src;
        console.log('Stored original image src:', target.src);
        
        // If dragging from a cell, store the position
        const cell = target.closest('.grid-cell');
        if (cell) {
            draggingElement.dataset.fromRow = cell.dataset.row;
            draggingElement.dataset.fromCol = cell.dataset.col;
            console.log('Dragging from cell:', cell.dataset.row, cell.dataset.col);
        } else {
            console.log('Dragging from dock');
        }
        
        // Highlight valid drop targets (non-prefilled cells)
        const emptyCells = document.querySelectorAll('.grid-cell:not(.prefilled)');
        emptyCells.forEach(cell => {
            cell.classList.add('highlight-target');
        });
        
        // Position the dragging element
        positionDraggingElement(clientX, clientY);
    }
    
    function drag(e) {
        if (!draggingElement) return;
        
        // Prevent default behavior
        e.preventDefault();
        
        // Get the touch or mouse position
        const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
        
        // Position the dragging element
        positionDraggingElement(clientX, clientY);
    }
    
    function positionDraggingElement(x, y) {
        if (!draggingElement) return;
        
        // Position the element at the cursor - using transform for centering
        draggingElement.style.left = `${x}px`;
        draggingElement.style.top = `${y}px`;
    }
    
    function endDrag(e) {
        if (!draggingElement) return;
        
        // Prevent default behavior
        e.preventDefault();
        
        console.log('Drag ended with element value:', draggingElement.dataset.value);
        console.log('Original image src:', draggingElement.dataset.originalSrc);
        
        // Remove highlighting from cells
        const highlightedCells = document.querySelectorAll('.highlight-target');
        highlightedCells.forEach(cell => {
            cell.classList.remove('highlight-target');
        });
        
        // Get the touch or mouse position
        const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX) || 0;
        const clientY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY) || 0;
        
        // Find the element under the cursor
        const elementsUnder = document.elementsFromPoint(clientX, clientY);
        const cellUnder = elementsUnder.find(el => el.classList.contains('grid-cell'));
        
        if (cellUnder && !cellUnder.classList.contains('prefilled')) {
            // Get the cell position
            const row = parseInt(cellUnder.dataset.row);
            const col = parseInt(cellUnder.dataset.col);
            
            // Get the value being dragged
            const value = parseInt(draggingElement.dataset.value);
            
            // If dragging from another cell, clear that cell
            if (draggingElement.dataset.fromRow && draggingElement.dataset.fromCol) {
                const fromRow = parseInt(draggingElement.dataset.fromRow);
                const fromCol = parseInt(draggingElement.dataset.fromCol);
                
                // Log the move for debugging
                console.log(`Moving from (${fromRow},${fromCol}) to (${row},${col})`);
                
                // Only clear the source cell if it's not the same as the destination
                if (fromRow !== row || fromCol !== col) {
                    // Update data model
                    currentGrid[fromRow][fromCol] = null;
                    
                    // Update UI - find and clear the source cell
                    const sourceCell = document.querySelector(`.grid-cell[data-row="${fromRow}"][data-col="${fromCol}"]`);
                    if (sourceCell) {
                        sourceCell.innerHTML = '';
                    }
                } else {
                    // If dropping in the same cell, just remove dragging element and exit
                    if (draggingElement.parentNode) {
                        draggingElement.parentNode.removeChild(draggingElement);
                    }
                    draggingElement = null;
                    return;
                }
            } else {
                console.log(`Placing new image at (${row},${col})`);
            }
            
            // Update the grid with the new value
            currentGrid[row][col] = value;
            
            // Create a new image directly instead of calling renderGrid
            if (cellUnder.querySelector('img')) {
                cellUnder.innerHTML = ''; // Clear existing content
            }
            
            const img = document.createElement('img');
            img.src = draggingElement.dataset.originalSrc;
            img.alt = `Image ${value}`;
            img.draggable = false;
            img.dataset.value = value;
            
            console.log('Adding image to cell with src:', img.src);
            cellUnder.appendChild(img);
            
            // Check for conflicts
            checkForConflicts();
            
            // Check if the puzzle is solved
            if (isSolved()) {
                celebrate();
            }
        } else if (cellUnder) {
            console.log('Cannot drop on prefilled cell');
        } else {
            console.log('No valid drop target found');
        }
        
        // Remove the dragging element
        if (draggingElement.parentNode) {
            draggingElement.parentNode.removeChild(draggingElement);
        }
        draggingElement = null;
    }
    
    function dropInTrash(e) {
        // Check if we're dragging and dropping in the trash
        if (!draggingElement) return;
        
        // Prevent default behavior
        e.preventDefault();
        
        // Remove highlighting from cells
        const highlightedCells = document.querySelectorAll('.highlight-target');
        highlightedCells.forEach(cell => {
            cell.classList.remove('highlight-target');
        });
        
        // If dragging from a cell, clear that cell
        if (draggingElement.dataset.fromRow && draggingElement.dataset.fromCol) {
            const fromRow = parseInt(draggingElement.dataset.fromRow);
            const fromCol = parseInt(draggingElement.dataset.fromCol);
            
            // Update data model
            currentGrid[fromRow][fromCol] = null;
            
            // Update UI directly without calling renderGrid
            const sourceCell = document.querySelector(`.grid-cell[data-row="${fromRow}"][data-col="${fromCol}"]`);
            if (sourceCell) {
                sourceCell.innerHTML = '';
            }
            
            // Check for conflicts after removing the piece
            checkForConflicts();
        }
        
        // Remove the dragging element
        if (draggingElement.parentNode) {
            draggingElement.parentNode.removeChild(draggingElement);
        }
        draggingElement = null;
    }
    
    function isSolved() {
        console.log("Checking if puzzle is solved...");
        
        // Print current grid and solution for debugging
        console.log("Current grid:", JSON.stringify(currentGrid));
        console.log("Solution:", JSON.stringify(solution));
        
        // Check if the current grid matches the solution
        for (let row = 0; row < currentGridSize; row++) {
            for (let col = 0; col < currentGridSize; col++) {
                if (currentGrid[row][col] !== solution[row][col]) {
                    console.log(`Mismatch at (${row},${col}): current=${currentGrid[row][col]}, solution=${solution[row][col]}`);
                    return false;
                }
            }
        }
        console.log("Puzzle is solved!");
        return true;
    }
    
    function checkForConflicts() {
        // Clear any existing conflicts
        document.querySelectorAll('.conflict').forEach(cell => {
            cell.classList.remove('conflict');
        });
        
        // Check for row conflicts
        for (let row = 0; row < currentGridSize; row++) {
            const valuesInRow = new Map();
            for (let col = 0; col < currentGridSize; col++) {
                const value = currentGrid[row][col];
                if (value !== null) {
                    if (valuesInRow.has(value)) {
                        // Found a conflict in this row
                        const conflictCol = valuesInRow.get(value);
                        highlightConflict(row, conflictCol);
                        highlightConflict(row, col);
                    } else {
                        valuesInRow.set(value, col);
                    }
                }
            }
        }
        
        // Check for column conflicts
        for (let col = 0; col < currentGridSize; col++) {
            const valuesInCol = new Map();
            for (let row = 0; row < currentGridSize; row++) {
                const value = currentGrid[row][col];
                if (value !== null) {
                    if (valuesInCol.has(value)) {
                        // Found a conflict in this column
                        const conflictRow = valuesInCol.get(value);
                        highlightConflict(conflictRow, col);
                        highlightConflict(row, col);
                    } else {
                        valuesInCol.set(value, row);
                    }
                }
            }
        }
        
        // Check for block conflicts (for perfect square sizes)
        const blockSize = Math.floor(Math.sqrt(currentGridSize));
        if (blockSize * blockSize === currentGridSize) {
            for (let blockRow = 0; blockRow < blockSize; blockRow++) {
                for (let blockCol = 0; blockCol < blockSize; blockCol++) {
                    const valuesInBlock = new Map();
                    
                    // Check each cell in this block
                    for (let r = 0; r < blockSize; r++) {
                        for (let c = 0; c < blockSize; c++) {
                            const row = blockRow * blockSize + r;
                            const col = blockCol * blockSize + c;
                            const value = currentGrid[row][col];
                            
                            if (value !== null) {
                                if (valuesInBlock.has(value)) {
                                    // Found a conflict in this block
                                    const conflict = valuesInBlock.get(value);
                                    highlightConflict(conflict.row, conflict.col);
                                    highlightConflict(row, col);
                                } else {
                                    valuesInBlock.set(value, { row, col });
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    function highlightConflict(row, col) {
        const cell = document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.classList.add('conflict');
        }
    }
    
    function celebrate() {
        // Show the win message
        winMessage.classList.remove('hidden');
        
        // Play the win sound
        try {
            winSound.play();
        } catch (error) {
            console.error("Error playing sound:", error);
        }
        
        // Add bounce animation to all images in the grid
        const images = sudokuGrid.querySelectorAll('img');
        images.forEach(img => {
            img.classList.add('bouncing');
        });
        
        // Hide the message after 5 seconds
        setTimeout(() => {
            winMessage.classList.add('hidden');
            
            // Remove bounce animation
            images.forEach(img => {
                img.classList.remove('bouncing');
            });
        }, 5000);
    }
}); 