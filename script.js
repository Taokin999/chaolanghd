document.addEventListener('DOMContentLoaded', () => {
    // Canvas setup
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;
    
    // Drawing state
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    
    // Tool settings
    let brushColor = '#000000';
    let brushSize = 5;
    
    // Symmetry settings
    let horizontalSymmetry = false;
    let verticalSymmetry = false;
    let centralSymmetry = false;
    let showAxis = false;
    
    // DOM elements
    const horizontalBtn = document.getElementById('horizontal');
    const verticalBtn = document.getElementById('vertical');
    const centralBtn = document.getElementById('central');
    const showAxisBtn = document.getElementById('showAxis');
    const brushBtn = document.getElementById('brush');
    const colorPicker = document.getElementById('color');
    const sizePicker = document.getElementById('size');
    const clearBtn = document.getElementById('clear');
    
    // Event listeners for symmetry buttons
    horizontalBtn.addEventListener('click', () => {
        horizontalSymmetry = !horizontalSymmetry;
        horizontalBtn.classList.toggle('active');
        updateCanvas();
    });
    
    verticalBtn.addEventListener('click', () => {
        verticalSymmetry = !verticalSymmetry;
        verticalBtn.classList.toggle('active');
        updateCanvas();
    });
    
    centralBtn.addEventListener('click', () => {
        centralSymmetry = !centralSymmetry;
        centralBtn.classList.toggle('active');
        updateCanvas();
    });
    
    // Event listener for show axis button
    showAxisBtn.addEventListener('click', () => {
        showAxis = !showAxis;
        showAxisBtn.classList.toggle('active');
        updateCanvas();
    });
    
    // Function to update canvas with current drawings and axes
    function updateCanvas() {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Restore user's drawings if available
        if (userDrawingImageData) {
            ctx.putImageData(userDrawingImageData, 0, 0);
        }
        
        // Draw axes if axis display is enabled
        if (showAxis) {
            drawSymmetryAxes();
        }
    }
    
    // Function to draw symmetry axes
    function drawSymmetryAxes() {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Set line properties for axes
        ctx.setLineDash([5, 5]); // Set line as dashed
        ctx.lineWidth = 1;
        
        if (horizontalSymmetry) {
            // Draw horizontal axis
            ctx.beginPath();
            ctx.moveTo(0, centerY);
            ctx.lineTo(canvas.width, centerY);
            ctx.strokeStyle = '#FF0000';
            ctx.stroke();
        }
        
        if (verticalSymmetry) {
            // Draw vertical axis
            ctx.beginPath();
            ctx.moveTo(centerX, 0);
            ctx.lineTo(centerX, canvas.height);
            ctx.strokeStyle = '#0000FF';
            ctx.stroke();
        }
        
        if (centralSymmetry) {
            // Draw center point
            ctx.beginPath();
            ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#00FF00';
            ctx.fill();
        }
        
        // Reset line dash
        ctx.setLineDash([]);
    }
    
    // Store user's drawing
    let userDrawingImageData = null;
    
    // Event listeners for drawing settings
    colorPicker.addEventListener('input', () => {
        brushColor = colorPicker.value;
    });
    
    sizePicker.addEventListener('input', () => {
        brushSize = sizePicker.value;
    });
    
    // Event listener for clear button
    clearBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        userDrawingImageData = null;
        
        // Redraw axes if they are shown
        if (showAxis) {
            drawSymmetryAxes();
        }
    });
    
    // Drawing functions
    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = getPointerPos(canvas, e);
        
        // Create a temporary canvas to store only user drawings
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // If we have previous drawings, copy them to temp canvas
        if (userDrawingImageData) {
            tempCtx.putImageData(userDrawingImageData, 0, 0);
        }
        
        // Draw dots on temp canvas
        drawDotOnContext(tempCtx, lastX, lastY);
        if (horizontalSymmetry) drawDotOnContext(tempCtx, lastX, 2 * (canvas.height / 2) - lastY);
        if (verticalSymmetry) drawDotOnContext(tempCtx, 2 * (canvas.width / 2) - lastX, lastY);
        if (centralSymmetry || (horizontalSymmetry && verticalSymmetry)) 
            drawDotOnContext(tempCtx, 2 * (canvas.width / 2) - lastX, 2 * (canvas.height / 2) - lastY);
        
        // Store user's drawing without axes
        userDrawingImageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Update the main canvas
        updateCanvas();
    }
    
    function drawDotOnContext(context, x, y) {
        context.beginPath();
        context.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        context.fillStyle = brushColor;
        context.fill();
    }
    
    function drawDot(x, y) {
        drawDotOnContext(ctx, x, y);
    }
    
    function stopDrawing() {
        isDrawing = false;
    }
    
    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault(); // Prevent scrolling on touch devices
        
        const [x, y] = getPointerPos(canvas, e);
        
        // Create a temporary canvas to store only user drawings
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Copy previous drawings to temp canvas
        if (userDrawingImageData) {
            tempCtx.putImageData(userDrawingImageData, 0, 0);
        }
        
        // Draw lines on temp canvas
        drawLineOnContext(tempCtx, lastX, lastY, x, y);
        
        // Apply symmetry on temp canvas
        if (horizontalSymmetry) {
            drawLineOnContext(tempCtx, lastX, 2 * (canvas.height / 2) - lastY, x, 2 * (canvas.height / 2) - y);
        }
        
        if (verticalSymmetry) {
            drawLineOnContext(tempCtx, 2 * (canvas.width / 2) - lastX, lastY, 2 * (canvas.width / 2) - x, y);
        }
        
        if (horizontalSymmetry && verticalSymmetry) {
            drawLineOnContext(tempCtx, 2 * (canvas.width / 2) - lastX, 2 * (canvas.height / 2) - lastY, 
                              2 * (canvas.width / 2) - x, 2 * (canvas.height / 2) - y);
        }
        
        if (centralSymmetry) {
            drawLineOnContext(tempCtx, 2 * (canvas.width / 2) - lastX, 2 * (canvas.height / 2) - lastY, 
                              2 * (canvas.width / 2) - x, 2 * (canvas.height / 2) - y);
        }
        
        // Store user's drawing without axes
        userDrawingImageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Update the main canvas
        updateCanvas();
        
        // Update last position
        lastX = x;
        lastY = y;
    }
    
    function drawLineOnContext(context, x1, y1, x2, y2) {
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.strokeStyle = brushColor;
        context.lineWidth = brushSize;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.stroke();
    }
    
    function drawLine(x1, y1, x2, y2) {
        drawLineOnContext(ctx, x1, y1, x2, y2);
    }
    
    function applySymmetry(x1, y1, x2, y2) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        if (horizontalSymmetry) {
            // Draw horizontal symmetry (across the horizontal center line)
            drawLine(x1, 2 * centerY - y1, x2, 2 * centerY - y2);
        }
        
        if (verticalSymmetry) {
            // Draw vertical symmetry (across the vertical center line)
            drawLine(2 * centerX - x1, y1, 2 * centerX - x2, y2);
        }
        
        if (horizontalSymmetry && verticalSymmetry) {
            // Draw diagonal symmetry (combination of horizontal and vertical)
            drawLine(2 * centerX - x1, 2 * centerY - y1, 2 * centerX - x2, 2 * centerY - y2);
        }
        
        if (centralSymmetry) {
            // Draw central symmetry (through the center point)
            // Note: This is equivalent to rotation by 180 degrees around the center
            drawLine(2 * centerX - x1, 2 * centerY - y1, 2 * centerX - x2, 2 * centerY - y2);
        }
    }
    
    // Helper function to get pointer position (mouse or touch)
    function getPointerPos(canvas, e) {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        
        // Handle both mouse and touch events
        if (e.touches && e.touches[0]) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        return [
            clientX - rect.left,
            clientY - rect.top
        ];
    }
    
    // Mouse event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    canvas.addEventListener('mousemove', draw);
    
    // Touch event listeners for mobile devices
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);
    canvas.addEventListener('touchmove', draw);
}); 