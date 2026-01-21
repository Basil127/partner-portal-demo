from fastapi.routing import APIRouter

from operaclone2.web.api import content, docs, dummy, echo, monitoring, shop

api_router = APIRouter()
api_router.include_router(monitoring.router)
api_router.include_router(docs.router)
api_router.include_router(echo.router, prefix="/echo", tags=["echo"])
api_router.include_router(dummy.router, prefix="/dummy", tags=["dummy"])
api_router.include_router(shop.router, prefix="/shop/v1", tags=["Shop"])
api_router.include_router(content.router, prefix="/content/v1", tags=["Content"])
