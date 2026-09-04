from app.schemas.cyclone import ComponentStatus, ModelStatusResponse

class ModelStatusService:
    @staticmethod
    def get_status() -> ModelStatusResponse:
        return ModelStatusResponse(
            detection=ComponentStatus(
                status="not_connected",
                detail="Cyclone detection neural network model offline / pending training."
            ),
            classification=ComponentStatus(
                status="not_connected",
                detail="Pattern classification model offline / pending dataset alignment."
            ),
            intensity=ComponentStatus(
                status="not_connected",
                detail="Intensity estimation model offline / pending model weights."
            ),
            track_forecast=ComponentStatus(
                status="not_connected",
                detail="AI Track forecasting model offline / pending trajectory model."
            ),
            landfall=ComponentStatus(
                status="not_connected",
                detail="Landfall prediction model offline."
            ),
            temporal_model=ComponentStatus(
                status="prototype",
                detail="Baseline temporal frame interpolation prototype active in demonstration mode."
            ),
            explainability=ComponentStatus(
                status="prototype",
                detail="Attention heatmap and reasoning pipeline visualizer active in prototype mode."
            )
        )

model_service = ModelStatusService()
