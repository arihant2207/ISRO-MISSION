import numpy as np
import math
from typing import Dict, Any, Tuple

def calculate_mae(img1: np.ndarray, img2: np.ndarray) -> float:
    """Mean Absolute Error (MAE) between two image matrices."""
    return round(float(np.mean(np.abs(img1.astype(np.float64) - img2.astype(np.float64)))), 3)

def calculate_mse(img1: np.ndarray, img2: np.ndarray) -> float:
    """Mean Squared Error (MSE) between two image matrices."""
    return round(float(np.mean(np.square(img1.astype(np.float64) - img2.astype(np.float64)))), 3)

def calculate_psnr(img1: np.ndarray, img2: np.ndarray) -> float:
    """Peak Signal-to-Noise Ratio (PSNR in dB) between two image matrices."""
    mse = np.mean(np.square(img1.astype(np.float64) - img2.astype(np.float64)))
    if mse == 0:
        return 100.0
    max_pixel = 255.0
    psnr = 10.0 * math.log10((max_pixel ** 2) / mse)
    return round(float(psnr), 2)

def calculate_ssim(img1: np.ndarray, img2: np.ndarray) -> float:
    """Structural Similarity Index (SSIM) between two image matrices."""
    x = img1.astype(np.float64)
    y = img2.astype(np.float64)
    
    c1 = (0.01 * 255.0) ** 2
    c2 = (0.03 * 255.0) ** 2
    
    mu_x = np.mean(x)
    mu_y = np.mean(y)
    
    sigma_x_sq = np.var(x)
    sigma_y_sq = np.var(y)
    sigma_xy = float(np.cov(x.flat, y.flat)[0, 1]) if x.size > 1 else 0.0
    
    num = (2 * mu_x * mu_y + c1) * (2 * sigma_xy + c2)
    den = (mu_x**2 + mu_y**2 + c1) * (sigma_x_sq + sigma_y_sq + c2)
    
    ssim_val = num / max(1e-6, den)
    return round(float(np.clip(ssim_val, 0.0, 1.0)), 4)

def evaluate_prediction(pred_img: np.ndarray, target_img: np.ndarray) -> Dict[str, float]:
    """Calculate complete metric suite: MAE, MSE, PSNR, SSIM."""
    return {
        "mae": calculate_mae(pred_img, target_img),
        "mse": calculate_mse(pred_img, target_img),
        "psnr_db": calculate_psnr(pred_img, target_img),
        "ssim": calculate_ssim(pred_img, target_img)
    }
