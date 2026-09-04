import numpy as np
from typing import List, Dict, Any, Optional
from app.services.frame_service import frame_service
from app.ml.model import cnn_interpolator
from app.ml.evaluate import evaluate_prediction, calculate_mae, calculate_mse, calculate_psnr, calculate_ssim

class TemporalEnhancementService:
    """
    Scientifically Evaluably Temporal Frame Interpolation & Enhancement Pipeline.
    Supports both Linear Temporal Interpolation Baseline and CNN Motion Refinement ML Model.
    Strictly distinguishes OBSERVED intermediate frames from AI-INTERPOLATED frames.
    """
    def __init__(self):
        self.model_status = "TRAINED"
        self.evaluation_status = "EVALUATION_AVAILABLE"

    def get_status(self) -> Dict[str, Any]:
        return {
            "status": "baseline_and_ml_active",
            "model_status": self.model_status,
            "evaluation_status": self.evaluation_status,
            "active_models": [
                {
                    "name": "Linear Temporal Interpolation Baseline",
                    "type": "Non-ML Physical/Linear Pixel Averaging Baseline",
                    "formula": "0.5 * I(T0) + 0.5 * I(T2)"
                },
                {
                    "name": "CNN Temporal Motion Refinement Network",
                    "type": "Lightweight 2D Convolutional Interpolation Model",
                    "architecture": cnn_interpolator.architecture_name
                }
            ],
            "dataset_info": {
                "total_frames": 48,
                "total_triplets": 46,
                "train_triplets": 32, # Frames 0 to 33
                "test_triplets": 14,  # Frames 33 to 47
                "temporal_resolution": "30-min observed → 15-min synthesized"
            },
            "provenance": "INSAT-3D IR 10.8 µm Asset & NOAA IBTrACS v04r01",
            "disclaimer": "AI-interpolated frames are synthetic reconstructions for visualization — not raw satellite observations."
        }

    def interpolate_triplet(
        self, 
        target_frame_id: int, 
        method: str = "ml", 
        cyclone_id: str = "MICHAUNG"
    ) -> Dict[str, Any]:
        """
        Interpolates intermediate target frame T1 given reference frames T0 (target-1) and T2 (target+1).
        """
        all_meta = frame_service.get_all_frames_metadata()
        if not all_meta:
            frame_service.initialize()
            all_meta = frame_service.get_all_frames_metadata()

        total = len(all_meta)
        if target_frame_id < 1 or target_frame_id >= total - 1:
            return {
                "cyclone_id": cyclone_id,
                "status": "invalid_frame",
                "reason": f"Target frame {target_frame_id} must have both preceding (T0) and succeeding (T2) reference frames."
            }

        f0_data = frame_service.get_frame(target_frame_id - 1)
        f1_target_data = frame_service.get_frame(target_frame_id)
        f2_data = frame_service.get_frame(target_frame_id + 1)

        if not f0_data or not f1_target_data or not f2_data:
            return {"status": "error", "reason": "Frame data loading failed."}

        arr0 = f0_data["array"]
        arr1_gt = f1_target_data["array"]
        arr2 = f2_data["array"]

        # Run interpolation according to selected method
        if method.lower() == "linear":
            arr1_pred = (0.5 * arr0.astype(np.float32) + 0.5 * arr2.astype(np.float32)).clip(0, 255).astype(np.uint8)
            method_label = "Linear Temporal Interpolation Baseline"
        else:
            arr1_pred = cnn_interpolator.predict(arr0, arr2)
            method_label = "CNN Temporal Motion Refinement Network"

        # Calculate reconstruction metrics against actual ground-truth frame T1
        metrics = evaluate_prediction(arr1_pred, arr1_gt)
        
        # Calculate pixel difference map
        diff_map = np.abs(arr1_pred.astype(np.int16) - arr1_gt.astype(np.int16)).astype(np.uint8)
        max_diff = int(np.max(diff_map))
        mean_diff = float(np.mean(diff_map))

        # Check train vs test split membership (Train: triplet <= 32, Test: triplet > 32)
        split_membership = "TEST_HELDOUT" if target_frame_id > 32 else "TRAIN_SET"

        return {
            "cyclone_id": cyclone_id,
            "status": "valid",
            "target_frame_id": target_frame_id,
            "input_frame_ids": [target_frame_id - 1, target_frame_id + 1],
            "timestamps": {
                "t0_timestamp": f0_data["timestamp"],
                "t1_target_timestamp": f1_target_data["timestamp"],
                "t2_timestamp": f2_data["timestamp"]
            },
            "method": method_label,
            "method_code": method.lower(),
            "split_membership": split_membership,
            "metrics": metrics,
            "difference_diagnostics": {
                "max_pixel_difference": max_diff,
                "mean_pixel_difference": round(mean_diff, 2)
            },
            "provenance": f0_data["provenance"],
            "disclaimer": "AI-interpolated frame is a synthetic intermediate image — actual T1 frame is used ONLY for evaluation comparison."
        }

    def evaluate_temporal_pipeline(self, cyclone_id: str = "MICHAUNG") -> Dict[str, Any]:
        """
        Evaluates both Linear Baseline and CNN Model on held-out test set triplets (Frames 33 to 47).
        """
        all_meta = frame_service.get_all_frames_metadata()
        if not all_meta:
            frame_service.initialize()
            all_meta = frame_service.get_all_frames_metadata()

        # Test set target frame range: 33 to 46
        test_frame_ids = list(range(33, len(all_meta) - 1))
        
        linear_maes, linear_mses, linear_psnrs, linear_ssims = [], [], [], []
        ml_maes, ml_mses, ml_psnrs, ml_ssims = [], [], [], []

        for fid in test_frame_ids:
            res_lin = self.interpolate_triplet(target_frame_id=fid, method="linear", cyclone_id=cyclone_id)
            res_ml = self.interpolate_triplet(target_frame_id=fid, method="ml", cyclone_id=cyclone_id)

            if res_lin.get("status") == "valid" and res_ml.get("status") == "valid":
                m_lin = res_lin["metrics"]
                linear_maes.append(m_lin["mae"])
                linear_mses.append(m_lin["mse"])
                linear_psnrs.append(m_lin["psnr_db"])
                linear_ssims.append(m_lin["ssim"])

                m_ml = res_ml["metrics"]
                ml_maes.append(m_ml["mae"])
                ml_mses.append(m_ml["mse"])
                ml_psnrs.append(m_ml["psnr_db"])
                ml_ssims.append(m_ml["ssim"])

        linear_summary = {
            "mae": round(float(np.mean(linear_maes)), 3) if linear_maes else None,
            "mse": round(float(np.mean(linear_mses)), 3) if linear_mses else None,
            "psnr_db": round(float(np.mean(linear_psnrs)), 2) if linear_psnrs else None,
            "ssim": round(float(np.mean(linear_ssims)), 4) if linear_ssims else None
        }

        ml_summary = {
            "mae": round(float(np.mean(ml_maes)), 3) if ml_maes else None,
            "mse": round(float(np.mean(ml_mses)), 3) if ml_mses else None,
            "psnr_db": round(float(np.mean(ml_psnrs)), 2) if ml_psnrs else None,
            "ssim": round(float(np.mean(ml_ssims)), 4) if ml_ssims else None
        }

        # Check if ML model beats linear baseline
        ml_beats_baseline = (
            (ml_summary["ssim"] > linear_summary["ssim"]) and 
            (ml_summary["mae"] < linear_summary["mae"])
        ) if (ml_summary["ssim"] and linear_summary["ssim"]) else False

        return {
            "cyclone_id": cyclone_id,
            "evaluated_test_triplets_count": len(test_frame_ids),
            "test_split_frame_ids": test_frame_ids,
            "comparison_results": {
                "linear_baseline": linear_summary,
                "ml_model": ml_summary
            },
            "ml_beats_baseline": ml_beats_baseline,
            "training_status": "TRAINED",
            "evaluation_status": "EVALUATION_AVAILABLE",
            "train_val_split_method": "Chronological Triplet Split (Train: Triplets 0-31, Test: Triplets 32-45)",
            "provenance": "INSAT-3D IR 10.8 µm Asset & NOAA IBTrACS v04r01",
            "disclaimer": "Evaluated against held-out observed intermediate frames. Zero temporal target frame data was leaked into model inputs."
        }

temporal_service = TemporalEnhancementService()
