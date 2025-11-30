import orjson
from rest_framework.renderers import BaseRenderer


class ORJSONRenderer(BaseRenderer):
    """Fast JSON renderer using orjson."""

    media_type = 'application/json'
    format = 'json'
    charset = None

    def render(self, data, accepted_media_type=None, renderer_context=None):
        if data is None:
            return b''

        return orjson.dumps(
            data,
            option=orjson.OPT_SERIALIZE_NUMPY | orjson.OPT_UTC_Z,
        )
