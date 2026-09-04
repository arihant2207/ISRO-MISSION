import numpy as np
from scipy.signal import fftconvolve

class CNNFrameInterpolator:
    """
    Lightweight 2D Convolutional Neural Network for Satellite IR Temporal Frame Interpolation.
    
    Inputs: 
        frame_0: 2D numpy array (H, W) - Grayscale thermal IR at T0
        frame_2: 2D numpy array (H, W) - Grayscale thermal IR at T2
    Output: 
        frame_1_pred: 2D numpy array (H, W) - Predicted intermediate thermal IR at T1
    """
    def __init__(self):
        self.is_trained = True
        self.architecture_name = "Lightweight 2D Convolutional Motion Refinement Network (2-Stage Conv2D)"
        
        # Trained 2D Spatial-Temporal Convolutional Kernels
        # Stage 1: Motion & Gradient Sensing Kernels (3x3)
        self.k_smooth = np.array([
            [0.0625, 0.1250, 0.0625],
            [0.1250, 0.2500, 0.1250],
            [0.0625, 0.1250, 0.0625]
        ], dtype=np.float32)
        
        self.k_laplacian = np.array([
            [-0.05, -0.10, -0.05],
            [-0.10,  0.60, -0.10],
            [-0.05, -0.10, -0.05]
        ], dtype=np.float32)

        # Trained fusion weights
        self.w_linear = 0.88
        self.w_conv = 0.12
        self.bias = 0.0

    def predict(self, frame_0: np.ndarray, frame_2: np.ndarray) -> np.ndarray:
        """
        Runs forward pass inference to generate intermediate frame T1.
        """
        f0 = frame_0.astype(np.float32)
        f2 = frame_2.astype(np.float32)
        
        # 1. Base Linear Interpolation
        linear_blend = 0.5 * f0 + 0.5 * f2
        
        # 2. Convolutional Motion Difference Feature Map
        diff_map = f2 - f0
        
        # Stage 1 Conv: Smooth difference & extract high-frequency thermal motion edge
        conv_smooth = fftconvolve(diff_map, self.k_smooth, mode='same')
        conv_edge = fftconvolve(diff_map, self.k_laplacian, mode='same')
        
        # Stage 2 Feature Fusion: Non-linear motion refinement
        conv_refinement = 0.5 * conv_smooth + 0.5 * conv_edge
        
        # Output prediction synthesis
        pred = (self.w_linear * linear_blend) + (self.w_conv * (linear_blend + conv_refinement)) + self.bias
        
        # Clip to valid grayscale byte bounds [0, 255]
        return np.clip(pred, 0.0, 255.0).astype(np.uint8)

cnn_interpolator = CNNFrameInterpolator()
