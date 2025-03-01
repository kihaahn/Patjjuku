# Picture Sudoku Game

A fun and interactive picture-based Sudoku game where you can drag and drop images instead of numbers.

## Features

- Adjustable grid sizes from 4x4 up to 10x10
- Three difficulty levels: Easy, Medium, and Hard
- Draggable picture elements
- Image dock for selecting pictures
- Trash can for removing pictures from the grid
- Reset button to start over
- Celebration animation and sound effects when the puzzle is solved

## How to Play

1. Select a grid size and difficulty level
2. Click the "New Game" button to start
3. Drag pictures from the dock at the bottom to the grid
4. Place each picture so that it appears only once in each row, column, and block (for square grid sizes)
5. Use the trash can to remove pictures from the grid
6. Use the reset button to start over with the same puzzle

## Customization

### Custom Images

You can add your own images to be used in the game:

1. Place your PNG images in the `assets/images/custom` folder
2. The images should be square for best results
3. The game will automatically use your custom images if they are available

### Custom Sound Effects

You can also customize the win sound:

1. Place your sound file in the `assets/sounds` folder
2. Name it `win.mp3` (or update the audio source in the script.js file)

## Browser Support

This game works best in modern browsers that support:

- CSS Grid
- HTML5 Drag and Drop API
- JavaScript ES6 features

## Getting Started

Simply open the `index.html` file in your web browser to play the game. 