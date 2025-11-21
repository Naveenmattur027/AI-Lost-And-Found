import sys
import json
import cv2
import os
from ultralytics import YOLO

def detect_objects(image_path):
    # Check if file exists and is a valid image
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file not found: {image_path}")
    
    # Try to read the image
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image file: {image_path}")
    
    # Load the YOLOv8n model
    model = YOLO('yolov8n.pt')
    
    # Perform object detection
    results = model(img)
    
    # Extract detection results
    detections = []
    for r in results:
        boxes = r.boxes
        for box in boxes:
            # Get box coordinates
            b = box.xyxy[0].cpu().numpy()
            x1, y1, x2, y2 = map(int, b)
            
            # Get confidence and class
            conf = float(box.conf[0].cpu().numpy())
            cls = int(box.cls[0].cpu().numpy())
            class_name = model.names[cls]
            
            # Only include detections with confidence > 0.5
            if conf > 0.5:
                detections.append({
                    'class': class_name,
                    'confidence': conf,
                    'bbox': [x1, y1, x2, y2]
                })
    
    return detections

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python yolo_detector.py <image_path>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    try:
        detections = detect_objects(image_path)
        # Output as JSON
        print(json.dumps(detections))
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)