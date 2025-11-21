const { exec } = require('child_process');

console.log('Downloading YOLOv8n model...');

const command = 'python -c "from ultralytics import YOLO; YOLO(\'yolov8n.pt\')"';

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error downloading model: ${error}`);
    return;
  }
  
  if (stderr) {
    console.error(`stderr: ${stderr}`);
  }
  
  console.log('YOLOv8n model downloaded successfully!');
  console.log(stdout);
});